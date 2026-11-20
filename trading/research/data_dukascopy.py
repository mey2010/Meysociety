"""Descarga velas de 1 minuto (bid y ask) de Dukascopy, gratis y públicas, y las guarda por mes.

Fuente: https://datafeed.dukascopy.com/datafeed/{SYM}/{YYYY}/{MM-1}/{DD}/{BID|ASK}_candles_min_1.bi5
Solo se baja el ASK 1 de cada N días (por el límite de frecuencia); el resto usa un modelo de spread.
Formato: LZMA, registros de 24 bytes big-endian
  (segundos desde 00:00 UTC, open, close, low, high, volumen). Precio = entero / scale.
Horas en UTC. Cada parquet mensual guarda la fuente y la hora de descarga en sus metadatos.
Dukascopy limita la frecuencia (503/429): se descarga de a un archivo, con pausa y reintentos.

Uso: python3 data_dukascopy.py XAUUSD 2022-11-01 2026-11-20 OUT_DIR
"""
import datetime as dt
import lzma
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd

SCALE = {"XAUUSD": 1000, "XAGUSD": 1000, "EURUSD": 100000}
UA = "Mozilla/5.0 (research data downloader)"
REC = np.dtype([("s", ">i4"), ("o", ">i4"), ("c", ">i4"), ("l", ">i4"), ("h", ">i4"), ("v", ">f4")])


def fetch(sym, day, side):
    url = (f"https://datafeed.dukascopy.com/datafeed/{sym}/{day.year}/{day.month - 1:02d}/"
           f"{day.day:02d}/{side}_candles_min_1.bi5")
    for attempt in range(10 ** 6):  # sin rendirse: Dukascopy corta a ratos
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read()
            time.sleep(1.0)
            if not raw:
                return None
            return np.frombuffer(lzma.decompress(raw), dtype=REC).astype(REC.newbyteorder("="))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            print(f"  reintento {attempt + 1} ({e.code}) {url}", flush=True)
            time.sleep(min(15 * (attempt + 1), 300))
        except Exception as e:
            print(f"  reintento {attempt + 1} ({type(e).__name__}) {url}", flush=True)
            time.sleep(min(15 * (attempt + 1), 300))
    raise RuntimeError(f"fallo persistente: {url}")


def cached(sym, day, side, raw_dir):
    f = raw_dir / sym / side / f"{day:%Y-%m-%d}.npy"
    if f.exists():
        a = np.load(f)
        return a if len(a) else None
    a = fetch(sym, day, side)
    f.parent.mkdir(parents=True, exist_ok=True)
    np.save(f, a if a is not None else np.zeros(0, REC.newbyteorder("=")))
    return a


def spread_model(sym, raw_dir):
    """Spread mediano (ask-bid al cierre de cada minuto) por mes y hora UTC, de los días con ASK."""
    s = SCALE[sym]
    rows = []
    for fa in sorted((raw_dir / sym / "ASK").glob("*.npy")):
        fb = raw_dir / sym / "BID" / fa.name
        a, b = np.load(fa), np.load(fb) if fb.exists() else np.zeros(0)
        if not len(a) or len(a) != len(b):
            continue
        m = b["v"] > 0
        day = dt.date.fromisoformat(fa.stem)
        rows.append(pd.DataFrame({"ym": f"{day:%Y-%m}", "hour": b["s"][m] // 3600,
                                  "spread": (a["c"][m] - b["c"][m]) / s}))
    df = pd.concat(rows)
    return df.groupby(["ym", "hour"]).spread.median()


def day_frame(sym, day, raw_dir, ask_every):
    b = cached(sym, day, "BID", raw_dir)
    if b is None:
        return None
    if day.toordinal() % ask_every == 0:
        cached(sym, day, "ASK", raw_dir)
    s = SCALE[sym]
    ts = np.datetime64(day, "s") + b["s"].astype("timedelta64[s]")
    df = pd.DataFrame({"ts": ts, "bo": b["o"] / s, "bh": b["h"] / s, "bl": b["l"] / s, "bc": b["c"] / s,
                       "vol": b["v"], "hour": b["s"] // 3600})
    return df[df.vol > 0]


def main(sym, start, end, out, ask_every=5):
    out = Path(out)
    raw = out / "raw"
    start, end = dt.date.fromisoformat(start), dt.date.fromisoformat(end)
    day = dt.datetime.combine(start, dt.time())
    frames = []
    while day.date() < end:
        if day.weekday() != 5:
            p = day_frame(sym, day, raw, int(ask_every))
            if p is not None and len(p):
                frames.append(p)
        if (day + dt.timedelta(days=1)).day == 1:
            print(f"{sym} {day:%Y-%m}: descargado", flush=True)
        day += dt.timedelta(days=1)
    df = pd.concat(frames, ignore_index=True)
    sm = spread_model(sym, raw)
    ym = df.ts.dt.strftime("%Y-%m")
    key = pd.MultiIndex.from_arrays([ym, df.hour])
    spread = pd.Series(sm.reindex(key).values)
    # meses u horas sin muestra: mediana de esa hora en todo el período
    spread = spread.fillna(pd.Series(df.hour.map(sm.groupby(level=1).median()).values)).fillna(sm.median())
    for x in "ohlc":
        df["a" + x] = df["b" + x] + spread.values
    df["spread_est"] = spread.values
    df = df.drop(columns="hour")
    dest = out / sym
    dest.mkdir(parents=True, exist_ok=True)
    df["ym"] = ym
    for k, g in df.groupby("ym"):
        g = g.drop(columns="ym").reset_index(drop=True)
        g.attrs["source"] = "datafeed.dukascopy.com BID 1m; ASK estimado con modelo de spread mes x hora"
        g.attrs["downloaded_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
        g.to_parquet(dest / f"{k}.parquet", index=False)
    print(f"listo: {len(df):,} velas; spread mediano {sm.median():.3f}", flush=True)


if __name__ == "__main__":
    main(*sys.argv[1:])
