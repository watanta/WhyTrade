import yfinance as yf

def check_dividend(symbol):
    print(f"Checking {symbol}...")
    ticker = yf.Ticker(symbol)
    info = ticker.info
    div_yield = info.get('dividendYield')
    print(f"Raw dividendYield: {div_yield}")
    if div_yield:
        print(f"Calculated %: {div_yield * 100}%")

check_dividend("7203.T") # Toyota
check_dividend("8306.T") # MUFG
