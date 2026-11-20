"""Descarga velas de 1 minuto de XAUUSD (bid) de HistData.com, gratis y públicas.

Fuente: https://www.histdata.com/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/xauusd/AAAA[/MM]
Formato: AAAAMMDD HHMMSS;open;high;low;close;volumen. La hora es EST FIJA (UTC-5, sin horario de verano):
se convierte a UTC sumando 5 horas. HistData no trae volumen (columna en 0).
Años cerrados vienen en un solo zip; el año en curso, mes a mes.

Uso: python3 data_histdata.py 2022 2026 OUT_DIR
"""
import datetime as dt
import io
import re
import sys
import time
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

import pandas as pd

UA = "Mozilla/5.0 (research data downloader)"
BASE = "https://www.histdata.com/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/xauusd/"


def get(url, data=None, referer=None):
    h = {"User-Agent": UA}
    if referer:
        h["Referer"] = referer
    req = urllib.request.Request(url, data=data, headers=h)
    for attempt in range(8):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except Exception as e:
            print(f"  reintento {attempt + 1}: {type(e).__name__} {url}", flush=True)
            time.sleep(10 * (attempt + 1))
    raise RuntimeError(url)


def fetch(period):
    page_url = BASE + period
    page = get(page_url).decode("utf-8", "ignore")
    form = page[page.index('id="file_down"'):]
    form = form[:form.index("</form>")]
    fields = dict(re.findall(r'name="(\w+)" id="\w+" value="([^"]*)"', form))
    if not fields.get("tk"):
        return None
    raw = get("https://www.histdata.com/get.php", urllib.parse.urlencode(fields).encode(), referer=page_url)
    if raw[:2] != b"PK":
        return None
    z = zipfile.ZipFile(io.BytesIO(raw))
    name = [n for n in z.namelist() if n.lower().endswith(".csv")][0]
    df = pd.read_csv(z.open(name), sep=";", header=None, names=["t", "bo", "bh", "bl", "bc", "vol"])
    df["ts"] = pd.to_datetime(df.t, format="%Y%m%d %H%M%S") + pd.Timedelta(hours=5)  # EST fija -> UTC
    return df.drop(columns="t")


def main(y0, y1, out):
    out = Path(out) / "XAUUSD_hd"
    out.mkdir(parents=True, exist_ok=True)
    today = dt.date.today()
    periods = []
    for y in range(int(y0), int(y1) + 1):
        if y < today.year:
            periods.append(str(y))
        else:
            periods += [f"{y}/{m}" for m in range(1, today.month + 1)]
    for p in periods:
        f = out / (p.replace("/", "-") + ".parquet")
        if f.exists():
            continue
        df = fetch(p)
        if df is None or not len(df):
            print(f"{p}: sin datos", flush=True)
            continue
        df.attrs["source"] = f"histdata.com XAUUSD M1 ASCII {p} (EST fija convertida a UTC)"
        df.attrs["downloaded_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
        df.to_parquet(f, index=False)
        print(f"{p}: {len(df):,} velas {df.ts.min()} → {df.ts.max()}", flush=True)
        time.sleep(3)


if __name__ == "__main__":
    main(*sys.argv[1:4])
