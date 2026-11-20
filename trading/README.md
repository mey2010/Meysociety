# Trading: oro (XAUUSD) en FundedHive / cTrader

Equipo nocturno de cuatro roles:

- **Radar** investiga setups.
- **Lab** los backtestea y los mata si no aguantan.
- **Forge** construye el bot.
- **Shield** aprueba o bloquea cada orden.

Las fichas de los setups ganadores están en [`ESTRATEGIAS.md`](ESTRATEGIAS.md).

## Estructura

| Ruta | Qué es |
|---|---|
| `research/data_histdata.py` | Descarga velas de 1m de XAUUSD de HistData.com (fuente principal) |
| `research/data_dukascopy.py`, `research/spread_sample.py` | Muestra del spread real (Dukascopy limita a 1 archivo/min) |
| `research/setups.py` | Radar: los 44 setups candidatos, cada uno explicado en una frase |
| `research/engine.py` | Motor de backtest sobre velas de 1m (ask/bid, slippage, stop antes que TP) |
| `research/lab.py` | Lab: walk-forward 12m/3m, stress ×2, Monte Carlo del examen y de la fondeada, filtro anti-HFT |
| `research/test_engine.py` | Tests del motor (`python3 -m pytest research/test_engine.py`) |
| `results/` | Salidas de Lab: `results.json`, `leaderboard.csv`, trades fuera de muestra |
| `cbot/GoldShield/` | El cBot para cTrader (C#): `GoldShieldBot.cs`, `Shield.cs`, `Setups.cs`, `SetupCore.cs` |
| `cbot/GoldShield.Tests/` | Tests de Shield y de paridad Python ↔ C# (`dotnet test`) |
| `data/` | Datos descargados (no se suben; se regeneran con los scripts) |

## Reproducir la investigación

```bash
pip install pandas numpy numba pyarrow pytest
cd trading/research
python3 data_histdata.py 2022 2026 ../data
python3 lab.py ../data ../results/round2 "" donchian_trend_h1,donchian_trend_h4,session_drift,trend_pullback_h1,asia_breakout_wide
python3 -m pytest -q test_engine.py
cd ../cbot/GoldShield.Tests && dotnet test
```

## Instalar el bot en cTrader (unos 5 minutos)

1. **Copiar los archivos.** En cTrader Desktop, ir a *Algo* → *New cBot* y llamarlo `GoldShield`.
   Pegar el contenido de los cuatro archivos `.cs` de `cbot/GoldShield/`: o se crean como
   archivos del mismo proyecto, o se pegan los cuatro, uno tras otro, en el archivo del cBot.
   Después, *Build*.
2. **Crear la instancia.** Agregar una instancia sobre **XAUUSD**; el timeframe del gráfico da
   igual, porque el bot pide sus propias velas.
3. **Configurar los parámetros:**

   | Parámetro | Valor |
   |---|---|
   | `Setup` | `donchian_trend;tf=240;n=20;tp_r=4;trend_n=0;hold_h=120` (líder) |
   | `Balance inicial` | 5000 |
   | `Riesgo por trade %` | 0.5 en el examen; 0.35 en la fondeada Moderate |
   | `Número de cuenta autorizada` | **el número de tu cuenta DEMO**. En cualquier otra cuenta el bot solo registra. |

4. **Guardar la configuración.** Con clic derecho en la instancia → *Save parameters*, queda un
   archivo `.cbotset`. Hay que guardar uno por setup; cambiar de setup es cargar otro archivo.
5. **Verificar el horario de las velas.** En el log, las velas de 4h tienen que abrir a las
   00/04/08/12/16/20 UTC. Si no coinciden, avisame antes de operar.
6. **Dejarlo corriendo 24/5.** En cTrader Cloud (*Run in cloud*, si FundedHive lo habilita) o en
   un VPS con cTrader Desktop abierto. El estado de Shield se guarda en LocalStorage, así que
   tras un reinicio retoma los contadores y las pausas.
7. **Ir a real ("go live").** Solo cuando lo decidas: cambiar `Número de cuenta autorizada` al de
   la cuenta del examen.

## Reglas de Shield (más estrictas que FundedHive Moderate)

| Regla | Shield | FundedHive Moderate |
|---|---|---|
| Riesgo por trade | 0,5% (máx. configurable 1,5%) | 1,5% |
| Corte del día (sobre equity, día 00:00 UTC) | −2% o 3 pérdidas seguidas | −3% |
| Pausa total (bajo el balance inicial) | −4%: el bot se detiene y solo un humano lo reactiva | −6% |
| Stop loss | Siempre adjunto. Si una posición queda sin stop, se cierra. | Obligatorio al cerrar |
| Anti-HFT | Máx. 6 trades por día, una posición a la vez, sin órdenes a ambos lados. Lab descarta los setups con más de 4 trades por día o una mediana de duración menor a 3 minutos. | Sin HFT ni copy trading |
| Feed caído | Más de 60 s sin ticks (fuera de la pausa diaria del oro) → cierra todo y corta el día | — |
| Fin de semana | Sin entradas desde el viernes a las 19:00 UTC; todo cerrado a las 20:45 UTC | Prohibido mantener posiciones el fin de semana en la fondeada |
| Spread | No entra con spread mayor a 0,80 USD | — |

## Agenkit

agenkit.xyz es un kit de pago (suscripción con clave de licencia) que no está instalado en este
entorno. Forge siguió las mismas fases (*Orient → Brainstorm → Architecture → Build (tests
primero) → Review → Ship*) con las skills equivalentes del repo (`writing-plans`,
`test-driven-development`, `requesting-code-review`). Si querés usar Agenkit en sí, hace falta
comprarlo e instalarlo.
