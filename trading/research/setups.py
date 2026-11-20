"""Radar: los setups candidatos para XAUUSD, cada uno explicable en una frase.

Cada generador recibe las velas del timeframe (bid, índice = inicio de la vela, UTC) y devuelve
órdenes con ts_active = cierre de la vela que da la señal (nunca antes: sin mirar el futuro).
Sesiones en hora local (Londres / Nueva York) para respetar los cambios de horario.
"""
import numpy as np
import pandas as pd

from engine import LIMIT, MARKET, STOP


def load_hd(data_dir, spread_csv=None, default_spread=0.40):
    """Velas de 1m de HistData (bid, UTC). Ask = bid + spread estimado por año y hora UTC
    (muestra real de Dukascopy en spread_csv) o, si no hay modelo, un spread fijo (estimación).
    HistData no trae volumen: se usa el rango de la vela (alto - bajo) como proxy de actividad."""
    import glob
    fs = sorted(glob.glob(f"{data_dir}/XAUUSD_hd/*.parquet"))
    df = pd.concat([pd.read_parquet(f) for f in fs], ignore_index=True)
    df = df.drop_duplicates("ts").set_index("ts").sort_index()
    df.index = pd.DatetimeIndex(df.index)
    sp = pd.Series(default_spread, index=df.index)
    if spread_csv:
        m = pd.read_csv(spread_csv)
        key = pd.MultiIndex.from_arrays([df.index.year, df.index.hour])
        tab = m.set_index(["year", "hour"]).spread
        v = pd.Series(tab.reindex(key).values, index=df.index)
        by_hour = m.groupby("hour").spread.median()
        v = v.fillna(pd.Series(df.index.hour, index=df.index).map(by_hour)).fillna(default_spread)
        sp = v
    for x in "ohlc":
        df["a" + x] = df["b" + x] + sp.values
    df["spread_est"] = sp.values
    df["vol"] = df.bh - df.bl  # proxy de volumen (HistData no publica volumen)
    return df


def load_1m(data_dir, sym="XAUUSD"):
    import glob
    fs = sorted(glob.glob(f"{data_dir}/{sym}/*.parquet"))
    df = pd.concat([pd.read_parquet(f) for f in fs], ignore_index=True)
    df = df.drop_duplicates("ts").set_index("ts").sort_index()
    df.index = pd.DatetimeIndex(df.index)
    return df


def resample(df1m, minutes):
    if minutes == 1:
        out = df1m.rename(columns={"bo": "o", "bh": "h", "bl": "l", "bc": "c"})[["o", "h", "l", "c", "vol"]].copy()
    else:
        r = df1m.resample(f"{minutes}min", label="left", closed="left")
        out = pd.DataFrame({"o": r.bo.first(), "h": r.bh.max(), "l": r.bl.min(), "c": r.bc.last(),
                            "vol": r.vol.sum()}).dropna()
    out["tf"] = minutes
    return out


def atr(b, n=14):
    pc = b.c.shift()
    tr = np.maximum(b.h - b.l, np.maximum((b.h - pc).abs(), (b.l - pc).abs()))
    return tr.rolling(n).mean()


def _orders(ts, side, typ, px, sl, tp, exp, hold):
    n = len(ts)
    f = lambda x: np.broadcast_to(np.asarray(x, dtype=float), (n,)) if np.ndim(x) == 0 else np.asarray(x, dtype=float)
    return pd.DataFrame({"ts_active": pd.DatetimeIndex(ts), "side": f(side).astype(int), "type": f(typ).astype(int),
                         "px": f(px), "sl": f(sl), "tp": f(tp), "exp": f(exp).astype(int), "hold": f(hold).astype(int)})


def _close_ts(b):
    return b.index + pd.Timedelta(minutes=int(b.tf.iloc[0]))


def _local(b, tz):
    return b.index.tz_localize("UTC").tz_convert(tz)


def _cat(*o):
    o = [x for x in o if x is not None and len(x)]
    return pd.concat(o, ignore_index=True) if o else None


# ---------------------------------------------------------------- rangos de sesión
def _session_range(b, tz, start_h, end_h):
    """Máximo/mínimo de la ventana [start_h, end_h) hora local, por día local."""
    loc = _local(b, tz)
    hour = loc.hour + loc.minute / 60
    day = loc.normalize().tz_localize(None)
    m = (hour >= start_h) & (hour < end_h)
    g = pd.DataFrame({"h": b.h.values[m], "l": b.l.values[m], "d": day[m]}).groupby("d")
    rng = pd.DataFrame({"rh": g.h.max(), "rl": g.l.min()})
    return day, hour, rng


