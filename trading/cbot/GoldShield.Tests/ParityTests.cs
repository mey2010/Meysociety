// Paridad: el C# del bot tiene que dar EXACTAMENTE las mismas señales que el backtest de Python.
// Los fixtures los genera trading/research (velas reales de HistData y señales de setups.py).
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using GoldShield;
using Xunit;

public class ParityTests
{
    static string Fx(string f) => Path.Combine(AppContext.BaseDirectory, "fixtures", f);

    static (DateTime[] t, double[] o, double[] h, double[] l, double[] c) Bars(string f)
    {
        var rows = File.ReadAllLines(Fx(f)).Skip(1).Select(x => x.Split(',')).ToArray();
        DateTime P(string s) => DateTime.SpecifyKind(DateTime.Parse(s, CultureInfo.InvariantCulture), DateTimeKind.Utc);
        double D(string s) => double.Parse(s, CultureInfo.InvariantCulture);
        return (rows.Select(r => P(r[0])).ToArray(), rows.Select(r => D(r[1])).ToArray(), rows.Select(r => D(r[2])).ToArray(),
                rows.Select(r => D(r[3])).ToArray(), rows.Select(r => D(r[4])).ToArray());
    }

    static List<string[]> Csv(string f) => File.ReadAllLines(Fx(f)).Skip(1).Select(x => x.Split(',')).ToList();

    [Theory]
    [InlineData("bars_240.csv", "donchian_240_n20_tp4.0_t0.csv", 20, 4.0, 0)]
    [InlineData("bars_60.csv", "donchian_60_n20_tp4.0_t200.csv", 20, 4.0, 200)]
    public void DonchianMatchesPython(string bars, string expected, int n, double tpR, int trendN)
    {
        var (t, o, h, l, c) = Bars(bars);
        var exp = Csv(expected).ToDictionary(r => r[0] + "|" + r[1], r => r);
        int found = 0;
        for (int i = 0; i < c.Length; i++)
        {
            var s = SetupCore.Donchian(h, l, c, i, n, 2.0, tpR, trendN);
            if (s == null) continue;
            var key = t[i].ToString("yyyy-MM-ddTHH:mm:ss") + "|" + s.Value.Side;
            Assert.True(exp.ContainsKey(key), $"señal de C# que Python no tiene: {key}");
            Assert.Equal(double.Parse(exp[key][2], CultureInfo.InvariantCulture), s.Value.StopLoss, 6);
            Assert.Equal(double.Parse(exp[key][3], CultureInfo.InvariantCulture), s.Value.TakeProfit, 6);
            found++;
        }
        Assert.Equal(exp.Count, found);
    }

    [Fact]
    public void SessionDriftAtrMatchesPython()
    {
        var (t, o, h, l, c) = Bars("bars_15.csv");
        var exp = Csv("drift_asia.csv");
        int checkedN = 0;
        foreach (var r in exp)
        {
            var ts = DateTime.SpecifyKind(DateTime.Parse(r[0], CultureInfo.InvariantCulture), DateTimeKind.Utc);
            int k = Array.IndexOf(t, ts);
            Assert.True(k > 0, $"vela {ts} no encontrada");
            double a = SetupCore.HourlyAtr(t, h, l, c, k - 1, ts);
            double sl = o[k] - 1.5 * a;
            Assert.Equal(double.Parse(r[2], CultureInfo.InvariantCulture), sl, 6);
            checkedN++;
        }
        // y ninguna apertura de 23:00 quedó sin señal
        int opens = t.Count(x => x.Hour == 23 && x.Minute == 0);
        Assert.Equal(opens, checkedN + t.Select((x, i) => (x, i)).Count(p => p.x.Hour == 23 && p.x.Minute == 0 &&
                                         double.IsNaN(SetupCore.HourlyAtr(t, h, l, c, p.i - 1, p.x))));
    }
}
