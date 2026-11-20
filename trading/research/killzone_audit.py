"""Auditoría del estudio horario: ¿los movimientos fuertes del oro empiezan de verdad en esas horas?

Método independiente de hourly_study.py: en vez de promediar rangos, detecta IMPULSOS (desplazamientos
de 15 minutos de al menos el 25% del rango diario medio) y registra el minuto exacto en que empiezan.
También valida la zona horaria de los datos con el pico del dato de empleo (NFP, 08:30 ET).

Uso: python3 killzone_audit.py ../data ../results/killzones
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

from hourly_study import load

W = 15          # minutos del impulso
THR = 0.25      # fracción del rango diario medio (ADR de 20 días)
ET2MAD = 6      # diferencia habitual Nueva York -> Madrid

# Killzones clásicas (ICT) en hora de Nueva York, y las ventanas del estudio
ZONES = {
    "Asia KZ (20:00-00:00 ET)": (20 * 60, 24 * 60),
    "Londres KZ (02:00-05:00 ET)": (2 * 60, 5 * 60),
    "NY AM KZ (07:00-10:00 ET)": (7 * 60, 10 * 60),
    "London close (10:00-12:00 ET)": (10 * 60, 12 * 60),
    "NY PM (13:30-16:00 ET)": (13 * 60 + 30, 16 * 60),
    "Ventana del estudio (08:20-12:00 ET)": (8 * 60 + 20, 12 * 60),
}


def mad(m):
    m = int(m + ET2MAD * 60) % 1440
    return f"{m // 60:02d}:{m % 60:02d}"


def et(m):
    return f"{int(m) // 60:02d}:{int(m) % 60:02d}"


def mismatch_week(ts):
    """Semanas en que EE. UU. ya cambió de horario y Europa todavía no (o al revés): NY + 5h = Madrid."""
    ny = ts.tz_convert("America/New_York").tz_localize(None)
    md = ts.tz_convert("Europe/Madrid").tz_localize(None)
    return np.asarray((md - ny) != pd.Timedelta(hours=6))


def main(data_dir, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    df = load(data_dir)
    df["m"] = df.index.hour * 60 + df.index.minute
    D = df.groupby("tday").agg(h=("h", "max"), l=("l", "min"), n=("c", "size"))
    D = D[D.n >= 600]
    D["adr20"] = (D.h - D.l).rolling(20).mean().shift(1)
    df = df.join(D[["adr20"]], on="tday", how="inner").dropna(subset=["adr20"])
    R = {"desde": str(df.index.min()), "hasta": str(df.index.max())}

    # ---------- 1. validación de la zona horaria: rango de 1 minuto por minuto del día
    df["r1"] = (df.h - df.l) / df.adr20
    prof = df.groupby("m").r1.mean()
    base = prof.rolling(21, center=True, min_periods=5).median()
    spikes = (prof / base).sort_values(ascending=False).head(12)
    R["picos_1m"] = [{"ET": et(m), "Madrid": mad(m), "veces_lo_normal": round(float(v), 2)} for m, v in spikes.items()]
    fri = df[(df.index.dayofweek == 4)]
    nfp = fri.index.day <= 7
    R["nfp_check"] = {
        "08:30_ET_primer_viernes": round(float(fri[nfp & (fri.m == 510)].r1.mean() / fri[nfp & (fri.m == 505)].r1.mean()), 2),
        "08:30_ET_resto_viernes": round(float(fri[~nfp & (fri.m == 510)].r1.mean() / fri[~nfp & (fri.m == 505)].r1.mean()), 2),
        "07:30_ET_primer_viernes(si_la_hora_estuviera_mal)": round(float(fri[nfp & (fri.m == 450)].r1.mean() / fri[nfp & (fri.m == 445)].r1.mean()), 2),
    }
    # en semanas de desfase, el pico tiene que seguir en 08:30 ET (anclado a NY), no moverse
    df["mis"] = mismatch_week(df.index)
    R["semanas_desfase"] = {}
    for lab, sub in (("desfase", df[df.mis]), ("normal", df[~df.mis])):
        p = sub.groupby("m").r1.mean()
        R["semanas_desfase"][lab] = {"dias": int(sub.tday.nunique()),
                                     "08:30_ET": round(float(p.get(510, np.nan) / p.loc[490:505].mean()), 2),
                                     "03:00_ET(08:00 Londres)": round(float(p.get(180, np.nan) / p.loc[165:175].mean()), 2),
                                     "02:00_ET": round(float(p.get(120, np.nan) / p.loc[105:115].mean()), 2)}

    # ---------- 2. impulsos: desplazamiento de 15 minutos >= 25% del ADR, sin solaparse
    events = []
    for d, g in df.groupby("tday"):
        o, c, m, a = g.o.values, g.c.values, g.m.values, g.adr20.values[0]
        t = g.index.values
        if len(g) < 600:
            continue
        # cierre 14 minutos después, solo si no hay huecos en los datos
        j = np.arange(len(g)) + (W - 1)
        ok = j < len(g)
        j = np.where(ok, j, 0)
        gap_ok = ok & ((t[j] - t) == np.timedelta64(W - 1, "m"))
        disp = np.where(gap_ok, (c[j] - o) / a, 0.0)
        cand = np.where(np.abs(disp) >= THR)[0]
        taken = np.zeros(len(g), bool)
        for i in cand[np.argsort(-np.abs(disp[cand]))]:
            if taken[max(0, i - W + 1): i + W].any():
                continue
            taken[i] = True
            events.append((d, int(m[i]), float(disp[i]), bool(g.mis.values[i]), int(pd.Timestamp(t[i]).year),
                           int(pd.Timestamp(d).dayofweek)))
    E = pd.DataFrame(events, columns=["tday", "m", "disp", "mis", "year", "dow"])
    ndays = int(df.tday.nunique())
    R["impulsos"] = {"total": int(len(E)), "dias": ndays, "por_dia": round(len(E) / ndays, 2),
                     "dias_con_al_menos_uno_pct": round(E.tday.nunique() / ndays * 100, 1),
                     "umbral": f"{W} min, >= {int(THR * 100)}% del rango diario medio"}
    # Valor del umbral en dólares, hoy
    R["impulsos"]["umbral_usd_ultimos_20_dias"] = round(float(D.adr20.iloc[-1] * THR), 1)

    # distribución por tramo de 15 minutos (inicio del impulso)
    E["slot"] = (E.m // 15) * 15
    slot = E.groupby("slot").size().reindex(range(0, 1440, 15), fill_value=0)
    slot_pct = slot / len(E) * 100
    top = slot_pct.sort_values(ascending=False).head(15)
    R["top_tramos_15m"] = [{"ET": et(s), "Madrid": mad(s), "pct_de_todos_los_impulsos": round(float(v), 2),
                            "prob_dia_impulso_aqui_pct": round(float(slot[s] / ndays * 100), 1)} for s, v in top.items()]
    # minuto exacto más frecuente
    mins = E.m.value_counts().head(10)
    R["top_minutos"] = [{"ET": et(m), "Madrid": mad(m), "impulsos": int(n), "pct": round(n / len(E) * 100, 2)}
                        for m, n in mins.items()]

    # killzones: % de impulsos, densidad por hora, prob. de que el día tenga uno ahí
    kz = []
    for name, (a, b) in ZONES.items():
        inz = (E.m >= a) & (E.m < b)
        hours = (b - a) / 60
        kz.append({"zona": name, "Madrid": f"{mad(a)}-{mad(b % 1440)}", "horas": hours,
                   "pct_impulsos": round(inz.mean() * 100, 1),
                   "pct_impulsos_por_hora": round(inz.mean() * 100 / hours, 1),
                   "prob_dia_con_impulso_pct": round(E[inz].tday.nunique() / ndays * 100, 1),
                   "por_anio_pct": {int(y): round(((g.m >= a) & (g.m < b)).mean() * 100, 1) for y, g in E.groupby("year")}})
    R["killzones"] = kz
    R["fuera_de_killzones_pct"] = round(float((~np.any([(E.m >= a) & (E.m < b) for n, (a, b) in ZONES.items()
                                                         if not n.startswith("Ventana")], axis=0)).mean() * 100), 1)

    # mapa por hora y año
    E["hour"] = E.m // 60
    hy = (E.groupby(["hour", "year"]).size().unstack(fill_value=0)
          .div(E.groupby("year").size(), axis=1) * 100).round(1)
    hy.index = [f"{mad(h * 60)}" for h in hy.index]
    hy.to_csv(out / "impulsos_hora_madrid_x_anio.csv")
    R["impulsos_por_hora_madrid_y_anio"] = hy.to_dict()

    # día de la semana dentro de la ventana fuerte
    win = E[(E.m >= 500) & (E.m < 720)]
    R["ventana_por_dia_semana_impulsos_por_dia"] = {
        int(k): round(v, 2) for k, v in (win.groupby("dow").size() / df.groupby(df.index.dayofweek).tday.nunique()).items()
        if k < 5}

    E.to_csv(out / "impulsos.csv", index=False)
    slot_pct.round(2).rename(index=lambda s: et(s)).to_csv(out / "impulsos_por_tramo_15m_ET.csv")
    (out / "auditoria.json").write_text(json.dumps(R, indent=1, ensure_ascii=False, default=str))
    print(json.dumps(R, indent=1, ensure_ascii=False, default=str))
    print(hy.to_string())


if __name__ == "__main__":
    main(*sys.argv[1:3])