def range_breakout(b, tz, rs, re, trade_until, tp_mult=1.5, sl_mode="mid"):
    """Ruptura del rango de sesión (p. ej. Asia antes de Londres) con órdenes stop en los extremos."""
    day, hour, rng = _session_range(b, tz, rs, re)
    # una sola vez por día: en la primera vela tras el cierre del rango
    first = (hour >= re) & (hour < re + b.tf.iloc[0] / 60)
    idx = np.where(first)[0]
    rows = []
    for i in idx:
        d = day[i]
        if d not in rng.index:
            continue
        rh, rl = rng.loc[d, "rh"], rng.loc[d, "rl"]
        if not (rh > rl):
            continue
        mid = (rh + rl) / 2
        exp = int((trade_until - re) * 60)
        for side, px, sl in ((1, rh, mid if sl_mode == "mid" else rl), (-1, rl, mid if sl_mode == "mid" else rh)):
            risk = abs(px - sl)
            rows.append((b.index[i], side, STOP, px, sl, px + side * tp_mult * risk, exp, exp + 240))
    if not rows:
        return None
    r = pd.DataFrame(rows, columns=["ts_active", "side", "type", "px", "sl", "tp", "exp", "hold"])
    return r


def range_sweep(b, tz, rs, re, trade_until, tp_mode="mid", buf=0.1):
    """Barrida de liquidez: el precio rompe el extremo del rango, la vela cierra de vuelta adentro
    y se opera la reversión (los stops cazados alimentan el giro)."""
    day, hour, rng = _session_range(b, tz, rs, re)
    a = atr(b)
    win = (hour >= re) & (hour < trade_until)
    rh = pd.Series(day).map(rng.rh).values
    rl = pd.Series(day).map(rng.rl).values
    short = win & (b.h.values > rh) & (b.c.values < rh)
    long_ = win & (b.l.values < rl) & (b.c.values > rl)
    ts = _close_ts(b)
    out = []
    for m, side in ((short, -1), (long_, 1)):
        i = np.where(m)[0]
        if not len(i):
            continue
        sl = b.h.values[i] + buf * a.values[i] if side == -1 else b.l.values[i] - buf * a.values[i]
        tgt = (rh[i] + rl[i]) / 2 if tp_mode == "mid" else (rl[i] if side == -1 else rh[i])
        ok = (tgt - b.c.values[i]) * side > 0
        out.append(_orders(ts[i][ok], side, MARKET, 0, sl[ok], tgt[ok], 1, 240))
    o = _cat(*out)
    if o is None:
        return None
    # una sola señal por día y dirección
    o["d"] = o.ts_active.dt.normalize()
    return o.drop_duplicates(["d", "side"]).drop(columns="d")


def prev_day_levels(b, mode="breakout", tp_mult=2.0, hours=(7, 17)):
    """Máximo/mínimo del día anterior: ruptura con cierre fuera, o barrida y vuelta (mode='sweep')."""
    d = b.index.normalize()
    daily = b.groupby(d).agg(h=("h", "max"), l=("l", "min"))
    pdh = pd.Series(d).map(daily.h.shift()).values
    pdl = pd.Series(d).map(daily.l.shift()).values
    a = atr(b).values
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    c, h, l, pc = b.c.values, b.h.values, b.l.values, b.c.shift().values
    ts = _close_ts(b)
    out = []
    if mode == "breakout":
        up = win & (c > pdh) & (pc <= pdh)
        dn = win & (c < pdl) & (pc >= pdl)
        for m, s in ((up, 1), (dn, -1)):
            i = np.where(m)[0]
            sl = c[i] - s * 1.0 * a[i]
            out.append(_orders(ts[i], s, MARKET, 0, sl, c[i] + s * tp_mult * a[i], 1, 240))
    else:
        dn = win & (h > pdh) & (c < pdh)
        up = win & (l < pdl) & (c > pdl)
        for m, s in ((up, 1), (dn, -1)):
            i = np.where(m)[0]
            sl = (l[i] - 0.2 * a[i]) if s == 1 else (h[i] + 0.2 * a[i])
            risk = np.abs(c[i] - sl)
            out.append(_orders(ts[i], s, MARKET, 0, sl, c[i] + s * tp_mult * risk, 1, 240))
    o = _cat(*out)
    if o is None:
        return None
    o["d"] = o.ts_active.dt.normalize()
    return o.drop_duplicates(["d", "side"]).drop(columns="d")


