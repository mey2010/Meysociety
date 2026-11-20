# Fichas de estrategia — XAUUSD (oro), cuenta FundedHive 5.000 €

Generado el 20-nov-2026. Todas las cifras salen de `results/round2/results.json`, que calcula
`research/lab.py` con datos reales. Lo que es estimación lo dice explícitamente.

## Datos y supuestos

| Concepto | Valor |
|---|---|
| Precios | HistData.com, XAUUSD M1 bid, del 02-01-2022 al 13-11-2026 (1.682.112 velas). Hora EST fija convertida a UTC. |
| Spread | **Estimación: 0,40 USD fijos.** La muestra real de Dukascopy en 2022 da 0,37–0,41 USD; el muestreo de 2023-2026 sigue en curso. |
| Comisión | 15 USD por millón negociado y por lado (PDF de condiciones de FundedHive, enero 2026). |
| Slippage | 0,05 USD/oz en entradas a mercado o stop y en salidas por stop. |
| Ejecución | Largos al ask, cortos al bid. Si el stop y el TP caen en el mismo minuto, cuenta el stop. Todo se cierra el viernes a las 20:45 UTC. |
| Walk-forward | Se eligen los parámetros con 12 meses y se opera con ellos los 3 meses siguientes, en ventanas rodantes. Fuera de muestra: 2023-01 → 2026-11 (15 ventanas). |
| Riesgo | 0,5% del balance inicial por trade (salvo que se indique otro). |
| Buy & hold del oro, mismo tramo fuera de muestra | **+112,7%** sin apalancar. No es replicable en esta cuenta: la fondeada no permite mantener posiciones el fin de semana. |

**Los 39 setups de scalping (1 a 15 minutos) se descartaron.** Todos pierden fuera de muestra
después de costos, y siguen perdiendo con medio spread (0,20 USD). El motivo es que su edge
bruto es de apenas +0,04 a +0,06R por trade, mientras que el spread se come entre 0,1 y 0,26R,
porque los stops son de solo 2 a 6 USD. El detalle está en `results/provisional/` y
`results/half_spread/`.

---

## Qué usa el bot en cada fase (decisión del 20-nov)

- **Examen:** el #3, la deriva asiática a **1,5%** de riesgo, un poco más agresiva pero con techo duro.
  - Shield corta el día en −3% y se pausa en −6% bajo el inicial (4.700 €).
  - Monte Carlo (estimación), partiendo de +3,31%:

    | Plazo | Aprueba | Pausa de Shield | Rompe la firma |
    |---|---|---|---|
    | 20 días hábiles | 26% | 3% | 0% |
    | 60 días hábiles | 61% (mediana 23 días) | 15% | 0% |

  - Peor trade del backtest a 1,5%: −2,17% (gap más allá del stop).
  - Aprobar en 3 a 5 días con este setup: menos del 2%. Con cualquier setup y al riesgo máximo de la firma: menos del 10%.
- **Fondeada (Moderate):** el #1, Donchian 4h a **0,35%**, corte del día en −2% y pausa en −4%.

## #1 — Donchian 4h (LÍDER para la fondeada)

**La idea:** cuando una vela de 4h cierra por encima del máximo de las 20 anteriores (o por
debajo del mínimo), se sigue esa dirección con el stop a 2 ATR.

**Por qué existe el edge y quién pierde:**
- El oro se mueve en tendencias largas, impulsadas por bancos centrales y tipos reales.
- Pierden los que venden la ruptura "porque ya subió mucho" y los que tienen stops cortos
  justo encima del rango.

**Reglas exactas** (config: `donchian_trend;tf=240;n=20;tp_r=4;trend_n=0;hold_h=120`):

| Regla | Detalle |
|---|---|
| Entrada | A mercado al cierre de una vela de 4h cuyo cierre supera el máximo de las 20 velas previas (o queda bajo su mínimo). |
| Stop | Cierre ∓ 2×ATR(14) de 4h. |
| Take profit | 4 veces la distancia del stop (8 ATR). |
| Salida por tiempo | A las 120 horas como máximo. |
| Fin de semana | Todo cerrado el viernes a las 20:45 UTC. |
| Simultaneidad | Una sola posición a la vez. |
| Tamaño | El que hace que el stop cueste el riesgo elegido. |

