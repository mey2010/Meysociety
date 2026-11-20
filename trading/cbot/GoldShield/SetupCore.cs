// Lógica pura de los setups (sin cTrader): arrays de velas cerradas -> señal.
// Replica trading/research/setups.py (donchian_trend, session_drift). Testeada contra Python en GoldShield.Tests.
using System;

namespace GoldShield
{
    public readonly struct CoreSignal
    {
        public readonly int Side;          // +1 compra, -1 venta
        public readonly double StopLoss, TakeProfit;
        public CoreSignal(int side, double sl, double tp) { Side = side; StopLoss = sl; TakeProfit = tp; }
    }

    public static class SetupCore
    {
        /// ATR simple de n velas que terminan en idx (rango verdadero con el cierre previo).
        public static double Atr(double[] h, double[] l, double[] c, int idx, int n = 14)
        {
            if (idx < n) return double.NaN;
            double s = 0;
            for (int i = idx - n + 1; i <= idx; i++)
            {
                double pc = c[i - 1];
                s += Math.Max(h[i] - l[i], Math.Max(Math.Abs(h[i] - pc), Math.Abs(l[i] - pc)));
            }
            return s / n;
        }

        /// Donchian: la vela i cierra por encima del máximo de las n velas anteriores (o por debajo del mínimo).
        /// Stop a atrMult*ATR(14) del cierre; TP a tpR veces esa distancia. trendN>0: solo a favor de la SMA(trendN).
        public static CoreSignal? Donchian(double[] h, double[] l, double[] c, int i, int n, double atrMult, double tpR, int trendN)
        {
            if (i < Math.Max(n, 15) || (trendN > 0 && i < trendN - 1)) return null;
            double hh = double.MinValue, ll = double.MaxValue;
            for (int k = i - n; k < i; k++) { hh = Math.Max(hh, h[k]); ll = Math.Min(ll, l[k]); }
            double a = Atr(h, l, c, i);
            if (double.IsNaN(a) || a <= 0) return null;
            double ma = double.NaN;
            if (trendN > 0)
            {
                double s = 0;
                for (int k = i - trendN + 1; k <= i; k++) s += c[k];
                ma = s / trendN;
            }
            double ci = c[i];
            if (ci > hh && (trendN == 0 || ci > ma))
                return new CoreSignal(1, ci - atrMult * a, ci + tpR * atrMult * a);
            if (ci < ll && (trendN == 0 || ci < ma))
                return new CoreSignal(-1, ci + atrMult * a, ci - tpR * atrMult * a);
            return null;
        }

        /// ATR(14) de velas de 1 hora armadas con velas más chicas, usando solo horas ya cerradas antes de 'beforeUtc'.
        public static double HourlyAtr(DateTime[] t, double[] h, double[] l, double[] c, int lastIdx, DateTime beforeUtc, int n = 14)
        {
            // recorre hacia atrás agrupando por hora completa
            var hh = new double[n + 1];
            var hl = new double[n + 1];
            var hc = new double[n + 1];
            int got = 0;
            int k = lastIdx;
            var limit = new DateTime(beforeUtc.Year, beforeUtc.Month, beforeUtc.Day, beforeUtc.Hour, 0, 0, DateTimeKind.Utc);
            while (k >= 0 && t[k] >= limit) k--;
            while (k >= 0 && got < n + 1)
            {
                var hour = new DateTime(t[k].Year, t[k].Month, t[k].Day, t[k].Hour, 0, 0, DateTimeKind.Utc);
                double hi = double.MinValue, lo = double.MaxValue, cl = c[k];
                while (k >= 0 && t[k] >= hour) { hi = Math.Max(hi, h[k]); lo = Math.Min(lo, l[k]); k--; }
                int j = n - got;          // llenamos del final hacia el principio
                hh[j] = hi; hl[j] = lo; hc[j] = cl;
                got++;
            }
            if (got < n + 1) return double.NaN;
            return Atr(hh, hl, hc, n, n);
        }
    }
}