def vwap_pullback(b, ema_n=50, tp_r=2.0, atr_sl=1.0, hours=(7, 20)):
    """En tendencia (precio y EMA a un lado del VWAP del día), comprar/vender el retroceso al VWAP."""
    d = b.index.normalize()
    tp_ = (b.h + b.l + b.c) / 3
    v = b.vol.replace(0, np.nan).fillna(1e-9)
    vwap = (tp_ * v).groupby(d).cumsum() / v.groupby(d).cumsum()
    ema = b.c.ewm(span=ema_n, adjust=False).mean()
    a = atr(b)
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    up = win & (ema > vwap) & (ema > ema.shift(5)) & (b.l <= vwap) & (b.c > vwap)
    dn = win & (ema < vwap) & (ema < ema.shift(5)) & (b.h >= vwap) & (b.c < vwap)
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        sl = c - s * atr_sl * a.values[i]
        out.append(_orders(ts[i], s, MARKET, 0, sl, c + s * tp_r * atr_sl * a.values[i], 1, 180))
    return _cat(*out)


def ema_pullback(b, fast=20, slow=50, tp_r=2.0, atr_sl=1.2, hours=(7, 20)):
    """Tendencia por EMAs; entrada cuando el precio toca la EMA rápida y vuelve a cerrar a favor."""
    ef = b.c.ewm(span=fast, adjust=False).mean()
    es = b.c.ewm(span=slow, adjust=False).mean()
    a = atr(b)
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    up = win & (ef > es) & (es > es.shift(10)) & (b.l <= ef) & (b.c > ef) & (b.c > b.o)
    dn = win & (ef < es) & (es < es.shift(10)) & (b.h >= ef) & (b.c < ef) & (b.c < b.o)
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        out.append(_orders(ts[i], s, MARKET, 0, c - s * atr_sl * a.values[i], c + s * tp_r * atr_sl * a.values[i], 1, 240))
    return _cat(*out)


def donchian_volume(b, n=20, vol_mult=1.5, tp_r=2.0, atr_sl=1.0, hours=(7, 20)):
    """Ruptura de rango (máximo de N velas) solo si el volumen de ticks viene subiendo."""
    hh = b.h.rolling(n).max().shift()
    ll = b.l.rolling(n).min().shift()
    va = b.vol.rolling(n).mean().shift()
    a = atr(b)
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    hv = b.vol > vol_mult * va
    up = win & hv & (b.c > hh)
    dn = win & hv & (b.c < ll)
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        out.append(_orders(ts[i], s, MARKET, 0, c - s * atr_sl * a.values[i], c + s * tp_r * atr_sl * a.values[i], 1, 240))
    return _cat(*out)


def rsi(c, n):
    d = c.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn.replace(0, np.nan))


def rsi2_trend(b, trend_n=200, lo=10, hi=90, tp_r=1.5, atr_sl=1.5, hours=(7, 20)):
    """Retroceso corto (RSI de 2 extremo) a favor de la tendencia larga: comprar la caída dentro de una suba."""
    r = rsi(b.c, 2)
    ma = b.c.rolling(trend_n).mean()
    a = atr(b)
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    up = win & (b.c > ma) & (r < lo)
    dn = win & (b.c < ma) & (r > hi)
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        out.append(_orders(ts[i], s, MARKET, 0, c - s * atr_sl * a.values[i], c + s * tp_r * atr_sl * a.values[i], 1, 120))
    return _cat(*out)


def bb_fade_asia(b, n=20, k=2.0, atr_sl=1.0, hours=(0, 6)):
    """En la sesión asiática (rango), vender el cierre por encima de la banda superior hacia la media, y al revés."""
    ma = b.c.rolling(n).mean()
    sd = b.c.rolling(n).std()
    a = atr(b)
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    dn = win & (b.c > ma + k * sd)
    up = win & (b.c < ma - k * sd)
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        out.append(_orders(ts[i], s, MARKET, 0, c - s * atr_sl * a.values[i], ma.values[i], 1, 120))
    return _cat(*out)


