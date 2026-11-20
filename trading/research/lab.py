"""Lab: walk-forward de todos los setups de Radar, stress tests y Monte Carlo del examen.

Uso: python3 lab.py DATA_DIR OUT_DIR
Escribe OUT_DIR/results.json, OUT_DIR/leaderboard.csv y OUT_DIR/trades_<setup>.parquet.
Todo número sale de los datos de Dukascopy; nada es inventado. Supuestos de costos al principio.
"""
import itertools
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

from engine import Market, run, size_and_cost
from setups import CATALOG, load_hd, resample

RISK = 0.005           # 0,5% del balance inicial por trade (Shield)
BAL = 5000.0
SLIP = 0.05            # USD/oz en entradas stop/market y salidas por stop (supuesto)
TRAIN_M, TEST_M = 12, 3
MIN_TRAIN_TRADES = 20

# Shield (límites propios, más estrictos que FundedHive Moderate)
SHIELD_DAY_STOP = -2.0      # % del balance inicial
SHIELD_MAX_LOSSES = 3       # pérdidas seguidas en el día
SHIELD_TOTAL_PAUSE = -4.0   # % desde el balance inicial


def metrics(t):
    if len(t) == 0:
        return dict(n=0)
    p = t.pnl_pct.values
    eq = np.cumsum(p)
    dd = (eq - np.maximum.accumulate(np.maximum(eq, 0))).min()
    loss = p < 0
    streak = best = 0
    for x in loss:
        streak = streak + 1 if x else 0
        best = max(best, streak)
    month = pd.Series(p, index=pd.DatetimeIndex(t.entry_ts)).resample("ME").sum()
    gains, losses = p[p > 0].sum(), -p[p < 0].sum()
    return dict(n=int(len(p)), win=float((p > 0).mean()), exp_r=float(t.r.mean()), total_pct=float(p.sum()),
                pf=float(gains / losses) if losses > 0 else None, max_dd_pct=float(dd), max_loss_streak=int(best),
                worst_month_pct=float(month.min()), worst_month=str(month.idxmin().date()),
                pos_months=float((month > 0).mean()), trades_per_month=float(len(p) / max(len(month), 1)))


def shield_filter(t):
    """Aplica Shield trade a trade: corta el día en -2% o con 3 pérdidas seguidas (día = 00:00 UTC)."""
    if len(t) == 0:
        return t
    keep = []
    day = None
    for k, row in enumerate(t.itertuples()):
        d = pd.Timestamp(row.entry_ts).normalize()
        if d != day:
            day, dsum, streak, stopped = d, 0.0, 0, False
        if stopped:
            continue
        keep.append(k)
        dsum += row.pnl_pct
        streak = streak + 1 if row.pnl_pct < 0 else 0
        if dsum <= SHIELD_DAY_STOP or streak >= SHIELD_MAX_LOSSES:
            stopped = True
    return t.iloc[keep].reset_index(drop=True)


def regime_by_month(df1m):
    m = df1m.bc.resample("ME").last()
    r = m.pct_change() * 100
    return pd.cut(r, [-1e9, -2, 2, 1e9], labels=["bajista", "lateral", "alcista"])


def montecarlo(t, days_index, start_pct, target_pct, day_limit, total_limit, need_days, days_done=0,
               horizon=120, sims=5000, seed=7):
    """Remuestrea días hábiles (con y sin trades) del tramo fuera de muestra.
    Devuelve probabilidad de aprobar, de romper y mediana de días para aprobar."""
    rng = np.random.default_rng(seed)
    daily = pd.Series(0.0, index=days_index)
    worst = pd.Series(0.0, index=days_index)
    if len(t):
        d = pd.DatetimeIndex(t.entry_ts).normalize()
        g = pd.DataFrame({"d": d, "p": t.pnl_pct.values})
        daily = daily.add(g.groupby("d").p.sum(), fill_value=0)
        intr = g.groupby("d").p.apply(lambda s: np.minimum.accumulate(np.cumsum(s.values)).min())
        worst = worst.add(intr, fill_value=0).clip(upper=0)
    dv, wv = daily.values, worst.values
    passed = failed = paused = 0
    days_to_pass = []
    for _ in range(sims):
        eq, good, ok = start_pct, days_done, None
        for day in range(horizon):
            k = rng.integers(len(dv))
            if eq + wv[k] <= -total_limit or wv[k] <= -day_limit:
                ok = "fail"
                break
            eq += dv[k]
            good += dv[k] > 1.0
            if eq <= SHIELD_TOTAL_PAUSE:
                ok = "pause"
                break
            if eq >= target_pct and good >= need_days:
                ok = "pass"
                days_to_pass.append(day + 1)
                break
        passed += ok == "pass"
        failed += ok == "fail"
        paused += ok == "pause"
    return dict(p_pass=passed / sims, p_fail=failed / sims, p_pause=paused / sims,
                p_undecided=1 - (passed + failed + paused) / sims,
                median_days=float(np.median(days_to_pass)) if days_to_pass else None, horizon_days=horizon)


