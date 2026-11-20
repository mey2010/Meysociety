// Modos predefinidos del bot (lógica pura, testeada en GoldShield.Tests/ModesTests.cs).
// Examen: un poco más agresivo pero con techo duro. Fondeada: lo más seguro (FundedHive Moderate).
using System;

namespace GoldShield
{
    public enum BotMode { Examen, Fondeada, Personalizado }

    public sealed class ModePreset
    {
        public string SetupLine;
        public double RiskPct, DayStopPct, TotalPausePct;
        public int MaxLosses;
    }

    public static class Modes
    {
        /// Examen (reglas de la firma: -5% diario, -10% total, 3% por trade):
        ///   deriva asiática larga a 1,5%; corte del día -3%; pausa en -6% bajo el inicial (4% antes del límite de la firma).
        ///   Backtest (estimación Monte Carlo): 60 días hábiles -> aprueba 61%, pausa 15%, rompe 0%.
        /// Fondeada (Moderate: -3% diario, -6% total, 1,5% por trade):
        ///   Donchian 4h a 0,35%; corte del día -2%; pausa en -4%. DD máx. del backtest a 0,35%: -6,0%.
        public static ModePreset Get(BotMode m) => m switch
        {
            BotMode.Examen => new ModePreset
            {
                SetupLine = "session_drift;session=asia;side=1", RiskPct = 1.5, DayStopPct = 3.0, TotalPausePct = 6.0, MaxLosses = 3
            },
            BotMode.Fondeada => new ModePreset
            {
                SetupLine = "donchian_trend;tf=240;n=20;tp_r=4;trend_n=0;hold_h=120", RiskPct = 0.35, DayStopPct = 2.0, TotalPausePct = 4.0, MaxLosses = 3
            },
            _ => null,
        };
    }
}