def flush_reversal(b, look=3, move_atr=3.0, tp_r=1.5, hours=(0, 24)):
    """Tras una caída (o subida) violenta de varias velas, la primera vela que cierra en contra
    marca el agotamiento de los stops liquidados: se opera la reversión."""
    a = atr(b)
    mv = b.c - b.c.shift(look)
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    up = win & (mv.shift() < -move_atr * a.shift()) & (b.c > b.o)
    dn = win & (mv.shift() > move_atr * a.shift()) & (b.c < b.o)
    lo = b.l.rolling(look + 1).min()
    hi = b.h.rolling(look + 1).max()
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        sl = lo.values[i] - 0.2 * a.values[i] if s == 1 else hi.values[i] + 0.2 * a.values[i]
        risk = np.abs(c - sl)
        out.append(_orders(ts[i], s, MARKET, 0, sl, c + s * tp_r * risk, 1, 180))
    return _cat(*out)


def momentum_burst(b, k=2.5, vol_mult=2.0, tp_r=1.5, hours=(7, 20)):
    """Vela enorme con volumen alto (entra dinero institucional): seguir la dirección con stop bajo la vela."""
    a = atr(b)
    va = b.vol.rolling(50).mean().shift()
    body = b.c - b.o
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    big = (body.abs() > k * a.shift()) & (b.vol > vol_mult * va) & win
    ts = _close_ts(b)
    out = []
    for s in (1, -1):
        i = np.where((big & (np.sign(body) == s)).values)[0]
        c = b.c.values[i]
        sl = b.l.values[i] if s == 1 else b.h.values[i]
        sl = (sl + c) / 2  # media vela: stop más corto
        risk = np.abs(c - sl)
        out.append(_orders(ts[i], s, MARKET, 0, sl, c + s * tp_r * risk, 1, 120))
    return _cat(*out)


def inside_bar(b, tp_r=2.0, hours=(7, 20)):
    """Vela interior (compresión) en tendencia: ruptura con orden stop en el extremo de la vela madre."""
    ib = (b.h < b.h.shift()) & (b.l > b.l.shift())
    ema = b.c.ewm(span=50, adjust=False).mean()
    hr = b.index.hour
    win = (hr >= hours[0]) & (hr < hours[1])
    ts = _close_ts(b)
    out = []
    for s, trend in ((1, b.c > ema), (-1, b.c < ema)):
        i = np.where((ib & trend & win).values)[0]
        mh, ml = b.h.shift().values[i], b.l.shift().values[i]
        px = mh if s == 1 else ml
        sl = ml if s == 1 else mh
        risk = np.abs(px - sl)
        out.append(_orders(ts[i], s, STOP, px, sl, px + s * tp_r * risk, 3, 240))
    return _cat(*out)


def sunday_gap(b, min_gap_atr=1.0):
    """Hueco de apertura del domingo: el oro suele cerrar parte del hueco cuando entra la liquidez asiática."""
    a = atr(b)
    gap_bar = b.index.to_series().diff() > pd.Timedelta(hours=24)
    i = np.where(gap_bar.values)[0]
    i = i[i > 0]
    prev_c = b.c.values[i - 1]
    o = b.o.values[i]
    g = o - prev_c
    ok = np.abs(g) > min_gap_atr * a.values[i - 1]
    i, g, prev_c = i[ok], g[ok], prev_c[ok]
    s = -np.sign(g)
    ts = _close_ts(b)[i]
    c = b.c.values[i]
    sl = c - s * np.abs(g)
    return _orders(ts, s, MARKET, 0, sl, prev_c, 1, 600) if len(i) else None


# --------------------------------------------------------------- catálogo
LDN, NY = "Europe/London", "America/New_York"

