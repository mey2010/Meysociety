// GoldShield: cBot de XAUUSD para cTrader. Ejecuta UN setup (elegido por configuración)
// y deja que Shield apruebe o bloquee cada orden. Todas las horas en UTC.
//
// Configuración: parámetro "Setup" con una línea, p. ej.  asia_sweep_london;tf=5;tp_mode=mid;buf=0.2
// Guardá cada setup como un archivo .cbotset desde cTrader (clic derecho en la instancia > Save parameters)
// y cambiá de setup cargando otro archivo: no hace falta tocar código.
using System;
using System.Linq;
using cAlgo.API;
using cAlgo.API.Internals;

namespace GoldShield
{
    [Robot(TimeZone = TimeZones.UTC, AccessRights = AccessRights.None)]
    public class GoldShieldBot : Robot
    {
        [Parameter("Setup", DefaultValue = "donchian_trend;tf=240;n=20;tp_r=4;trend_n=0;hold_h=120")]
        public string SetupLine { get; set; }

        [Parameter("Balance inicial de la cuenta", DefaultValue = 5000, MinValue = 100)]
        public double InitialBalance { get; set; }

        [Parameter("Riesgo por trade %", DefaultValue = 0.5, MinValue = 0.05, MaxValue = 1.5)]
        public double RiskPct { get; set; }

        [Parameter("Corte del día %", DefaultValue = 2.0, MinValue = 0.5, MaxValue = 3.0)]
        public double DayStopPct { get; set; }

        [Parameter("Pausa total % bajo balance inicial", DefaultValue = 4.0, MinValue = 1, MaxValue = 6)]
        public double TotalPausePct { get; set; }

        [Parameter("Pérdidas seguidas que cortan el día", DefaultValue = 3, MinValue = 1, MaxValue = 10)]
        public int MaxLosses { get; set; }

        [Parameter("Máx. trades por día", DefaultValue = 6, MinValue = 1, MaxValue = 20)]
        public int MaxTrades { get; set; }

        [Parameter("Spread máximo (USD)", DefaultValue = 0.8, MinValue = 0.05)]
        public double MaxSpread { get; set; }

        [Parameter("Solo registrar (no opera)", DefaultValue = false)]
        public bool DryRun { get; set; }

        // Seguro de "go live": solo opera en ESTA cuenta. En cualquier otra (incluido el examen) solo registra.
        [Parameter("Número de cuenta autorizada", DefaultValue = "")]
        public string AuthorizedAccount { get; set; }

        const string Label = "GoldShield";
        Shield _shield;
        ISetup _setup;
        Bars _bars;
        DateTime _lastTick;
        string _stateKey;

        protected override void OnStart()
        {
            _setup = SetupFactory.Create(SetupLine);
            if (AuthorizedAccount.Trim() != Account.Number.ToString())
            {
                DryRun = true;
                Print($"Cuenta {Account.Number} no autorizada (autorizada: '{AuthorizedAccount}'): modo solo registro.");
            }
            var cfg = new ShieldConfig
            {
                InitialBalance = InitialBalance, RiskPerTradePct = RiskPct, DayStopPct = DayStopPct,
                TotalPausePct = TotalPausePct, MaxConsecutiveLosses = MaxLosses, MaxTradesPerDay = MaxTrades,
                MaxSpread = MaxSpread, EntryStartHourUtc = _setup.EntryStartHourUtc, EntryEndHourUtc = _setup.EntryEndHourUtc,
            };
            _stateKey = $"GoldShield.{Account.Number}.{SymbolName}";
            // el estado sobrevive a reinicios: tras una caída el bot retoma contadores y pausas
            _shield = new Shield(cfg, ShieldState.Parse(LocalStorage.GetString(_stateKey, LocalStorageScope.Device)));
            _bars = MarketData.GetBars(_setup.TimeFrame);
            _bars.BarClosed += OnSetupBarClosed;
            Positions.Closed += OnPositionClosed;
            _lastTick = Server.Time;
            Timer.Start(1);
            Log("INICIO", $"setup={_setup.Name} tf={_setup.TimeFrame} riesgo={RiskPct}% dryrun={DryRun} " +
                          $"estado={_shield.State.Serialize()}");
            if (Symbol.Name.ToUpperInvariant().Replace("/", "") != "XAUUSD")
                Log("AVISO", $"símbolo {SymbolName}: el bot fue testeado solo en XAUUSD");
        }

        protected override void OnTick()
        {
            _lastTick = Server.Time;
            Guard(false);
        }

        protected override void OnTimer()
        {
            Guard(true);
            // tiempo máximo de cada posición y vencimiento de órdenes pendientes
            foreach (var p in Positions.FindAll(Label, SymbolName))
                if (_setup.MaxHoldMinutes > 0 && (Server.Time - p.EntryTime).TotalMinutes >= _setup.MaxHoldMinutes)
                    Close(p, "tiempo máximo");
        }

        void Guard(bool fromTimer)
        {
            try
            {
                bool exposed = MyPositions().Any() || MyOrders().Any();
                bool feedMatters = fromTimer && (exposed || InEntryWindow());
                var d = _shield.Check(Server.Time, Account.Equity, _lastTick, feedMatters);
                if (!d.Ok && exposed) FlattenAll(d.Reason);
                Persist();
            }
            catch (Exception e) { Log("ERROR", "Guard: " + e.Message); }
        }

        bool InEntryWindow()
        {
            var t = Server.Time;
            return t.DayOfWeek != DayOfWeek.Saturday && t.DayOfWeek != DayOfWeek.Sunday &&
                   t.Hour >= _setup.EntryStartHourUtc && t.Hour < _setup.EntryEndHourUtc;
        }