**Resultados fuera de muestra, después de costos** (2023-01 → 2026-11):

| Métrica | Valor |
|---|---|
| Trades | 312 (unos 7 por mes) |
| Resultado total | +19,9% del balance inicial |
| Profit factor | 1,29 |
| Acierto | 43% |
| Expectativa | +0,127R por trade |
| Drawdown máximo | −8,6% |
| Racha perdedora más larga | 10 trades |
| Peor mes | −3,6% (junio 2024) |
| Meses positivos | 62% |
| Por año | 2023: +1,0% · 2024: +0,9% · 2025: +12,7% · 2026: +5,3% |
| Por lado | largos +28,9% · cortos −9,1% |
| Por régimen mensual del oro | alcista +21,5% · bajista +3,0% · lateral −4,6% |
| Caída del oro de 2026 (máximo del 29-ene → hoy, −30%) | +0,3%: aguantó, pero sin ganar |

**Robustez:**
- Costos al doble (spread ×1,5, slippage ×2, comisión ×2): +18,7%.
- Entrada un minuto más tarde: +21,6%.
- Rejilla de parámetros: el **100%** de las combinaciones gana en todo el período. No depende
  de un valor afortunado.

**Riesgo por trade recomendado** (Monte Carlo de 1 año, remuestreando días; **estimación**):

| Riesgo | Retorno anual | DD máx. | Examen (desde +3,31%) | Fondeada Moderate |
|---|---|---|---|---|
| 0,25% | +2,7% | −4,3% | no llega en 1 año | pausa 2% |
| 0,35% | +3,7% | −6,0% | aprueba 22% | pausa 7% |
| **0,5%** | +5,3% | −8,6% | **aprueba 47%** (mediana 152 días hábiles), pausa 3%, rompe 0% | pausa 18% |

**Lo que la mata:**
- Un oro lateral durante meses: en rango pierde (−4,6% en meses laterales).
- **Condición de corte:** 50 trades seguidos con expectativa negativa, o un drawdown peor que
  −13% (1,5 veces el del backtest) a 0,5%.

**Primera señal de que se debilita:** profit factor de 3 meses por debajo de 1,0 mientras el
oro tiene tendencia (rango de 3 meses > 10%).

### WHY THIS COULD FAIL
1. Todo su beneficio viene de los **largos** en un oro que se duplicó. En un mercado bajista
   largo y ordenado, los cortos llevan 4 años perdiendo (−9,1%).
2. 2023 y 2024 quedaron casi planos: necesita años de tendencia fuerte para pagar los
   períodos laterales.
3. Es lento. A 0,5%, la mitad de las veces tarda más de 7 meses en aprobar el examen.
4. Las velas de 4h de HistData (hora EST fija convertida a UTC) pueden no coincidir al minuto
   con las de cTrader en FundedHive. Hay que verificar el horario de las velas antes de operar.

---

## #2 — Donchian 1h con filtro de tendencia

**La idea:** la misma ruptura, en velas de 1h, con 55 velas de canal y solo a favor de la
media de 200h.

**Edge y perdedor:** los mismos que en el #1, pero con más trades y más ruido.

**Config:** `donchian_trend;tf=60;n=55;tp_r=4;trend_n=200;hold_h=48` (la última elección del
walk-forward).

| Regla | Detalle |
|---|---|
| Entrada | A mercado al cierre de una vela de 1h que rompe el canal, solo a favor de la SMA(200). |
| Stop | 2×ATR(14) de 1h. |
| Take profit | 8 ATR. |
| Salida por tiempo | A las 48 horas como máximo. |
| Tamaño | Por riesgo, igual que el #1. |

**Fuera de muestra:**