CATALOG = {
    # nombre: (descripción en una frase, régimen, función, timeframes, rejilla de parámetros)
    "asia_breakout_london": ("Ruptura del rango asiático en la apertura de Londres", "tendencia",
                             lambda b, **p: range_breakout(b, LDN, 0, 7, 11, **p), [5, 15],
                             {"tp_mult": [1.0, 1.5, 2.0], "sl_mode": ["mid", "far"]}),
    "asia_sweep_london": ("Barrida del máximo o mínimo asiático en Londres y vuelta al rango", "rango",
                          lambda b, **p: range_sweep(b, LDN, 0, 7, 11, **p), [3, 5, 15],
                          {"tp_mode": ["mid", "far"], "buf": [0.0, 0.2]}),
    "ny_orb": ("Ruptura del rango de los primeros 30 min de COMEX (08:20 NY)", "tendencia",
               lambda b, **p: range_breakout(b, NY, 8.33, 8.84, 11, **p), [1, 3, 5],
               {"tp_mult": [1.0, 1.5, 2.0], "sl_mode": ["mid", "far"]}),
    "ny_sweep": ("Barrida del rango de apertura de Nueva York y reversión", "volátil",
                 lambda b, **p: range_sweep(b, NY, 8.33, 8.84, 11.5, **p), [1, 3, 5],
                 {"tp_mode": ["mid", "far"], "buf": [0.0, 0.2]}),
    "london_orb": ("Ruptura del rango de la primera hora de Londres", "tendencia",
                   lambda b, **p: range_breakout(b, LDN, 8, 9, 12, **p), [5, 15],
                   {"tp_mult": [1.0, 1.5, 2.0], "sl_mode": ["mid", "far"]}),
    "pdhl_breakout": ("Cierre por fuera del máximo o mínimo del día anterior", "tendencia",
                      lambda b, **p: prev_day_levels(b, "breakout", **p), [5, 15],
                      {"tp_mult": [1.5, 2.0, 3.0]}),
    "pdhl_sweep": ("Barrida del máximo o mínimo del día anterior y vuelta", "rango",
                   lambda b, **p: prev_day_levels(b, "sweep", **p), [5, 15],
                   {"tp_mult": [1.0, 1.5, 2.0]}),
    "vwap_pullback": ("Retroceso al VWAP del día dentro de una tendencia", "tendencia",
                      vwap_pullback, [3, 5, 15], {"ema_n": [20, 50], "tp_r": [1.5, 2.0]}),
    "ema_pullback": ("Retroceso a la EMA rápida con EMAs alineadas", "tendencia",
                     ema_pullback, [3, 5, 15], {"fast": [9, 20], "tp_r": [1.5, 2.0, 3.0]}),
    "donchian_volume": ("Ruptura de rango con volumen de ticks creciente", "tendencia",
                        donchian_volume, [5, 15], {"n": [20, 40], "vol_mult": [1.5, 2.0], "tp_r": [1.5, 2.5]}),
    "rsi2_trend": ("RSI(2) extremo a favor de la media de 200 velas", "tendencia",
                   rsi2_trend, [5, 15], {"lo": [5, 10], "tp_r": [1.0, 1.5]}),
    "bb_fade_asia": ("Bandas de Bollinger hacia la media en la sesión asiática", "rango",
                     bb_fade_asia, [5, 15], {"k": [2.0, 2.5], "atr_sl": [1.0, 1.5]}),
    "flush_reversal": ("Reversión tras una liquidación violenta", "volátil",
                       flush_reversal, [1, 3, 5, 15], {"move_atr": [3.0, 4.0], "tp_r": [1.0, 1.5]}),
    "momentum_burst": ("Seguir una vela gigante con volumen alto", "volátil",
                       momentum_burst, [1, 3, 5], {"k": [2.0, 3.0], "tp_r": [1.0, 2.0]}),
    "inside_bar": ("Ruptura de vela interior a favor de la EMA 50", "tendencia",
                   inside_bar, [5, 15], {"tp_r": [1.5, 2.0, 3.0]}),
    "sunday_gap": ("Cierre parcial del hueco de apertura del domingo", "rango",
                   sunday_gap, [5], {"min_gap_atr": [1.0, 2.0]}),
}


# --------------------------------------------------------------- Ronda 2: stops anchos (el spread pesa poco)
def _hourly_atr_on(b, df_ref_minutes=60, n=14):
    """ATR de velas de 1 hora reindexado a las velas de b (solo horas ya cerradas)."""
    h = pd.DataFrame({"h": b.h.resample("60min").max(), "l": b.l.resample("60min").min(),
                      "c": b.c.resample("60min").last()}).dropna()
    h["tf"] = 60
    a = atr(h, n).shift()  # la hora en curso todavía no cerró
    return a.reindex(b.index, method="ffill")


def donchian_trend(b, n=20, atr_mult=2.0, tp_r=3.0, hold_h=48, trend_n=0):
    """Tendencia clásica: cierre por encima del máximo de N velas (de 1h/4h), stop a 2 ATR."""
    hh = b.h.rolling(n).max().shift()
    ll = b.l.rolling(n).min().shift()
    a = atr(b)
    up = b.c > hh
    dn = b.c < ll
    if trend_n:
        ma = b.c.rolling(trend_n).mean()
        up &= b.c > ma
        dn &= b.c < ma
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        out.append(_orders(ts[i], s, MARKET, 0, c - s * atr_mult * a.values[i], c + s * tp_r * atr_mult * a.values[i], 1, hold_h * 60))
    return _cat(*out)


