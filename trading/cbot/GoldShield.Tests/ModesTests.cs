using GoldShield;
using Xunit;

public class ModesTests
{
    [Fact]
    public void ExamPresetStaysInsideFirmExamRules()
    {
        var p = Modes.Get(BotMode.Examen);
        Assert.True(p.RiskPct <= 3.0);          // firma: 3% por trade en el examen
        Assert.True(p.DayStopPct < 5.0);        // firma: -5% diario
        Assert.True(p.TotalPausePct <= 10.0 - 4.0); // al menos 4% de margen con el -10% total
        Assert.StartsWith("session_drift", p.SetupLine);
    }

    [Fact]
    public void FundedPresetStaysInsideModerate()
    {
        var p = Modes.Get(BotMode.Fondeada);
        Assert.True(p.RiskPct <= 1.5 / 4);      // muy por debajo del 1,5% por trade
        Assert.True(p.DayStopPct < 3.0);        // Moderate: -3% diario
        Assert.True(p.TotalPausePct < 6.0);     // Moderate: -6% total
        Assert.StartsWith("donchian_trend", p.SetupLine);
    }

    [Fact]
    public void ExamRiskPassesShieldButDoubleIsBlocked()
    {
        var p = Modes.Get(BotMode.Examen);
        var cfg = new ShieldConfig { RiskPerTradePct = p.RiskPct, DayStopPct = p.DayStopPct, TotalPausePct = p.TotalPausePct };
        var now = new System.DateTime(2026, 11, 24, 23, 0, 0, System.DateTimeKind.Utc);
        var s = new Shield(cfg, new ShieldState());
        Assert.True(s.CanOpen(now, 5165, 5165, 75, 0.3, false, true).Ok);    // 1,5% de 5000
        Assert.False(s.CanOpen(now, 5165, 5165, 150, 0.3, false, true).Ok);  // 3%: bloqueado
    }

    [Fact]
    public void ExamPauseTriggersAt4700()
    {
        var p = Modes.Get(BotMode.Examen);
        var s = new Shield(new ShieldConfig { TotalPausePct = p.TotalPausePct, DayStopPct = p.DayStopPct }, new ShieldState());
        var now = new System.DateTime(2026, 11, 24, 10, 0, 0, System.DateTimeKind.Utc);
        s.RollDay(now, 4750);
        Assert.True(s.Check(now, 4701, now, true).Ok);
        Assert.False(s.Check(now, 4700, now, true).Ok);
        Assert.True(s.State.HaltedTotal);
    }
}
