"""Estudio horario del oro (XAUUSD): en qué horas se mueve y con qué fiabilidad.

Usa las velas de 1m de HistData (data_histdata.py) y trabaja en hora de Nueva York (ET), que es la
que ancla la liquidez del oro (COMEX, datos de EE. UU.). Ventana: los últimos 5 años de datos.

Uso: python3 hourly_study.py ../data ../results/hourly
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

SPREAD = 0.40  # USD, el mismo supuesto que lab.py


def load(data_dir):
    files = sorted(glob.glob(str(Path(data_dir) / "XAUUSD_hd" / "*.parquet")))
    df = pd.concat(pd.read_parquet(f) for f in files).sort_values("ts").drop_duplicates("ts")
    end = df.ts.max()
    df = df[df.ts > end - pd.DateOffset(years=5)]
    df = df.set_index(pd.DatetimeIndex(df.ts).tz_localize("UTC").tz_convert("America/New_York"))
    df = df.rename(columns={"bo": "o", "bh": "h", "bl": "l", "bc": "c"})[["o", "h", "l", "c"]]
    # Día de trading CME: de 18:00 ET a 17:00 ET (18:00 ya cuenta para el día siguiente)
    df["tday"] = (df.index + pd.Timedelta(hours=6)).normalize().tz_localize(None)
    return df


def bars(df, rule):
    g = df.groupby([df.tday, df.index.floor(rule)])
    b = g.agg(o=("o", "first"), h=("h", "max"), l=("l", "min"), c=("c", "last"), n=("c", "size"))
    b.index = b.index.set_names(["tday", "t"])
    return b.reset_index()


def tstat(x):
    x = np.asarray(x, float)
    x = x[~np.isnan(x)]
    return float(x.mean() / (x.std(ddof=1) / np.sqrt(len(x)))) if len(x) > 2 else np.nan


def main(data_dir, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    df = load(data_dir)
    R = {"desde": str(df.index.min()), "hasta": str(df.index.max()), "velas_1m": int(len(df))}

    # ---- velas de 1h en hora ET
    H = bars(df, "1h")
    H = H[H.n >= 50].copy()  # horas casi completas
    H["hour"] = H.t.dt.hour
    H["dow"] = H.t.dt.dayofweek
    H["year"] = H.t.dt.year
    H["rng"] = H.h - H.l
    H["rng_pct"] = H.rng / H.o * 100
    H["ret_pct"] = (H.c - H.o) / H.o * 100
    H["eff"] = (H.c - H.o).abs() / H.rng.replace(0, np.nan)  # 1 = hora direccional, 0 = ida y vuelta

    # normalizar por el rango diario medio de los 20 días previos (quita el efecto de que el oro pasó de 1.800 a 4.000+)
    D = df.groupby("tday").agg(o=("o", "first"), h=("h", "max"), l=("l", "min"), c=("c", "last"), n=("c", "size"))
    D = D[D.n >= 600]
    D["rng"] = D.h - D.l
    D["adr20"] = D.rng.rolling(20).mean().shift(1)
    H = H.merge(D[["adr20"]], left_on="tday", right_index=True, how="inner").dropna(subset=["adr20"])
    H["rng_adr"] = H.rng / H.adr20

    by = H.groupby("hour")
    tab = pd.DataFrame({
        "muestras": by.size(),
        "rango_medio_usd_2026": H[H.year == 2026].groupby("hour").rng.mean(),
        "rango_pct_medio": by.rng_pct.mean(),
        "rango_pct_mediana": by.rng_pct.median(),
        "pct_del_rango_diario": by.rng_adr.mean() * 100,
        "eficiencia_direccional": by.eff.mean(),
        "rango_sobre_spread_2026": H[H.year == 2026].groupby("hour").rng.median() / SPREAD,
        "ret_medio_pct": by.ret_pct.mean(),
        "t_ret": by.ret_pct.apply(tstat),
        "pct_horas_alcistas": by.ret_pct.apply(lambda s: (s > 0).mean() * 100),
    })
    # probabilidad de que la hora tenga un "movimiento operable": rango >= 25% del rango diario medio
    tab["prob_rango_ge_25pct_ADR"] = by.rng_adr.apply(lambda s: (s >= 0.25).mean() * 100)
    tab["prob_rango_ge_40pct_ADR"] = by.rng_adr.apply(lambda s: (s >= 0.40).mean() * 100)
    tab["ranking"] = tab.pct_del_rango_diario.rank(ascending=False).astype(int)
    tab.round(3).to_csv(out / "por_hora_ET.csv")
    R["por_hora"] = tab.round(3).reset_index().to_dict("records")

    # estabilidad: ranking de cada hora año por año
    yr = H.groupby(["year", "hour"]).rng_adr.mean().unstack(0) * 100
    yr.round(1).to_csv(out / "por_hora_y_anio.csv")
    R["por_hora_y_anio"] = {int(c): yr[c].round(1).to_dict() for c in yr.columns}

    # día de la semana x hora
    dh = H.groupby(["dow", "hour"]).rng_adr.mean().unstack(0) * 100
    dh.round(1).to_csv(out / "dia_x_hora.csv")
    R["dia_x_hora"] = {int(c): dh[c].round(1).to_dict() for c in dh.columns}

    # ---- dónde se forman el máximo y el mínimo del día
    tmp = df.copy()
    tmp["hour"] = tmp.index.hour
    hi_idx = tmp.groupby("tday").h.idxmax()
    lo_idx = tmp.groupby("tday").l.idxmin()
    days = D.index.intersection(hi_idx.index)
    hi_h = pd.Series(hi_idx.loc[days].map(lambda t: t.hour).values)
    lo_h = pd.Series(lo_idx.loc[days].map(lambda t: t.hour).values)
    ext = pd.DataFrame({"maximo_del_dia_pct": hi_h.value_counts(normalize=True) * 100,
                        "minimo_del_dia_pct": lo_h.value_counts(normalize=True) * 100}).fillna(0).sort_index()
    ext["algun_extremo_pct"] = (ext.maximo_del_dia_pct + ext.minimo_del_dia_pct) / 2
    ext.round(2).to_csv(out / "extremos_del_dia.csv")
    R["extremos"] = ext.round(2).reset_index().rename(columns={"index": "hour"}).to_dict("records")
    R["dias"] = int(len(days))

    # ---- velas de 15m: perfil fino de volatilidad (en % del rango diario)
    Q = bars(df, "15min")
    Q = Q[Q.n >= 12].merge(D[["adr20"]], left_on="tday", right_index=True).dropna()
    Q["slot"] = Q.t.dt.strftime("%H:%M")
    Q["rng_adr"] = (Q.h - Q.l) / Q.adr20 * 100
    q = Q.groupby("slot").rng_adr.agg(["mean", "median", "size"])
    q.round(2).to_csv(out / "perfil_15m.csv")
    R["perfil_15m_top"] = q.sort_values("mean", ascending=False).head(16).round(2).reset_index().to_dict("records")

    # ---- ¿continuación o reversión? retorno de una ventana vs. la siguiente
    def win(start, end):
        m = df[(df.index.strftime("%H:%M") >= start) & (df.index.strftime("%H:%M") < end)]
        g = m.groupby("tday")
        return (g.c.last() - g.o.first()) / D.adr20.reindex(g.c.last().index)

    windows = {
        "asia_18_02": ("18:00", "23:59"), "asia_00_03": ("00:00", "03:00"),
        "londres_03_05": ("03:00", "05:00"), "londres_05_08": ("05:00", "08:00"),
        "ny_0820_0830": ("08:20", "08:30"), "ny_0830_0930": ("08:30", "09:30"),
        "ny_0930_1100": ("09:30", "11:00"), "ny_1100_1300": ("11:00", "13:00"),
        "ny_1300_1700": ("13:00", "17:00"),
    }
    W = pd.DataFrame({k: win(*v) for k, v in windows.items()}).dropna()
    pairs = [("asia_00_03", "londres_03_05"), ("londres_03_05", "londres_05_08"), ("londres_03_05", "ny_0830_0930"),
             ("londres_05_08", "ny_0830_0930"), ("ny_0820_0830", "ny_0830_0930"), ("ny_0830_0930", "ny_0930_1100"),
             ("ny_0830_0930", "ny_1100_1300"), ("ny_0930_1100", "ny_1100_1300"), ("ny_1100_1300", "ny_1300_1700")]
    cont = []
    for a, b in pairs:
        s = np.sign(W[a]) * W[b]  # >0 = sigue la dirección de la ventana a
        big = W[a].abs() > W[a].abs().quantile(0.7)  # solo cuando la ventana a se movió fuerte
        cont.append({"si": a, "luego": b, "prob_misma_direccion": round((np.sign(W[a]) == np.sign(W[b])).mean() * 100, 1),
                     "prob_misma_dir_si_a_fuerte": round((np.sign(W[a][big]) == np.sign(W[b][big])).mean() * 100, 1),
                     "media_R_siguiendo": round(s.mean(), 4), "t": round(tstat(s), 2), "n": int(len(s))})
    R["continuacion"] = cont
    pd.DataFrame(cont).to_csv(out / "continuacion.csv", index=False)

    # ---- rango asiático (18:00-03:00 ET): ¿lo rompe Londres? ¿lo rompe NY?
    rows = []
    for d, g in df.groupby("tday"):
        t = g.index.strftime("%H:%M")
        a = g[(t >= "18:00") | (t < "03:00")]
        lo_ = g[(t >= "03:00") & (t < "08:00")]
        ny = g[(t >= "08:00") & (t < "12:00")]
        if len(a) < 400 or len(lo_) < 250 or len(ny) < 200:
            continue
        ah, al = a.h.max(), a.l.min()
        rows.append({"tday": d, "asia_rng": ah - al,
                     "lon_rompe_arriba": lo_.h.max() > ah, "lon_rompe_abajo": lo_.l.min() < al,
                     "ny_rompe_arriba": ny.h.max() > max(ah, lo_.h.max()), "ny_rompe_abajo": ny.l.min() < min(al, lo_.l.min()),
                     "ext_lon_arriba": (lo_.h.max() - ah) / (ah - al), "ext_lon_abajo": (al - lo_.l.min()) / (ah - al)})
    A = pd.DataFrame(rows)
    R["rango_asia"] = {
        "dias": int(len(A)),
        "londres_rompe_algun_lado_pct": round((A.lon_rompe_arriba | A.lon_rompe_abajo).mean() * 100, 1),
        "londres_rompe_ambos_lados_pct": round((A.lon_rompe_arriba & A.lon_rompe_abajo).mean() * 100, 1),
        "ny_hace_nuevo_extremo_de_sesion_pct": round((A.ny_rompe_arriba | A.ny_rompe_abajo).mean() * 100, 1),
        "extension_mediana_londres_x_rango_asia": round(float(pd.concat([A.ext_lon_arriba[A.lon_rompe_arriba],
                                                                           A.ext_lon_abajo[A.lon_rompe_abajo]]).median()), 2),
    }

    # ---- día de la semana
    D2 = D.dropna().copy()
    D2["dow"] = D2.index.dayofweek
    D2["rng_rel"] = D2.rng / D2.adr20 * 100
    R["dia_semana"] = D2.groupby("dow").rng_rel.mean().round(1).to_dict()

    # ---- NFP (aprox.: primer viernes del mes) vs. resto de viernes, ventana 08:20-09:30 ET
    Hf = H[H.dow == 4].copy()
    Hf["nfp"] = Hf.t.dt.day <= 7
    R["nfp_8h_ET"] = Hf[Hf.hour == 8].groupby("nfp").rng_adr.mean().mul(100).round(1).to_dict()

    (out / "resumen.json").write_text(json.dumps(R, indent=1, ensure_ascii=False, default=str))
    pd.set_option("display.width", 250)
    pd.set_option("display.max_columns", 30)
    print(R["desde"], "→", R["hasta"], "| días:", R["dias"])
    print(tab.round(2).sort_values("pct_del_rango_diario", ascending=False).to_string())
    print("\nPor año (% del rango diario medio):\n", yr.round(1).to_string())
    print("\nDía x hora:\n", dh.round(0).to_string())
    print("\nExtremos del día:\n", ext.round(1).to_string())
    print("\nTop 15m:\n", q.sort_values("mean", ascending=False).head(16).round(1).to_string())
    print("\nContinuación:\n", pd.DataFrame(cont).to_string())
    print("\nRango Asia:", R["rango_asia"])
    print("Día semana:", R["dia_semana"])
    print("NFP 8h ET:", R["nfp_8h_ET"])


if __name__ == "__main__":
    main(*sys.argv[1:3])
