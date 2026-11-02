#!/usr/bin/env python3
"""Analiza el vuelo de cámara del recorrido (web/lib/content.ts).

Reproduce la misma interpolación que la web (stateAt en lib/journey/run.ts +
lerpCamera en lib/journey/world.ts), la muestrea en miles de puntos por pantalla de scroll con Numba y
avisa de los tramos donde la cámara se mueve demasiado rápido por pantalla.

Uso:
    pip install -r tools/requirements.txt
    python3 tools/camera_path.py                  # informe con umbrales por defecto
    python3 tools/camera_path.py --samples 20000  # más resolución
    python3 tools/camera_path.py --max-km 30 --max-heading 120 --max-pitch 60

Requiere Node.js >= 22.18 para leer content.ts tal cual lo usa la web.
Sale con código 1 si algún tramo supera un umbral (útil en CI).
"""
import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from numba import njit

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "web" / "lib" / "content.ts"


def load_scenes(path):
    # content.ts se carga con el soporte de TypeScript de Node (>= 22.18)
    js = (
        f"import({json.dumps(path.resolve().as_uri())})"
        ".then(m=>process.stdout.write(JSON.stringify(m.SCENES)))"
    )
    out = subprocess.run(["node", "--no-warnings", "-e", js], check=True, capture_output=True, text=True)
    return json.loads(out.stdout)


@njit(cache=True)
def _ease(t):
    # smootherstep, igual que lib/journey/run.ts
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


@njit(cache=True)
def _sample_travel(a, b, length, n):
    """Muestrea un tramo travel. a/b = [lon, lat, height, heading, pitch].

    Devuelve los picos por pantalla de scroll (km sobre el suelo, factor de
    cambio de altura, grados de heading, grados de pitch) y los km totales.
    """
    dh = ((b[3] - a[3] + 540.0) % 360.0) - 180.0
    la, lb = math.log(a[2]), math.log(b[2])
    du = length / (n - 1)
    peak_km = 0.0
    peak_zoom = 0.0
    peak_head = 0.0
    peak_pitch = 0.0
    total_km = 0.0
    plon = a[0]
    plat = a[1]
    plh = la
    phead = a[3]
    ppitch = a[4]
    for i in range(1, n):
        e = _ease(i / (n - 1))
        lon = a[0] + (b[0] - a[0]) * e
        lat = a[1] + (b[1] - a[1]) * e
        lh = la + (lb - la) * e
        head = a[3] + dh * e
        pitch = a[4] + (b[4] - a[4]) * e
        # distancia haversine en km entre muestras consecutivas
        p1 = math.radians(plat)
        p2 = math.radians(lat)
        dphi = p2 - p1
        dlmb = math.radians(lon - plon)
        h = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
        d_km = 2.0 * 6371.0 * math.asin(math.sqrt(h))
        total_km += d_km
        peak_km = max(peak_km, d_km / du)
        peak_zoom = max(peak_zoom, abs(lh - plh) / du)
        peak_head = max(peak_head, abs(head - phead) / du)
        peak_pitch = max(peak_pitch, abs(pitch - ppitch) / du)
        plon, plat, plh, phead, ppitch = lon, lat, lh, head, pitch
    return peak_km, math.exp(peak_zoom), peak_head, peak_pitch, total_km


def cam_vec(c):
    return np.array([c["lon"], c["lat"], c["height"], c["heading"], c["pitch"]], dtype=np.float64)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", type=Path, default=CONFIG)
    ap.add_argument("--samples", type=int, default=5000, help="muestras por tramo")
    ap.add_argument("--max-km", type=float, default=40.0, help="km sobre el suelo por pantalla de scroll")
    ap.add_argument("--max-zoom", type=float, default=150.0, help="factor de cambio de altura por pantalla")
    ap.add_argument("--max-heading", type=float, default=180.0, help="grados de giro por pantalla")
    ap.add_argument("--max-pitch", type=float, default=90.0, help="grados de inclinación por pantalla")
    args = ap.parse_args()

    scenes = load_scenes(args.config)
    limits = (args.max_km, args.max_zoom, args.max_heading, args.max_pitch)
    names = ("km/pant.", "zoom x/pant.", "giro °/pant.", "pitch °/pant.")

    print(f"{'tramo':<26}{'pant.':>6}{'km':>8}" + "".join(f"{n:>16}" for n in names))
    flagged = 0
    for i in range(1, len(scenes)):
        s = scenes[i]
        if not s.get("travel"):
            continue
        a, b = cam_vec(scenes[i - 1]["camera"]), cam_vec(s["camera"])
        km, zoom, head, pitch, dist = _sample_travel(a, b, float(s["travel"]), args.samples)
        cells, bad = [], []
        for v, lim, n in zip((km, zoom, head, pitch), limits, names):
            over = v > lim
            if over:
                bad.append(n)
            cells.append(f"{v:>15.1f}{'!' if over else ' '}")
        label = f"{scenes[i - 1]['id']} → {s['id']}"
        print(f"{label:<26}{s['travel']:>6}{dist:>8.1f}" + "".join(cells))
        if bad:
            flagged += 1
            print(f"    ⚠ demasiado brusco en: {', '.join(bad)}; sube 'travel' o acerca los keyframes")

    print()
    print("Picos medidos con smootherstep (el centro del tramo va ~1,9× más rápido que la media).")
    if flagged:
        print(f"{flagged} tramo(s) superan los umbrales.")
        sys.exit(1)
    print("Todos los tramos dentro de los umbrales.")


if __name__ == "__main__":
    main()
