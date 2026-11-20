using System;
using GoldShield;
using Xunit;

public class ShieldTests
{
    static readonly DateTime Tue10 = new DateTime(2026, 11, 24, 10, 0, 0, DateTimeKind.Utc);

    static Shield New(double balance = 5000, ShieldConfig cfg = null)
    {
        var s = new Shield(cfg ?? new ShieldConfig(), new ShieldState());
        s.RollDay(Tue10, balance);
        return s;
    }

    [Fact]
    public void AllowsNormalTradeAtHalfPercentRisk()
    {
        var s = New();
        Assert.True(s.CanOpen(Tue10, 5000, 5000, 25, 0.3, false, true).Ok);
    }

    [Fact]
    public void BlocksWithoutStopLoss() =>
        Assert.False(New().CanOpen(Tue10, 5000, 5000, 25, 0.3, false, false).Ok);

    [Fact]
    public void BlocksRiskAboveCap() =>
        Assert.False(New().CanOpen(Tue10, 5000, 5000, 26, 0.3, false, true).Ok);

    [Fact]
    public void BlocksWideSpreadAndExistingExposure()
    {
        var s = New();
        Assert.False(s.CanOpen(Tue10, 5000, 5000, 25, 1.2, false, true).Ok);
        Assert.False(s.CanOpen(Tue10, 5000, 5000, 25, 0.3, true, true).Ok);
    }

    [Fact]
    public void ThreeLossesInARowStopTheDayButNextDayResets()
    {
        var s = New();
        for (int i = 0; i < 3; i++) s.OnClosed(Tue10, -10, 5000 - 10 * (i + 1), 5000 - 10 * (i + 1));
        Assert.False(s.CanOpen(Tue10.AddMinutes(5), 4970, 4970, 25, 0.3, false, true).Ok);
        Assert.True(s.CanOpen(Tue10.AddDays(1), 4970, 4970, 25, 0.3, false, true).Ok);
    }

    [Fact]
    public void WinResetsLossStreak()
    {
        var s = New();
        s.OnClosed(Tue10, -10, 4990, 4990);
        s.OnClosed(Tue10, -10, 4980, 4980);
        s.OnClosed(Tue10, 30, 5010, 5010);
        s.OnClosed(Tue10, -10, 5000, 5000);
        Assert.True(s.CanOpen(Tue10, 5000, 5000, 25, 0.3, false, true).Ok);
    }

    [Fact]
    public void DayStopOnFloatingEquity()
    {
        var s = New();
        var d = s.Check(Tue10, 4899, Tue10, true); // -2.02% flotante
        Assert.False(d.Ok);
        Assert.True(s.State.HaltedToday);
    }

    [Fact]
    public void BlocksTradeWhoseStopWouldBreachDayStop()
    {
        var s = New();
        // día en -1.6%: un stop de 0.5% lo llevaría a -2.1%
        Assert.False(s.CanOpen(Tue10, 4920, 4920, 25, 0.3, false, true).Ok);
    }

    [Fact]
    public void TotalPauseIsStickyAcrossDays()
    {
        var s = New(4850);
        Assert.False(s.Check(Tue10, 4799, Tue10, true).Ok);
        Assert.True(s.State.HaltedTotal);
        Assert.False(s.CanOpen(Tue10.AddDays(1), 4799, 4799, 25, 0.3, false, true).Ok);
    }

    [Fact]
    public void StaleFeedHaltsOnlyWhenFeedMatters()
    {
        var s = New();
        Assert.True(s.Check(Tue10, 5000, Tue10.AddSeconds(-120), false).Ok);
        Assert.False(s.Check(Tue10, 5000, Tue10.AddSeconds(-61), true).Ok);
    }

    [Fact]
    public void FridayEveningAndWeekendRules()
    {
        var fri = new DateTime(2026, 11, 27, 19, 30, 0, DateTimeKind.Utc);
        var s = New();
        Assert.False(s.CanOpen(fri, 5000, 5000, 25, 0.3, false, true).Ok);
        Assert.False(s.Check(fri.AddHours(1).AddMinutes(15), 5000, fri.AddHours(1).AddMinutes(15), true).Ok);
        Assert.False(s.CanOpen(fri.AddDays(1), 5000, 5000, 25, 0.3, false, true).Ok);
    }

    [Fact]
    public void MaxTradesPerDay()
    {
        var s = New();
        for (int i = 0; i < 6; i++) s.OnOpened();
        Assert.False(s.CanOpen(Tue10, 5000, 5000, 25, 0.3, false, true).Ok);
    }

    [Fact]
    public void StateRoundTripsThroughStorage()
    {
        var s = New();
        s.OnClosed(Tue10, -10, 4990, 4990);
        s.OnOpened();
        var copy = ShieldState.Parse(s.State.Serialize());
        Assert.Equal(s.State.Day, copy.Day);
        Assert.Equal(1, copy.ConsecutiveLosses);
        Assert.Equal(1, copy.TradesToday);
        Assert.Equal(5000, copy.DayStartBalance);
    }
}
