"""Motor de backtest de Lab: simula órdenes sobre velas de 1 minuto con bid/ask reales.

Reglas de ejecución (conservadoras a propósito):
- Largo entra al ask y sale al bid; corto al revés. El spread real de Dukascopy se puede
  multiplicar (spread_mult) para simular un broker más caro.
- Orden 'market': se llena en el open del primer minuto activo, más slippage.
- Orden 'stop': se llena cuando el precio toca el nivel, al peor entre nivel y open, más slippage.
- Orden 'limit': se llena si el precio cruza el nivel, al mejor entre nivel y open (sin slippage).
- Stop loss: al peor entre stop y open, más slippage. TP: exacto (es una orden límite).
- Si stop y TP caen en el mismo minuto, cuenta el stop. En el minuto de entrada solo se mira el stop.
- Cierre forzado por tiempo máximo y antes del fin de semana (viernes 20:45 UTC).
- Una sola posición a la vez: las órdenes que aparecen con una posición abierta se descartan.
Toda señal se calcula con velas cerradas y la orden recién se activa en el minuto siguiente.
"""
import numpy as np
import pandas as pd
from numba import njit

MARKET, STOP, LIMIT = 0, 1, 2


@njit(cache=True)
def _fill(k, i, n, flat, bo, ao, bh, bl, ah, al, o_side, o_type, o_px, o_exp, slip):
    s = o_side[k]
    last = min(n - 1, i + o_exp[k])
    for t in range(i, last + 1):
        if flat[t]:
            return -1, 0.0
        if s == 1:
            if o_type[k] == MARKET:
                return t, ao[t] + slip
            if o_type[k] == STOP and ah[t] >= o_px[k]:
                return t, max(o_px[k], ao[t]) + slip
            if o_type[k] == LIMIT and al[t] <= o_px[k]:
                return t, min(o_px[k], ao[t])
        else:
            if o_type[k] == MARKET:
                return t, bo[t] - slip
            if o_type[k] == STOP and bl[t] <= o_px[k]:
                return t, min(o_px[k], bo[t]) - slip
            if o_type[k] == LIMIT and bh[t] >= o_px[k]:
                return t, max(o_px[k], bo[t])
    return -1, 0.0


@njit(cache=True)
def _sim(bo, bh, bl, bc, ao, ah, al, ac, flat, o_i, o_side, o_type, o_px, o_sl, o_tp, o_exp, o_hold, slip):
    n_ord = len(o_i)
    n = len(bo)
    e_i = np.full(n_ord, -1, np.int64)
    x_i = np.full(n_ord, -1, np.int64)
    e_px = np.zeros(n_ord)
    x_px = np.zeros(n_ord)
    why = np.zeros(n_ord, np.int64)  # 1 stop, 2 tp, 3 tiempo, 4 fin de semana
    busy_until = -1
    for k in range(n_ord):
        i = o_i[k]
        if i < 0 or i <= busy_until or i >= n:
            continue
        j, px = _fill(k, i, n, flat, bo, ao, bh, bl, ah, al, o_side, o_type, o_px, o_exp, slip)
        # OCO: dos órdenes stop opuestas con el mismo inicio; se queda la que se llena primero
        if k + 1 < n_ord and o_i[k + 1] == i and o_type[k] == STOP and o_type[k + 1] == STOP:
            j2, px2 = _fill(k + 1, i, n, flat, bo, ao, bh, bl, ah, al, o_side, o_type, o_px, o_exp, slip)
            if j2 >= 0 and (j < 0 or j2 < j):
                continue  # la orden k+1 se procesa en la siguiente vuelta
            if j >= 0:
                o_i[k + 1] = -10  # cancelada
        s = o_side[k]
        if j < 0:
            continue
        # descartar entradas que ya nacen detrás del stop (gap)
        if (s == 1 and px <= o_sl[k]) or (s == -1 and px >= o_sl[k]):
            continue
        sl, tp = o_sl[k], o_tp[k]
        # 2) salida
        end = min(n - 1, j + o_hold[k])
        xi, xp, w = -1, 0.0, 0
        for t in range(j, end + 1):
            if t > j and flat[t]:
                xi, w = t, 4
                xp = bo[t] if s == 1 else ao[t]
                break
            if s == 1:
                if bl[t] <= sl:
                    xi, xp, w = t, min(sl, bo[t] if t > j else sl) - slip, 1
                    break
                if t > j and bh[t] >= tp:
                    xi, xp, w = t, max(tp, bo[t]), 2
                    break
            else:
                if ah[t] >= sl:
                    xi, xp, w = t, max(sl, ao[t] if t > j else sl) + slip, 1
                    break
                if t > j and al[t] <= tp:
                    xi, xp, w = t, min(tp, ao[t]), 2
                    break
        if xi < 0:
            xi, w = end, 3
            xp = bc[end] if s == 1 else ac[end]
        e_i[k], x_i[k], e_px[k], x_px[k], why[k] = j, xi, px, xp, w
        busy_until = xi
    return e_i, x_i, e_px, x_px, why


