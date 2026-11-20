// Shield: aprueba o bloquea cada operación y ordena cerrar todo cuando algo se rompe.
// Lógica pura (sin dependencias de cTrader) para poder testearla línea por línea.
// Todos los porcentajes son del balance INICIAL de la cuenta (así cuenta FundedHive).
using System;
using System.Globalization;

namespace GoldShield
{
    public sealed class ShieldConfig
    {
        public double InitialBalance = 5000;
        public double RiskPerTradePct = 0.5;    // riesgo propio por trade
        public double DayStopPct = 2.0;         // corte propio del día (FundedHive Moderate: 3%)
        public int MaxConsecutiveLosses = 3;    // pérdidas seguidas que cortan el día
        public double TotalPausePct = 4.0;      // pausa total bajo el balance inicial (Moderate: 6%)
        public double FirmPerTradePct = 1.5;    // tope de la firma por trade (Moderate)
        public int MaxTradesPerDay = 6;         // freno anti-HFT
        public int StaleFeedSeconds = 60;       // sin ticks durante este tiempo = feed caído
        public double MaxSpread = 0.80;         // USD/oz: con spread mayor no se entra
        public int EntryStartHourUtc = 0;       // ventana de entradas [inicio, fin) en hora UTC
        public int EntryEndHourUtc = 24;
    }

    public sealed class ShieldState
    {
        public DateTime Day = DateTime.MinValue;   // día de trading (00:00 UTC, como FundedHive)
        public double DayStartBalance;
        public int ConsecutiveLosses;
        public int TradesToday;
        public bool HaltedToday;
        public bool HaltedTotal;                   // solo un humano lo reactiva
        public string HaltReason = "";

        public string Serialize() => string.Join("|", Day.ToString("o", CultureInfo.InvariantCulture),
            DayStartBalance.ToString("R", CultureInfo.InvariantCulture), ConsecutiveLosses, TradesToday,
            HaltedToday, HaltedTotal, HaltReason.Replace("|", "/"));

        public static ShieldState Parse(string s)
        {
            var st = new ShieldState();
            if (string.IsNullOrEmpty(s)) return st;
            var p = s.Split('|');
            if (p.Length < 7) return st;
            st.Day = DateTime.Parse(p[0], CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
            st.DayStartBalance = double.Parse(p[1], CultureInfo.InvariantCulture);
            st.ConsecutiveLosses = int.Parse(p[2]);
            st.TradesToday = int.Parse(p[3]);
            st.HaltedToday = bool.Parse(p[4]);
            st.HaltedTotal = bool.Parse(p[5]);
            st.HaltReason = p[6];
            return st;
        }
    }

    public readonly struct Decision
    {
        public readonly bool Ok;
        public readonly string Reason;
        public Decision(bool ok, string reason) { Ok = ok; Reason = reason; }
        public static Decision Allow(string why) => new Decision(true, why);
        public static Decision Block(string why) => new Decision(false, why);
        public override string ToString() => (Ok ? "OK: " : "BLOQUEADO: ") + Reason;
    }

    public sealed class Shield
    {
        public readonly ShieldConfig Cfg;
        public ShieldState State;

        public Shield(ShieldConfig cfg, ShieldState state)
        {
            Cfg = cfg;
            State = state ?? new ShieldState();
        }

        double Pct(double money) => money / Cfg.InitialBalance * 100.0;
        public double MaxRiskMoney => Cfg.InitialBalance * Math.Min(Cfg.RiskPerTradePct, Cfg.FirmPerTradePct) / 100.0;

        /// Cambio de día a las 00:00 UTC: se reinician los contadores diarios, nunca la pausa total.
        public bool RollDay(DateTime nowUtc, double balance)
        {
            var d = nowUtc.Date;
            if (d == State.Day) return false;
            State.Day = d;
            State.DayStartBalance = balance;
            State.ConsecutiveLosses = 0;
            State.TradesToday = 0;
            State.HaltedToday = false;
            if (!State.HaltedTotal) State.HaltReason = "";
            return true;
        }

