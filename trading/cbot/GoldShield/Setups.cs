// Setups: cada uno replica EXACTAMENTE la regla testeada en trading/research/setups.py.
// Solo velas cerradas: Evaluate se llama en BarClosed y mira Bars.Last(1) hacia atrás.
using System;
using System.Collections.Generic;
using System.Globalization;
using cAlgo.API;

namespace GoldShield
{
    public enum OrderKind { Market, Stop, Limit }

    public sealed class Signal
    {
        public TradeType Side;
        public OrderKind Kind;
        public double Price;        // solo stop/limit
        public double StopLoss;
        public double TakeProfit;
        public int ExpiryMinutes = 1;
        public string Reason = "";
    }

    public interface ISetup
    {
        string Name { get; }
        TimeFrame TimeFrame { get; }
        int EntryStartHourUtc { get; }
        int EntryEndHourUtc { get; }
        int MaxHoldMinutes { get; }
        Signal Evaluate(Bars bars, DateTime nowUtc);
    }

    public static class SetupFactory
    {
        public static ISetup Create(string line)
        {
            var parts = line.Split(';');
            var name = parts[0].Trim();
            var p = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (int i = 1; i < parts.Length; i++)
            {
                var kv = parts[i].Split('=');
                if (kv.Length == 2) p[kv[0].Trim()] = kv[1].Trim();
            }
            switch (name)
            {
                case "donchian_trend":
                    return new DonchianSetup(Tf(Int(p, "tf", 240)), Int(p, "n", 20), Dbl(p, "atr_mult", 2.0),
                        Dbl(p, "tp_r", 4.0), Int(p, "trend_n", 0), Int(p, "hold_h", 120));
                case "session_drift":
                    return new SessionDriftSetup(Str(p, "session", "asia"), Int(p, "side", 1), Dbl(p, "atr_mult", 1.5));
                default:
                    throw new ArgumentException($"setup desconocido: {name}");
            }
        }

        public static TimeFrame Tf(int m) => m switch
        {
            1 => TimeFrame.Minute, 3 => TimeFrame.Minute3, 5 => TimeFrame.Minute5, 15 => TimeFrame.Minute15,
            60 => TimeFrame.Hour, 240 => TimeFrame.Hour4,
            _ => throw new ArgumentException($"timeframe {m}m no soportado")
        };

        static int Int(Dictionary<string, string> p, string k, int d) => p.TryGetValue(k, out var v) ? int.Parse(v, CultureInfo.InvariantCulture) : d;
        static double Dbl(Dictionary<string, string> p, string k, double d) => p.TryGetValue(k, out var v) ? double.Parse(v, CultureInfo.InvariantCulture) : d;
        static string Str(Dictionary<string, string> p, string k, string d) => p.TryGetValue(k, out var v) ? v : d;
    }

    static class BarArrays
    {
        /// Copia las velas cerradas (todas menos la que está en formación).
        public static (DateTime[] t, double[] o, double[] h, double[] l, double[] c) Closed(Bars b, int max = 600)
        {
            int last = b.Count - 2;
            int first = Math.Max(0, last - max + 1);
            int n = last - first + 1;
            var t = new DateTime[n]; var o = new double[n]; var h = new double[n]; var l = new double[n]; var c = new double[n];
            for (int i = 0; i < n; i++)
            {
                int k = first + i;
                t[i] = b.OpenTimes[k]; o[i] = b.OpenPrices[k]; h[i] = b.HighPrices[k]; l[i] = b.LowPrices[k]; c[i] = b.ClosePrices[k];
            }
            return (t, o, h, l, c);
        }
    }

    /// Donchian: ruptura del máximo/mínimo de N velas cerradas, stop a 2 ATR, TP a tp_r veces el stop.
    public sealed class DonchianSetup : ISetup
    {
        readonly int _n, _trendN, _holdH;
        readonly double _atrMult, _tpR;
        public string Name { get; }
        public TimeFrame TimeFrame { get; }
        public int EntryStartHourUtc => 0;
        public int EntryEndHourUtc => 24;
        public int MaxHoldMinutes => _holdH * 60;

        public DonchianSetup(TimeFrame tf, int n, double atrMult, double tpR, int trendN, int holdH)
        {
            TimeFrame = tf; _n = n; _atrMult = atrMult; _tpR = tpR; _trendN = trendN; _holdH = holdH;
            Name = $"donchian_trend {tf} n={n} tp_r={tpR} trend_n={trendN}";
        }

        public Signal Evaluate(Bars bars, DateTime nowUtc)
        {
            var (t, o, h, l, c) = BarArrays.Closed(bars, Math.Max(_n, _trendN) + 50);
            int i = c.Length - 1;
            var s = SetupCore.Donchian(h, l, c, i, _n, _atrMult, _tpR, _trendN);
            if (s == null) return null;
            var v = s.Value;
            return new Signal
            {
                Side = v.Side > 0 ? TradeType.Buy : TradeType.Sell, Kind = OrderKind.Market,
                StopLoss = v.StopLoss, TakeProfit = v.TakeProfit,
                Reason = $"cierre {c[i]:F2} {(v.Side > 0 ? "sobre el máximo" : "bajo el mínimo")} de {_n} velas ({t[i]:MM-dd HH:mm})"
            };
        }
    }

    /// Deriva de sesión: abrir al empezar la sesión asiática (23:00 UTC) y cerrar a las 06:00, stop a 1,5 ATR de 1h.
    public sealed class SessionDriftSetup : ISetup
    {
        readonly int _side, _start, _end;
        readonly double _atrMult;
        public string Name { get; }
        public TimeFrame TimeFrame => TimeFrame.Minute15;
        public int EntryStartHourUtc => _start;
        public int EntryEndHourUtc => _start + 1;
        public int MaxHoldMinutes => ((_end - _start + 24) % 24) * 60;

        public SessionDriftSetup(string session, int side, double atrMult)
        {
            (_start, _end) = session switch
            {
                "asia" => (23, 6), "london" => (7, 11), "ny" => (13, 17), "late" => (17, 21),
                _ => throw new ArgumentException($"sesión desconocida: {session}")
            };
            _side = side; _atrMult = atrMult;
            Name = $"session_drift {session} lado={(side > 0 ? "largo" : "corto")}";
        }

        public Signal Evaluate(Bars bars, DateTime nowUtc)
        {
            var (t, o, h, l, c) = BarArrays.Closed(bars, 400);
            int i = c.Length - 1;
            // la vela que se acaba de abrir es la primera de la sesión (tras la pausa diaria, la anterior
            // cerrada puede ser de 21:45; por eso se mira la apertura de la vela nueva y no el cierre de la vieja)
            var sessionOpen = bars.OpenTimes[bars.Count - 1];
            if (sessionOpen.Hour != _start || sessionOpen.Minute != 0) return null;
            double a = SetupCore.HourlyAtr(t, h, l, c, i, sessionOpen);
            if (double.IsNaN(a)) return null;
            double px = bars.OpenPrices[bars.Count - 1];  // apertura de la vela de 23:00, igual que el backtest
            return new Signal
            {
                Side = _side > 0 ? TradeType.Buy : TradeType.Sell, Kind = OrderKind.Market,
                StopLoss = px - _side * _atrMult * a, TakeProfit = px + _side * 10 * _atrMult * a,
                Reason = $"apertura de sesión {_start}:00 UTC, ATR 1h {a:F2}"
            };
        }
    }
}
