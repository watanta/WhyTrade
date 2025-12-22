import yfinance as yf
from datetime import datetime
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class StockService:
    @staticmethod
    def get_stock_price(ticker_symbol: str) -> Dict[str, Any]:
        """
        Get current stock price for a Japanese stock (TSE).
        If market is open, returns current price.
        If market is closed, returns latest closing price.
        """
        try:
            # Add .T suffix for Japanese stocks if not present
            formatted_symbol = ticker_symbol.upper()
            if not formatted_symbol.endswith('.T'):
                formatted_symbol = f"{formatted_symbol}.T"

            stock = yf.Ticker(formatted_symbol)
            
            # Get fast info (more reliable for real-time/current data)
            # info = stock.info # This is sometimes slow, fast_info is better
            fast_info = stock.fast_info

            # Check if we can get a price
            current_price = None
            price_source = ""
            
            # Try to get the last price
            if fast_info.last_price is not None:
                current_price = fast_info.last_price
                price_source = "last_price"
            
            # If last_price is not available or 0, fallback to history
            if not current_price:
                # Get 1 day history
                hist = stock.history(period="1d")
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    price_source = "history_close"
                else:
                    # Get 5 day history if today's data is missing (e.g. holiday morning)
                    hist = stock.history(period="5d")
                    if not hist.empty:
                        current_price = hist['Close'].iloc[-1]
                        price_source = "history_5d_close"

            if current_price is None:
                raise ValueError(f"Could not fetch price for {ticker_symbol}")

            return {
                "ticker_symbol": ticker_symbol,
                "price": round(current_price, 2), # Japanese stocks usually 0 decimal but some have 0.1
                "currency": fast_info.currency,
                "timestamp": datetime.now().isoformat(),
                "source": price_source
            }

        except Exception as e:
            logger.error(f"Error fetching stock price for {ticker_symbol}: {str(e)}")
            raise e