        /// ¿Se puede abrir esta operación? riskMoney = pérdida si toca el stop (con tamaño ya calculado).
        public Decision CanOpen(DateTime nowUtc, double balance, double equity, double riskMoney, double spread,
                                bool hasExposure, bool hasStopLoss)
        {
            RollDay(nowUtc, balance);
            if (State.HaltedTotal) return Decision.Block("pausa total activa: " + State.HaltReason);
            if (State.HaltedToday) return Decision.Block("día cortado: " + State.HaltReason);
            if (!hasStopLoss) return Decision.Block("orden sin stop loss");
            if (hasExposure) return Decision.Block("ya hay una posición u orden abierta");
            if (nowUtc.DayOfWeek == DayOfWeek.Saturday || (nowUtc.DayOfWeek == DayOfWeek.Sunday && nowUtc.Hour < 22))
                return Decision.Block("fin de semana");
            if (nowUtc.DayOfWeek == DayOfWeek.Friday && nowUtc.Hour >= 19)
                return Decision.Block("viernes tarde: no se abre nada antes del cierre semanal");
            if (nowUtc.Hour < Cfg.EntryStartHourUtc || nowUtc.Hour >= Cfg.EntryEndHourUtc)
                return Decision.Block("fuera de la ventana de entradas");
            if (State.TradesToday >= Cfg.MaxTradesPerDay)
                return Decision.Block($"límite de {Cfg.MaxTradesPerDay} trades por día (anti-HFT)");
            if (spread > Cfg.MaxSpread) return Decision.Block($"spread {spread:F2} > {Cfg.MaxSpread:F2}");
            if (riskMoney <= 0) return Decision.Block("riesgo inválido");
            if (riskMoney > MaxRiskMoney * 1.0001)
                return Decision.Block($"riesgo {Pct(riskMoney):F2}% > tope {Pct(MaxRiskMoney):F2}%");
            // si el stop se toca, ¿rompería el corte del día o la pausa total?
            double dayPnl = equity - State.DayStartBalance;
            if (Pct(dayPnl - riskMoney) < -Cfg.DayStopPct)
                return Decision.Block($"el stop llevaría el día a {Pct(dayPnl - riskMoney):F2}% (corte {-Cfg.DayStopPct}%)");
            if (Pct(equity - riskMoney - Cfg.InitialBalance) < -Cfg.TotalPausePct)
                return Decision.Block("el stop llevaría la cuenta por debajo de la pausa total");
            return Decision.Allow($"riesgo {Pct(riskMoney):F2}%, día {Pct(dayPnl):+0.00;-0.00}%, trade {State.TradesToday + 1}/{Cfg.MaxTradesPerDay}");
        }

        public void OnOpened() => State.TradesToday++;

        /// Al cerrar cada operación: racha de pérdidas y cortes.
        public void OnClosed(DateTime nowUtc, double netProfit, double balance, double equity)
        {
            State.ConsecutiveLosses = netProfit < 0 ? State.ConsecutiveLosses + 1 : 0;
            if (State.ConsecutiveLosses >= Cfg.MaxConsecutiveLosses)
                HaltDay($"{State.ConsecutiveLosses} pérdidas seguidas");
            Check(nowUtc, equity, nowUtc, true);
        }

        /// Revisión continua (cada tick y cada segundo). Devuelve Block si hay que cerrar todo YA.
        public Decision Check(DateTime nowUtc, double equity, DateTime lastTickUtc, bool feedMatters)
        {
            if (Pct(equity - Cfg.InitialBalance) <= -Cfg.TotalPausePct)
            {
                State.HaltedTotal = true;
                State.HaltReason = $"equity {Pct(equity - Cfg.InitialBalance):F2}% bajo el balance inicial";
                return Decision.Block("PAUSA TOTAL: " + State.HaltReason);
            }
            if (State.DayStartBalance > 0 && Pct(equity - State.DayStartBalance) <= -Cfg.DayStopPct)
            {
                HaltDay($"día en {Pct(equity - State.DayStartBalance):F2}%");
                return Decision.Block("CORTE DEL DÍA: " + State.HaltReason);
            }
            if (feedMatters && !InDailyBreak(nowUtc) && (nowUtc - lastTickUtc).TotalSeconds > Cfg.StaleFeedSeconds)
            {
                HaltDay($"feed sin ticks hace {(nowUtc - lastTickUtc).TotalSeconds:F0}s");
                return Decision.Block("FEED CAÍDO: " + State.HaltReason);
            }
            if (nowUtc.DayOfWeek == DayOfWeek.Friday && (nowUtc.Hour > 20 || (nowUtc.Hour == 20 && nowUtc.Minute >= 45)))
                return Decision.Block("cierre antes del fin de semana");
            return Decision.Allow("ok");
        }

        /// Pausa diaria del oro (aprox. 21:00-22:00 UTC en verano, 22:00-23:00 en invierno) y fin de semana:
        /// sin ticks ahí es normal, no es un feed caído.
        public static bool InDailyBreak(DateTime t)
        {
            if (t.DayOfWeek == DayOfWeek.Saturday || (t.DayOfWeek == DayOfWeek.Sunday && t.Hour < 23)) return true;
            if (t.DayOfWeek == DayOfWeek.Friday && t.Hour >= 21) return true;
            double h = t.Hour + t.Minute / 60.0;
            return h >= 20.9 && h < 23.25;
        }

        void HaltDay(string why)
        {
            State.HaltedToday = true;
            if (!State.HaltedTotal) State.HaltReason = why;
        }
    }
}
