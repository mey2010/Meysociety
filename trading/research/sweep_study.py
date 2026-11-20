"""Barridos de liquidez en el oro: cuándo ocurren y si de verdad disparan un movimiento brusco.

Definición (fija, decidida antes de mirar resultados):
- Niveles de liquidez: máximo/mínimo del día anterior (PDH/PDL), de Asia (18:00-03:00 ET) y de
  Londres (03:00-08:00 ET). Asia vale desde las 03:00 ET y Londres desde las 08:00 ET.
- Barrido: la PRIMERA vez del día que el precio supera el nivel y, en 15 minutos como máximo,
  una vela de 1m cierra de vuelta del otro lado. Si no vuelve, es una ruptura aceptada.
- Entrada: al cierre de la vela que vuelve a entrar, a favor de la reversión.
  Stop: el extremo del barrido + 0,40 USD de spread. Objetivo: 25% del rango diario medio (ADR20).
- "Movimiento brusco": alcanza el objetivo antes que el stop y en 30 minutos o menos.
- Base de azar: en un paseo aleatorio, P(objetivo antes que stop) = stop / (stop + objetivo).
  Si los barridos no superan esa base, no aportan nada.

Uso: python3 sweep_study.py ../data ../results/sweeps
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

from hourly_study import load

SPREAD = 0.40
RECLAIM = int(__import__("os").environ.get("RECLAIM", 15))
HORIZON = 120
FAST = 30


def mad(m):
    m = int(m + 360) % 1440
    return f"{m // 60:02d}:{m % 60:02d}"


def simulate(h, l, c, i, side, stop, tgt_dist):
    """side=-1 corto (tras barrer un máximo), +1 largo. Devuelve (resultado, minutos)."""
    entry = c[i]
    tgt = entry + side * tgt_dist
    for k in range(i + 1, min(i + 1 + HORIZON, len(c))):
        hit_stop = h[k] >= stop if side < 0 else l[k] <= stop
        hit_tgt = l[k] <= tgt if side < 0 else h[k] >= tgt
        if hit_stop:  # mismo minuto: cuenta el stop (conservador)
            return "stop", k - i
        if hit_tgt:
            return "objetivo", k - i
    return "nada", HORIZON


def main(data_dir, out, tgt_frac=0.25):
    tgt_frac = float(tgt_frac)
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    df = load(data_dir)
    df["m"] = df.index.hour * 60 + df.index.minute
    D = df.groupby("tday").agg(h=("h", "max"), l=("l", "min"), n=("c", "size"))
    D = D[D.n >= 600]
    D["adr20"] = (D.h - D.l).rolling(20).mean().shift(1)
    D["pdh"], D["pdl"] = D.h.shift(1), D.l.shift(1)
    D = D.dropna()

    rng = np.random.default_rng(7)
    G = {d: (g.m.values, g.h.values, g.l.values, g.c.values, D.adr20[d]) for d, g in df.groupby("tday")
         if len(g) >= 600 and d in D.index}
    keys = list(G)

    def control(m_entry, s_frac, t_frac, n=10):
        """Mismo minuto del día, mismo stop y objetivo (en fracción del ADR de ESE día), días y dirección al azar."""
        w = 0
        for d2 in rng.choice(len(keys), n, replace=False):
            mm, hh, ll, cc, a2 = G[keys[d2]]
            i = np.searchsorted(mm, m_entry) if m_entry < 18 * 60 else np.searchsorted(np.where(mm >= 18 * 60, mm - 1440, mm), m_entry - 1440)
            if i >= len(cc) - 1:
                continue
            sd = rng.choice([-1, 1])
            w += simulate(hh, ll, cc, i, sd, cc[i] - sd * s_frac * a2, t_frac * a2)[0] == "objetivo"
        return w / n

    rows = []
    for d, g in df.groupby("tday"):
        if d not in D.index or len(g) < 600:
            continue
        info = D.loc[d]
        a = info.adr20
        m = g.m.values
        sess = np.where(m >= 18 * 60, m - 1440, m)  # minutos desde medianoche, Asia en negativo
        h, l, c = g.h.values, g.l.values, g.c.values
        asia = (sess >= -360) & (sess < 180)
        lon = (sess >= 180) & (sess < 480)
        if asia.sum() < 300 or lon.sum() < 200:
            continue
        levels = [("PDH/PDL", info.pdh, info.pdl, -360),
                  ("Asia", h[asia].max(), l[asia].min(), 180),
                  ("Londres", h[lon].max(), l[lon].min(), 480)]
        for name, hi, lo, valid_from in levels:
            for side, lvl in ((-1, hi), (1, lo)):  # barrer máximo -> corto; barrer mínimo -> largo
                ok = (sess >= valid_from) & (sess < 16 * 60)
                cross = ok & ((h > lvl) if side < 0 else (l < lvl))
                if not cross.any():
                    continue
                t0 = int(np.argmax(cross))
                # ¿ya estaba más allá del nivel en el minuto anterior? entonces no es un barrido limpio
                if t0 > 0 and ((c[t0 - 1] > lvl) if side < 0 else (c[t0 - 1] < lvl)):
                    continue
                back = None
                for k in range(t0, min(t0 + RECLAIM, len(c))):
                    if (c[k] < lvl) if side < 0 else (c[k] > lvl):
                        back = k
                        break
                ext = h[t0:(back or t0 + RECLAIM) + 1].max() if side < 0 else l[t0:(back or t0 + RECLAIM) + 1].min()
                depth = abs(ext - lvl) / a
                row = {"tday": d, "year": d.year, "dow": d.dayofweek, "nivel": name,
                       "lado": "máximo" if side < 0 else "mínimo", "m": int(m[t0]), "madrid": mad(m[t0]),
                       "hora_madrid": mad(m[t0])[:2] + ":00", "prof_adr": depth}
                if back is None:
                    row["tipo"] = "ruptura"
                    # la ruptura sigue 25% ADR más allá en 30 min?
                    seg = slice(t0, min(t0 + FAST, len(c)))
                    row["sigue_brusco"] = bool((h[seg].max() >= lvl + tgt_frac * a) if side < 0
                                               else (l[seg].min() <= lvl - tgt_frac * a))
                else:
                    stop = ext + SPREAD if side < 0 else ext - SPREAD
                    s = abs(stop - c[back])
                    res, mins = simulate(h, l, c, back, side, stop, tgt_frac * a)
                    cont = simulate(h, l, c, back, -side, c[back] + side * s, tgt_frac * a)[0] == "objetivo"
                    ctrl = control(int(m[back]), s / a, tgt_frac)
                    row.update({"tipo": "barrido", "res": res, "min": mins, "stop_adr": s / a,
                                "base": s / (s + tgt_frac * a),
                                "brusco": res == "objetivo" and mins <= FAST,
                                "cont": cont, "control": ctrl,
                                "R": (tgt_frac * a / s) if res == "objetivo" else (-1.0 if res == "stop" else np.nan)})
                rows.append(row)

    E = pd.DataFrame(rows)
    S = E[E.tipo == "barrido"].copy()
    S["win"] = S.res == "objetivo"
    # Excluyo barridos con stop minúsculo (<3% ADR): el spread y el slippage real los destruyen
    S = S[S.stop_adr >= 0.03]
    ndays = E.tday.nunique()

    def summ(g):
        return pd.Series({"barridos": len(g), "por_dia_pct": len(g) / ndays * 100,
                          "prob_objetivo": g.win.mean() * 100, "prob_control": g.control.mean() * 100,
                          "prob_continuacion": g.cont.mean() * 100,
                          "ventaja_pp": (g.win.mean() - g.control.mean()) * 100,
                          "t": (g.win.astype(float) - g.control).mean() / ((g.win.astype(float) - g.control).std() / np.sqrt(len(g))),
                          "prob_brusco_30m": g.brusco.mean() * 100,
                          "min_mediana_hasta_obj": g[g.win]["min"].median(),
                          "R_medio": g.R.mean()})

    R = {"dias": int(ndays), "objetivo_frac_ADR": tgt_frac,
         "total": summ(S).round(2).to_dict(),
         "por_nivel": S.groupby("nivel").apply(summ).round(2).reset_index().to_dict("records"),
         "por_nivel_lado": S.groupby(["nivel", "lado"]).apply(summ).round(2).reset_index().to_dict("records"),
         "por_hora_madrid": S.groupby("hora_madrid").apply(summ).round(2).reset_index().to_dict("records"),
         "por_anio": S.groupby("year").apply(summ).round(2).reset_index().to_dict("records"),
         "por_dia_semana": S.groupby("dow").apply(summ).round(2).reset_index().to_dict("records")}
    S["prof_bin"] = pd.cut(S.prof_adr, [0, 0.03, 0.07, 0.15, 10], labels=["<3%", "3-7%", "7-15%", ">15%"])
    R["por_profundidad"] = S.groupby("prof_bin", observed=True).apply(summ).round(2).reset_index().to_dict("records")
    B = E[E.tipo == "ruptura"]
    R["rupturas"] = {"n": int(len(B)), "prob_sigue_brusco_30m": round(B.sigue_brusco.mean() * 100, 1),
                     "barridos_vs_rupturas_pct_barrido": round(len(E[E.tipo == "barrido"]) / len(E) * 100, 1)}
    # Mejor combinación hora x nivel con muestra suficiente
    hx = S.groupby(["hora_madrid", "nivel"]).apply(summ)
    R["hora_x_nivel_top"] = hx[hx.barridos >= 40].sort_values("ventaja_pp", ascending=False).head(12).round(2).reset_index().to_dict("records")

    S.to_csv(out / f"barridos_obj{int(tgt_frac * 100)}.csv", index=False)
    (out / f"resumen_obj{int(tgt_frac * 100)}.json").write_text(json.dumps(R, indent=1, ensure_ascii=False, default=str))
    pd.set_option("display.width", 250)
    for k in ["total", "rupturas"]:
        print(k, R[k])
    for k in ["por_nivel_lado", "por_hora_madrid", "por_anio", "por_dia_semana", "por_profundidad", "hora_x_nivel_top"]:
        print("\n" + k)
        print(pd.DataFrame(R[k]).round(1).to_string())


if __name__ == "__main__":
    main(*sys.argv[1:4])