def score(m, stress_total, bear, flat):
    """Puntaje 1-5 por criterio (umbrales fijados antes de ver resultados)."""
    if m.get("n", 0) == 0:
        return {}
    s = {}
    s["oos_profit"] = 1 + sum(m["total_pct"] > x for x in (0, 5, 15, 30))
    s["max_dd"] = 1 + sum(m["max_dd_pct"] > x for x in (-12, -8, -5, -3))
    s["trades"] = 1 + sum(m["n"] >= x for x in (30, 50, 100, 200))
    s["loss_streak"] = 1 + sum(m["max_loss_streak"] <= x for x in (12, 9, 7, 5))
    s["bear_flat"] = 1 + (bear > 0) + (flat > 0) + (bear > 2) + (flat > 2)
    s["double_cost"] = 1 + sum(stress_total > x for x in (-5, 0, 5, 15))
    s["avg"] = float(np.mean(list(s.values())))
    return s


MAX_TRADES_PER_DAY = 4.0   # media; más que eso huele a HFT para la firma
MIN_MEDIAN_HOLD_MIN = 3.0  # mediana de duración mínima


def hft_flags(t):
    hold = (pd.to_datetime(t.exit_ts) - pd.to_datetime(t.entry_ts)).dt.total_seconds() / 60
    days = pd.DatetimeIndex(t.entry_ts).normalize().nunique()
    tpd = len(t) / max(days, 1)
    return dict(trades_per_active_day=float(tpd), median_hold_min=float(hold.median()),
                hft_risk=bool(tpd > MAX_TRADES_PER_DAY or hold.median() < MIN_MEDIAN_HOLD_MIN))