class Market:
    """Velas de 1m con bid/ask; índice UTC."""

    def __init__(self, df1m: pd.DataFrame):
        self.df = df1m
        self.ts = df1m.index.values
        ts = df1m.index
        # cierre forzado antes del fin de semana: viernes desde 20:45 UTC
        self.flat = np.asarray((ts.dayofweek == 4) & ((ts.hour > 20) | ((ts.hour == 20) & (ts.minute >= 45))))

    def arrays(self, spread_mult=1.0):
        d = self.df
        if spread_mult == 1.0:
            return [d[c].values for c in ("bo", "bh", "bl", "bc", "ao", "ah", "al", "ac")]
        out_b, out_a = [], []
        for x in "ohlc":
            mid = (d["b" + x].values + d["a" + x].values) / 2
            half = (d["a" + x].values - d["b" + x].values) / 2 * spread_mult
            out_b.append(mid - half)
            out_a.append(mid + half)
        return out_b + out_a


def run(mkt: Market, orders: pd.DataFrame, spread_mult=1.0, slip=0.05, delay=0):
    """orders: columnas ts_active (UTC), side (+1/-1), type, px, sl, tp, exp (min), hold (min)."""
    if orders is None or len(orders) == 0:
        return pd.DataFrame()
    o = orders.sort_values(["ts_active", "side"], kind="stable").reset_index(drop=True)
    idx = np.searchsorted(mkt.ts, o["ts_active"].values.astype("datetime64[ns]")) + delay
    arr = mkt.arrays(spread_mult)
    e_i, x_i, e_px, x_px, why = _sim(*arr, mkt.flat, idx.astype(np.int64).copy(), o["side"].values.astype(np.int64),
                                     o["type"].values.astype(np.int64), o["px"].values.astype(float),
                                     o["sl"].values.astype(float), o["tp"].values.astype(float),
                                     o["exp"].values.astype(np.int64), o["hold"].values.astype(np.int64), slip)
    m = e_i >= 0
    t = pd.DataFrame({"entry_ts": mkt.ts[e_i[m]], "exit_ts": mkt.ts[x_i[m]], "side": o["side"].values[m],
                      "entry": e_px[m], "exit": x_px[m], "sl": o["sl"].values[m], "why": why[m]})
    t["risk"] = (t.entry - t.sl).abs()
    t = t[t.risk > 0]
    t["r_gross"] = (t.exit - t.entry) * t.side / t.risk
    return t.reset_index(drop=True)


def size_and_cost(trades, risk_frac=0.005, balance=5000.0, leverage=30, comm_per_m=15.0, fee_mult=1.0):
    """Tamaño por riesgo fijo sobre el balance inicial, con tope de apalancamiento.
    Comisión: USD 15 por millón negociado por lado (PDF de condiciones de FundedHive, enero 2026),
    multiplicada por fee_mult en el stress test. Cuenta en EUR tratada como USD (aproximación)."""
    t = trades.copy()
    if len(t) == 0:
        return t
    qty = np.minimum(risk_frac * balance / t.risk, leverage * balance / t.entry)
    gross = qty * (t.exit - t.entry) * t.side
    comm = qty * (t.entry + t.exit) * comm_per_m / 1e6 * fee_mult
    t["qty_oz"] = qty
    t["pnl"] = gross - comm
    t["pnl_pct"] = t.pnl / balance * 100
    t["r"] = t.pnl / (risk_frac * balance)
    return t
