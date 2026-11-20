"""Muestra el spread real de XAUUSD en Dukascopy: BID+ASK de 1m en 1 de cada N días (por el límite de frecuencia).
Resultado: data/spread_model.csv con el spread mediano por año y hora UTC. Uso: python3 spread_sample.py 2022-01-01 2026-11-20 data 30"""
import datetime as dt
import sys
from pathlib import Path
from data_dukascopy import cached, spread_model

start, end, out, every = dt.date.fromisoformat(sys.argv[1]), dt.date.fromisoformat(sys.argv[2]), Path(sys.argv[3]), int(sys.argv[4])
raw = out / "raw"
d = start
while d < end:
    if d.weekday() < 5 and d.toordinal() % every == 0:
        day = dt.datetime.combine(d, dt.time())
        if cached("XAUUSD", day, "BID", raw) is not None:
            cached("XAUUSD", day, "ASK", raw)
        print(f"muestra {d}", flush=True)
        try:
            sm = spread_model("XAUUSD", raw).reset_index()
            sm["year"] = sm.ym.str[:4]
            sm.groupby(["year", "hour"]).spread.median().to_csv(out / "spread_model.csv")
        except ValueError:
            pass
    d += dt.timedelta(days=1)
print("listo spread", flush=True)
