# QUANT/OS — Strategy Backtester & Paper Trading Desk

A single-file, self-contained quant trading desk. No build step, no dependencies,
no API keys required to run: open `index.html` in any modern browser or serve it:

```sh
cd trading-os && python3 -m http.server 8080
# → http://localhost:8080
```

## What it is

A tool to help you find out whether a trading strategy actually works *before*
you connect it to real money — not a system that trades for you.

| Tab | Purpose |
|---|---|
| **Dashboard** | Live snapshot of the paper account: equity curve, position, recent trades. |
| **Backtest** | Run a strategy against synthetic (seeded random-walk) or your own CSV OHLCV data. Reports return, CAGR, Sharpe, max drawdown, win rate, profit factor vs. buy & hold. |
| **Optimizer** | Grid-search a strategy's parameters with a **train/test split** (walk-forward validation), so you rank results by out-of-sample performance instead of curve-fit in-sample numbers. |
| **Paper Trading** | Step a strategy forward bar-by-bar (or auto-play) against freshly generated data with a simulated cash account, stop-loss/take-profit, commission and slippage. Nothing here places a real order. |
| **Export / PineScript** | Generates the same strategy logic as Pine Script v5, ready to paste into TradingView's Pine Editor for charting and (if you choose) manual alert wiring. |
| **Risk & Rules** | Why backtests overstate performance, and a checklist to work through before ever risking real capital. |

## Strategies included

- SMA Crossover
- RSI Mean Reversion
- MACD Momentum
- Bollinger Band Breakout
- Confluence (majority vote across the above)

All are long/flat only (no shorting, no leverage) to keep the risk model simple
and easy to reason about.

## Architecture

Vanilla HTML/CSS/JS, single file, canvas-drawn charts (no chart libraries).
`generateSeries()` produces a seeded geometric-Brownian-motion price series with
simple stochastic-volatility clustering for realism; `parseCSV()` accepts your
own `date,open,high,low,close,volume` history if you'd rather test on real data.

The backtest engine (`runBacktest`) fills entries/exits at the strategy's
signal changes, checks stop-loss/take-profit intrabar against the high/low,
and applies commission % and slippage (bps) per fill — so the numbers already
account for trading costs, not just gross price moves.

The optimizer splits data into a training window (parameters are tuned here)
and a test window (parameters are only *evaluated*, never tuned, here), and
ranks by test-period Sharpe — the standard defense against overfitting a
backtest into worthlessness.

## What this does **not** do

- It does not connect to a broker, exchange, or TradingView.
- It does not place real orders or move real funds.
- It does not guarantee profitability. No backtest can. Read the **Risk & Rules**
  tab before you go anywhere near live capital.

## Going from here to a live (real-money) system

This app deliberately stops at "validate the idea." If you want to eventually
run it live, the pieces you'd add — on your own machine, with your own
credentials — are:

1. **Real historical data** instead of synthetic series (a market data API/CSV export).
2. **TradingView** to host the Pine Script version of the strategy on a live chart
   and fire alerts on signal changes.
3. **An execution bridge** (e.g. a webhook relay you control, or a broker's own
   webhook/algo API) that turns a TradingView alert JSON payload into an order.
4. **API keys scoped to trading only, with withdrawals disabled**, ideally on a
   dedicated sub-account funded only with capital you can afford to lose.
5. **Weeks of forward paper-testing** with that exact pipeline before it ever
   touches real capital, and a manual kill switch to flatten everything instantly.

None of step 2–4 should be automated by an AI agent unattended with real
brokerage credentials — that's a human-in-the-loop decision by design.