        void OnSetupBarClosed(BarClosedEventArgs args)
        {
            try
            {
                _shield.RollDay(Server.Time, Account.Balance);
                var sig = _setup.Evaluate(_bars, Server.Time);
                if (sig == null) return;
                double entry = sig.Kind == OrderKind.Market ? (sig.Side == TradeType.Buy ? Symbol.Ask : Symbol.Bid) : sig.Price;
                double dist = Math.Abs(entry - sig.StopLoss);
                if (dist <= Symbol.TickSize) { Log("DESCARTE", $"{sig.Reason}: stop demasiado cerca"); return; }
                // tamaño: el stop cuesta como máximo el riesgo permitido (en la moneda de la cuenta)
                double moneyPerUnit = dist / Symbol.TickSize * Symbol.TickValue;
                double units = Symbol.NormalizeVolumeInUnits(_shield.MaxRiskMoney / moneyPerUnit, RoundingMode.Down);
                if (units < Symbol.VolumeInUnitsMin)
                {
                    Log("DESCARTE", $"{sig.Reason}: el volumen mínimo arriesgaría más del tope");
                    return;
                }
                double risk = units * moneyPerUnit;
                double spread = Symbol.Ask - Symbol.Bid;
                var d = _shield.CanOpen(Server.Time, Account.Balance, Account.Equity, risk, spread,
                                        MyPositions().Any() || MyOrders().Any(), true);
                Log(d.Ok ? "APROBADO" : "BLOQUEADO",
                    $"{sig.Side} {sig.Kind} entrada={entry:F2} sl={sig.StopLoss:F2} tp={sig.TakeProfit:F2} " +
                    $"unidades={units} riesgo={risk:F2} | motivo setup: {sig.Reason} | Shield: {d.Reason}");
                if (!d.Ok || DryRun) return;
                Place(sig, units);
            }
            catch (Exception e) { Log("ERROR", "señal: " + e.Message); }
        }

        void Place(Signal sig, double units)
        {
            TradeResult r;
            string comment = Trunc(sig.Reason, 100);
            if (sig.Kind == OrderKind.Market)
            {
                double px = sig.Side == TradeType.Buy ? Symbol.Ask : Symbol.Bid;
                double slPips = Math.Abs(px - sig.StopLoss) / Symbol.PipSize;
                double tpPips = Math.Abs(sig.TakeProfit - px) / Symbol.PipSize;
                r = ExecuteMarketOrder(sig.Side, SymbolName, units, Label, slPips, tpPips, comment);
            }
            else
            {
                var exp = Server.Time.AddMinutes(Math.Max(1, sig.ExpiryMinutes));
                r = sig.Kind == OrderKind.Stop
                    ? PlaceStopOrder(sig.Side, SymbolName, units, sig.Price, Label, sig.StopLoss, sig.TakeProfit, ProtectionType.Absolute, exp, comment)
                    : PlaceLimitOrder(sig.Side, SymbolName, units, sig.Price, Label, sig.StopLoss, sig.TakeProfit, ProtectionType.Absolute, exp, comment);
            }
            if (!r.IsSuccessful) { Log("ERROR", $"orden rechazada: {r.Error}"); return; }
            _shield.OnOpened();
            // verificación: una posición nunca puede quedar sin stop
            if (r.Position != null && r.Position.StopLoss == null)
            {
                Log("ERROR", "la posición quedó sin stop: se cierra");
                Close(r.Position, "sin stop");
            }
            Persist();
        }

        void OnPositionClosed(PositionClosedEventArgs a)
        {
            var p = a.Position;
            if (p.Label != Label || p.SymbolName != SymbolName) return;
            _shield.OnClosed(Server.Time, p.NetProfit, Account.Balance, Account.Equity);
            Log("CIERRE", $"{p.TradeType} {p.VolumeInUnits} entrada={p.EntryPrice:F2} neto={p.NetProfit:F2} " +
                          $"motivo={a.Reason} racha_perdidas={_shield.State.ConsecutiveLosses} " +
                          $"dia_cortado={_shield.State.HaltedToday} pausa_total={_shield.State.HaltedTotal}");
            Persist();
        }

        void FlattenAll(string why)
        {
            foreach (var o in MyOrders().ToList()) CancelPendingOrder(o);
            foreach (var p in MyPositions().ToList()) Close(p, why);
            Log("SHIELD", "cerrado todo: " + why);
            if (_shield.State.HaltedTotal)
            {
                Log("SHIELD", "pausa total: el bot se detiene hasta que un humano lo reactive");
                Persist();
                Stop();
            }
        }

        void Close(Position p, string why)
        {
            var r = ClosePosition(p);
            Log(r.IsSuccessful ? "CIERRE_FORZADO" : "ERROR", $"{why} (posición {p.Id})");
        }

        System.Collections.Generic.IEnumerable<Position> MyPositions() => Positions.FindAll(Label, SymbolName);
        System.Collections.Generic.IEnumerable<PendingOrder> MyOrders() =>
            PendingOrders.Where(o => o.Label == Label && o.SymbolName == SymbolName);

        void Persist()
        {
            try { LocalStorage.SetString(_stateKey, _shield.State.Serialize(), LocalStorageScope.Device); }
            catch (Exception e) { Print("no se pudo guardar el estado: " + e.Message); }
        }

        void Log(string kind, string msg) => Print($"{Server.Time:yyyy-MM-dd HH:mm:ss}Z [{kind}] {msg}");
        static string Trunc(string s, int n) => s.Length <= n ? s : s.Substring(0, n);

        protected override void OnError(Error error) => Log("ERROR", $"trading: {error.Code}");

        protected override void OnStop()
        {
            Persist();
            Log("FIN", "bot detenido. Estado: " + _shield?.State.Serialize());
        }
    }
}