| Métrica | Valor |
|---|---|
| Trades | 575 (12,8 por mes) |
| Resultado total | +32,2% |
| Profit factor | 1,18 |
| Expectativa | +0,112R por trade |
| **Drawdown máximo** | **−15,5%** |
| Racha perdedora más larga | 11 trades |
| Peor mes | −5,5% (enero 2024) |
| Por año | 2023: +3,3% · 2024: +6,6% · 2025: +13,1% · 2026: +9,3% |
| Por lado | largos +47,2% · cortos −14,9% |
| Por régimen | alcista +36,3% · bajista +4,6% · lateral −8,7% |
| Caída del oro de 2026 | +4,7% |
| Costos al doble | +22,0% |
| Un minuto tarde | +33,4% |
| Rejilla de parámetros | solo el **38%** de las combinaciones gana |

**Riesgo (estimación):**

| Riesgo | Retorno anual | DD máx. | Examen en 1 año | Fondeada Moderate |
|---|---|---|---|---|
| 0,35% | +6,0% | −10,8% | aprueba 57%, pausa 9% | pausa 30% |
| 0,5% | +8,6% | −15,5% | aprueba 69%, pausa 19% | pausa 43% |

**Lo que la mata:** el mismo corte que el #1, y además el drawdown no cabe en Moderate.

**Primera señal de que se debilita:** el walk-forward cambia de parámetros en cada ventana
(ya pasa: n=20 ↔ n=55).

### WHY THIS COULD FAIL
1. Es frágil: solo 4 de cada 10 combinaciones de parámetros ganan. Es más "afortunado" que
   "probado".
2. Su drawdown de −15,5% **no entra** en el −6% total de Moderate a ningún riesgo útil. Sirve
   para el examen, no para la fondeada.
3. Igual que el #1, depende de los largos.

---

## #3 — Deriva de la sesión asiática (largo)

**La idea:** comprar oro a las 23:00 UTC (apertura asiática) y cerrar a las 06:00 UTC, con el
stop a 1,5 ATR de 1h.

**Por qué existe el edge y quién pierde:** en 2023-2026, buena parte de la suba del oro se dio
en horario asiático, con demanda física y de bancos centrales de Asia. Pierden los que venden
el oro de noche esperando una reversión.

**Config:** `session_drift;session=asia;side=1`. El walk-forward la eligió en 12 de 15 ventanas.

**Fuera de muestra:**

| Métrica | Valor |
|---|---|
| Trades | 910 (1 por día hábil) |
| Resultado total | +33,2% |
| Profit factor | 1,21 |
| Acierto | 50% |
| Drawdown máximo | −15,9% |
| Racha perdedora más larga | 16 trades |
| Peor mes | −7,7% (septiembre 2023) |
| Por año | 2023: −8,1% · 2024: +9,1% · 2025: +18,6% · 2026: +13,7% |
| Por régimen | alcista +41,1% · **bajista −9,0%** · lateral +1,2% |
| Costos al doble | +19,2% |
| Un minuto tarde | +17,9% |
| Rejilla | 12%: de 8 combinaciones sesión/lado, solo funciona esta |

**Riesgo (estimación):**

| Riesgo | DD máx. | Examen en 1 año | Fondeada Moderate |
|---|---|---|---|
| 0,35% | −11,2% | aprueba 36% | pausa 11% |

### WHY THIS COULD FAIL
1. Es casi **beta pura**: estar largo en oro unas horas por día. En meses bajistas pierde (−9%).
2. Una sola combinación de 8 funciona. Si la demanda asiática cambia, el edge desaparece de un día para otro.
3. 2023 fue negativo (−8,1%): pueden pasar meses sin que funcione.
4. Entra todos los días sin filtro, así que en un mercado bajista acumula pérdidas sin parar.

Reserva: la **ruptura asiática ancha a favor de la tendencia diaria** (`asia_breakout_wide`)
gana en ambos lados (458 trades) y +7,2% en la caída de 2026, pero rinde poco: +2,5% al año a 0,5%.