SESSIONS = {"asia": (23, 6), "london": (7, 11), "ny": (13, 17), "late": (17, 21)}


def session_drift(b, session="asia", side=1, atr_mult=1.5):
    """Estacionalidad intradía: comprar (o vender) al inicio de una sesión y cerrar al final;
    stop a 1,5 ATR de 1 hora. Walk-forward elige sesión y lado con los 12 meses previos."""
    s0, s1 = SESSIONS[session]
    a = _hourly_atr_on(b)
    first = (b.index.hour == s0) & (b.index.minute == 0)
    i = np.where(first)[0]
    i = i[np.isfinite(a.values[i])]
    hold = ((s1 - s0) % 24) * 60
    ts = b.index[i]  # la orden se activa al abrir la sesión (sin mirar la vela que empieza)
    c = b.o.values[i]
    return _orders(ts, side, MARKET, 0, c - side * atr_mult * a.values[i], c + side * 10 * atr_mult * a.values[i], 1, hold) if len(i) else None


def trend_pullback_h1(b, fast=20, slow=100, lo=15, atr_mult=1.5, tp_r=2.0):
    """En 1h: con la media lenta subiendo, comprar cuando el RSI(2) marca sobreventa; stop a 1,5 ATR."""
    ma = b.c.ewm(span=slow, adjust=False).mean()
    r = rsi(b.c, 2)
    a = atr(b)
    up = (b.c > ma) & (ma > ma.shift(fast)) & (r < lo)
    dn = (b.c < ma) & (ma < ma.shift(fast)) & (r > 100 - lo)
    ts = _close_ts(b)
    out = []
    for m, s in ((up, 1), (dn, -1)):
        i = np.where(m.values)[0]
        c = b.c.values[i]
        out.append(_orders(ts[i], s, MARKET, 0, c - s * atr_mult * a.values[i], c + s * tp_r * atr_mult * a.values[i], 1, 24 * 60))
    return _cat(*out)


def asia_breakout_wide(b, tp_mult=2.0, atr_mult=1.0, trend_n=20):
    """Ruptura del rango asiático solo a favor de la tendencia diaria, con stop a 1 ATR de 1h más allá del rango."""
    a = _hourly_atr_on(b)
    daily = b.c.resample("1D").last().dropna()
    ma = daily.rolling(trend_n).mean().shift()  # tendencia con días ya cerrados
    trend = np.sign(daily.shift() - ma).reindex(b.index.normalize()).values
    o = range_breakout(b, LDN, 0, 7, 11, tp_mult=tp_mult, sl_mode="far")
    if o is None:
        return None
    pos = b.index.get_indexer(o.ts_active)
    tr = trend[pos]
    o = o[o.side.values == tr].copy()
    av = a.values[b.index.get_indexer(o.ts_active)]
    o["sl"] = o.sl - o.side * atr_mult * av
    o["tp"] = o.px + o.side * tp_mult * (o.px - o.sl).abs()
    return o[np.isfinite(o.sl)]


CATALOG.update({
    "donchian_trend_h1": ("Ruptura del máximo/mínimo de N horas, stop a 2 ATR", "tendencia",
                          donchian_trend, [60], {"n": [20, 55], "tp_r": [2.0, 4.0], "trend_n": [0, 200]}),
    "donchian_trend_h4": ("Ruptura del máximo/mínimo de N velas de 4h, stop a 2 ATR", "tendencia",
                          lambda b, **p: donchian_trend(b, hold_h=120, **p), [240], {"n": [10, 20], "tp_r": [2.0, 4.0]}),
    "session_drift": ("Estacionalidad: operar una sesión entera en el lado que más ganó los 12 meses previos", "cualquiera",
                      session_drift, [15], {"session": list(SESSIONS), "side": [1, -1]}),
    "trend_pullback_h1": ("RSI(2) de sobreventa con la media de 100h subiendo, stop a 1,5 ATR", "tendencia",
                          trend_pullback_h1, [60], {"lo": [10, 20], "tp_r": [1.5, 2.5]}),
    "asia_breakout_wide": ("Ruptura asiática solo a favor de la tendencia diaria, stop ancho", "tendencia",
                           asia_breakout_wide, [15], {"tp_mult": [1.5, 2.5], "trend_n": [20, 50]}),
})