def main(data_dir, out_dir, spread_csv=None, only=None, spread_scale=1.0):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    df1m = load_hd(data_dir, spread_csv)
    if float(spread_scale) != 1.0:  # sensibilidad: ¿y si el broker tiene otro spread?
        for x in "ohlc":
            df1m["a" + x] = df1m["b" + x] + df1m.spread_est * float(spread_scale)
    mkt = Market(df1m)
    bars = {tf: resample(df1m, tf) for tf in (1, 3, 5, 15, 60, 240)}
    reg = regime_by_month(df1m)
    start, end = df1m.index[0], df1m.index[-1]
    print(f"datos: {start} → {end}, {len(df1m):,} velas de 1m", flush=True)

    windows = []
    ws = start.normalize().replace(day=1)
    while ws + pd.DateOffset(months=TRAIN_M + TEST_M) <= end + pd.Timedelta(days=1):
        tr_end = ws + pd.DateOffset(months=TRAIN_M)
        windows.append((ws, tr_end, tr_end + pd.DateOffset(months=TEST_M)))
        ws += pd.DateOffset(months=TEST_M)
    oos_start = windows[0][1]
    bdays = pd.bdate_range(oos_start.normalize(), end.normalize())

    results, board = {}, []
    for name, (desc, regime, fn, tfs, grid) in CATALOG.items():
        if only and name not in only.split(","):
            continue
        for tf in tfs:
            key = f"{name}_{tf}m"
            keys = list(grid)
            combos = [dict(zip(keys, v)) for v in itertools.product(*grid.values())]
            runs = {}
            for i, p in enumerate(combos):
                orders = fn(bars[tf], **p)
                if orders is None or len(orders) == 0:
                    continue
                base = size_and_cost(run(mkt, orders, slip=SLIP), RISK, BAL)
                stress = size_and_cost(run(mkt, orders, spread_mult=1.5, slip=2 * SLIP), RISK, BAL, fee_mult=2.0)
                late = size_and_cost(run(mkt, orders, slip=SLIP, delay=1), RISK, BAL)
                runs[i] = (p, base, stress, late)
            if not runs:
                continue
            # walk-forward: elegir parámetros en 12 meses, operar los 3 siguientes
            oos, oos_s, oos_l, chosen = [], [], [], []
            for a, b, c in windows:
                best, best_v = None, -np.inf
                for i, (p, base, _, _) in runs.items():
                    tr = base[(base.entry_ts >= a) & (base.entry_ts < b)]
                    if len(tr) < MIN_TRAIN_TRADES:
                        continue
                    v = tr.r.sum() / np.sqrt(len(tr))
                    if v > best_v:
                        best, best_v = i, v
                if best is None:
                    continue
                chosen.append((str(b.date()), runs[best][0]))
                for lst, df in ((oos, runs[best][1]), (oos_s, runs[best][2]), (oos_l, runs[best][3])):
                    lst.append(df[(df.entry_ts >= b) & (df.entry_ts < c)])
            if not oos:
                continue
            o = pd.concat(oos, ignore_index=True)
            os_ = pd.concat(oos_s, ignore_index=True)
            ol = pd.concat(oos_l, ignore_index=True)
            m = metrics(o)
            if m.get("n", 0) == 0:
                continue
            osh = shield_filter(o)
            msh = metrics(osh)
            ms = metrics(os_)
            ml = metrics(ol)
            # robustez: cuántas combinaciones de la rejilla ganan en todo el período
            neigh = float(np.mean([r[1].pnl.sum() > 0 for r in runs.values()]))
            mon = pd.Series(o.pnl_pct.values, index=pd.DatetimeIndex(o.entry_ts)).resample("ME").sum()
            rg = reg.reindex(mon.index)
            by_reg = {str(k): float(mon[rg == k].sum()) for k in ["alcista", "bajista", "lateral"]}
            sc = score(m, ms.get("total_pct", -99), by_reg["bajista"], by_reg["lateral"])
            mc_ch = montecarlo(osh, bdays, 3.31, 10.0, 5.0, 10.0, 3)
            mc_ch3 = montecarlo(osh, bdays, 3.31, 10.0, 5.0, 10.0, 3, days_done=3)
            mc_fd = montecarlo(osh, bdays, 0.0, 1e9, 3.0, 6.0, 10 ** 9, horizon=63)
            hf = hft_flags(o)
            results[key] = dict(hft=hf, desc=desc, regime=regime, tf=tf, oos=m, oos_shield=msh, stress_2x=ms,
                                one_min_late=ml, grid_positive_share=neigh, by_regime=by_reg, score=sc,
                                challenge_mc=mc_ch, challenge_mc_if_3_days_done=mc_ch3, funded_moderate_3m=mc_fd,
                                chosen_params=chosen)
            o.to_parquet(out / f"trades_{key}.parquet")
            board.append(dict(setup=key, regime=regime, n=m["n"], total_pct=m["total_pct"], pf=m["pf"],
                              max_dd=m["max_dd_pct"], streak=m["max_loss_streak"],
                              stress_total=ms.get("total_pct"), late_total=ml.get("total_pct"),
                              grid_pos=neigh, score=sc.get("avg") if not hf["hft_risk"] else 0.0,
                              hft_risk=hf["hft_risk"], hold_min=hf["median_hold_min"], p_pass=mc_ch["p_pass"], p_fail=mc_ch["p_fail"]))
            print(f"{key:28s} n={m['n']:4d} oos={m['total_pct']:7.2f}% pf={m['pf'] or 0:.2f} "
                  f"stress={ms.get('total_pct', 0):7.2f}% score={sc.get('avg', 0):.2f} "
                  f"pass={mc_ch['p_pass']:.2f} ({time.time() - t0:.0f}s)", flush=True)

    gold = df1m.bc
    bh = float((gold[gold.index >= oos_start].iloc[-1] / gold[gold.index >= oos_start].iloc[0] - 1) * 100)
    meta = dict(source="histdata.com XAUUSD M1 bid (UTC); spread: " + (spread_csv or "fijo 0.40 USD (estimación)"), data_start=str(start), data_end=str(end),
                oos_start=str(oos_start), buy_hold_gold_oos_pct_unlevered=bh,
                assumptions=dict(risk_per_trade=RISK, balance=BAL, slip_usd_oz=SLIP,
                                 commission="USD 15 por millón por lado (PDF FundedHive ene-2026)",
                                 stress="spread x1.5, slippage x2, comisión x2",
                                 walk_forward=f"{TRAIN_M}m entrenamiento / {TEST_M}m prueba, rodando",
                                 day_boundary="00:00 UTC"),
                generated_utc=pd.Timestamp.utcnow().isoformat())
    json.dump(dict(meta=meta, setups=results), open(out / "results.json", "w"), indent=1, default=str)
    pd.DataFrame(board).sort_values("score", ascending=False).to_csv(out / "leaderboard.csv", index=False)
    print("listo", meta, flush=True)


if __name__ == "__main__":
    main(*sys.argv[1:6])
