"""Tests del motor de backtest con velas armadas a mano (python3 -m pytest test_engine.py)."""
import numpy as np
import pandas as pd

from engine import LIMIT, MARKET, STOP, Market, run, size_and_cost


def mk(rows, start="2024-01-02 10:00", spread=0.2):
    """rows: lista de (o, h, l, c) en bid; ask = bid + spread."""
    ts = pd.date_range(start, periods=len(rows), freq="1min")
    b = np.array(rows, float)
    df = pd.DataFrame({"bo": b[:, 0], "bh": b[:, 1], "bl": b[:, 2], "bc": b[:, 3]}, index=ts)
    for x in "ohlc":
        df["a" + x] = df["b" + x] + spread
    df["vol"] = 1.0
    return Market(df)


def order(ts, side, typ, px, sl, tp, exp=10, hold=100):
    return pd.DataFrame([dict(ts_active=pd.Timestamp(ts), side=side, type=typ, px=px, sl=sl, tp=tp, exp=exp, hold=hold)])


def test_long_market_tp_hit_at_ask_entry_bid_exit():
    m = mk([(100, 100.5, 99.8, 100.2), (100.2, 102, 100.1, 101.9)])
    t = run(m, order("2024-01-02 10:00", 1, MARKET, 0, 99, 101.5), slip=0)
    assert t.entry[0] == 100.2  # ask open
    assert t.exit[0] == 101.5 and t.why[0] == 2


def test_stop_and_tp_same_bar_counts_stop():
    m = mk([(100, 100.1, 99.9, 100), (100, 103, 97, 100)])
    t = run(m, order("2024-01-02 10:00", 1, MARKET, 0, 99, 101), slip=0)
    assert t.why[0] == 1 and t.exit[0] == 99


def test_stop_entry_fills_at_worse_of_level_and_open_with_gap_exit():
    m = mk([(100, 100.2, 99.9, 100), (101, 101.5, 100.9, 101.2), (98, 98.5, 97, 97.5)])
    t = run(m, order("2024-01-02 10:00", 1, STOP, 100.5, 99.5, 105), slip=0)
    assert abs(t.entry[0] - 101.2) < 1e-9  # ask open 101.2 > nivel 100.5
    assert t.exit[0] == 98 and t.why[0] == 1  # gap bajo el stop: sale al open


def test_oco_takes_first_triggered_side():
    m = mk([(100, 100.1, 99.9, 100), (100, 100.1, 98.5, 98.7), (98.7, 102, 98.6, 101.8), (101, 101, 95, 95)])
    o = pd.concat([order("2024-01-02 10:00", 1, STOP, 101, 99, 103), order("2024-01-02 10:00", -1, STOP, 99, 101, 97)])
    t = run(m, o, slip=0)
    assert len(t) == 1 and t.side[0] == -1


def test_weekend_flat():
    rows = [(100, 100.1, 99.9, 100)] * 30
    m = mk(rows, start="2024-01-05 20:30")  # viernes
    t = run(m, order("2024-01-05 20:30", 1, MARKET, 0, 90, 110, hold=1000), slip=0)
    assert t.why[0] == 4 and pd.Timestamp(t.exit_ts[0]) == pd.Timestamp("2024-01-05 20:45")


def test_limit_and_sizing_risk():
    m = mk([(100, 100.1, 99.9, 100), (100, 100, 99, 99.5), (99.5, 102, 99.4, 101)], spread=0.0)
    t = run(m, order("2024-01-02 10:00", 1, LIMIT, 99.5, 98.5, 101), slip=0)
    assert t.entry[0] == 99.5 and t.exit[0] == 101
    s = size_and_cost(t, risk_frac=0.005, balance=5000, comm_per_m=0)
    assert abs(s.r[0] - 1.5) < 1e-9 and abs(s.pnl[0] - 37.5) < 1e-9


def test_order_while_busy_is_skipped():
    m = mk([(100, 100.1, 99.9, 100)] * 5)
    o = pd.concat([order("2024-01-02 10:00", 1, MARKET, 0, 90, 110), order("2024-01-02 10:02", -1, MARKET, 0, 110, 90)])
    assert len(run(m, o, slip=0)) == 1
