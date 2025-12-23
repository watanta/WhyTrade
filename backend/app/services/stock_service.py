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

    @staticmethod
    def get_analysis_data(ticker_symbol: str) -> Dict[str, Any]:
        """
        Fetch data for trade analysis:
        Returns a structured checklist for Market, Technical, and Fundamental sections.
        """
        import pandas as pd
        import numpy as np

        try:
            # Add .T suffix for Japanese stocks if not present and it looks like a number
            formatted_symbol = ticker_symbol.upper()
            if formatted_symbol.isdigit() or (len(formatted_symbol) == 4 and formatted_symbol.isdigit()):
                 if not formatted_symbol.endswith('.T'):
                    formatted_symbol = f"{formatted_symbol}.T"
            
            stock = yf.Ticker(formatted_symbol)
            
            checklist = {
                "market": [],
                "technical": [],
                "fundamental": []
            }

            # --- 1. Market Environment ---
            indices = {
                "^N225": "日経平均",
                "^DJI": "NYダウ",
                "USDJPY=X": "ドル円",
                "^VIX": "VIX指数"
            }
            
            for symbol, name in indices.items():
                try:
                    idx = yf.Ticker(symbol)
                    hist = idx.history(period="5d") # Fetch 5 days to confirm trend
                    if len(hist) >= 1:
                        current = float(hist['Close'].iloc[-1])
                        change_str = ""
                        trend_text = ""
                        
                        if len(hist) >= 2:
                            prev = float(hist['Close'].iloc[-2])
                            change = current - prev
                            change_pct = (change / prev) * 100
                            sign = "+" if change >= 0 else ""
                            change_str = f"({sign}{change_pct:.2f}%)"
                            
                            # Trend judgment & Strategy
                            if abs(change_pct) > 0.5:
                                trend = "上昇" if change > 0 else "下落"
                                trend_text = f"{name}は前日比{change_pct:.2f}%の{trend}。"
                                
                                # Strategic Advice
                                if symbol == "^VIX":
                                    if change > 0:
                                        strategy = "恐怖指数上昇。市場の急変・下落リスクに警戒。"
                                    else:
                                        strategy = "恐怖指数低下。市場心理は落ち着きつつある。"
                                else:
                                    if change > 0:
                                        strategy = "地合い良し。順張り（買い）が検討しやすい環境。"
                                    else:
                                        strategy = "地合い軟調。買いは慎重に、押し目か空売りを検討。"
                            else:
                                trend_text = f"{name}は前日比{change_pct:.2f}%で横ばい（レンジ）。"
                                strategy = "方向感なし。指数より個別銘柄の強弱選別が重要。"
                        
                        label_text = f"{name}: {current:.2f} {change_str}"
                         # Only add to checklist if there's a significant move or it's a key index
                        checklist["market"].append({
                            "label": label_text,
                            "value": float(current),
                            "text": f"{trend_text}\n💡{strategy}",
                            "is_met": False
                        })

                except Exception as e:
                    logger.warning(f"Failed to fetch index {symbol}: {e}")

            # --- 2. Technical Analysis ---
            try:
                # Fetch daily data for 1 year
                hist = stock.history(period="1y")
                
                # Fetch weekly data for 2 years (approx 104 weeks) to calculate 13w SMA
                hist_weekly = stock.history(period="2y", interval="1wk")
                
                if not hist.empty and len(hist) > 75:
                    current_price = float(hist['Close'].iloc[-1])
                    current_vol = float(hist['Volume'].iloc[-1])
                    
                    # Daily SMAs
                    sma25 = float(hist['Close'].rolling(window=25).mean().iloc[-1])
                    sma75 = float(hist['Close'].rolling(window=75).mean().iloc[-1])
                    
                    # Volume Avg (5 days)
                    vol_avg_5 = float(hist['Volume'].rolling(window=5).mean().iloc[-1])
                    vol_ratio = current_vol / vol_avg_5 if vol_avg_5 > 0 else 1.0

                    # RSI
                    delta = hist['Close'].diff()
                    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
                    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
                    rs = gain / loss
                    rsi = 100 - (100 / (1 + rs)).iloc[-1]
                    rsi = float(rsi)
                    
                    # Weekly SMA (13 weeks ~ 3 months)
                    sma13w = 0.0
                    weekly_trend_text = "週足データ不足"
                    if not hist_weekly.empty and len(hist_weekly) > 13:
                        sma13w = float(hist_weekly['Close'].rolling(window=13).mean().iloc[-1])
                        current_weekly = float(hist_weekly['Close'].iloc[-1])
                        if current_weekly > sma13w:
                           weekly_trend_text = f"週足は上昇トレンド (価格 {current_weekly:.0f} > 13週線 {sma13w:.0f})"
                        else:
                           weekly_trend_text = f"週足は下降/調整局面 (価格 {current_weekly:.0f} < 13週線 {sma13w:.0f})"

                    # [ ] トレンド定義 (Daily Trend)
                    trend_status = "上昇" if current_price > sma25 else "下降"
                    trend_advice = "押し目買いを検討（順張り）。" if current_price > sma25 else "戻り売りを検討（または静観）。"
                    
                    checklist["technical"].append({
                        "label": f"日足トレンド: {trend_status} (価格 vs 25日線)",
                        "value": "Up" if current_price > sma25 else "Down",
                        "text": f"日足は{trend_status}トレンド (現在値 {current_price:.0f} vs 25日線 {sma25:.0f})。\n💡{trend_advice}",
                        "is_met": False
                    })

                    # [ ] 上位足 (Weekly Trend)
                    weekly_advice = "長期トレンドもフォロー。" if "上昇" in weekly_trend_text else "長期は調整局面。短期リバウンド狙いか慎重に。"
                    checklist["technical"].append({
                        "label": f"週足トレンド (vs 13週線)",
                        "value": "Up" if not hist_weekly.empty and current_weekly > sma13w else "Down",
                        "text": f"{weekly_trend_text}\n💡{weekly_advice}",
                        "is_met": False
                    })

                    # [ ] 出来高 (Volume)
                    vol_status = "増加" if vol_ratio > 1.0 else "減少"
                    vol_advice = "トレンドの信頼性が高い。" if vol_ratio > 1.0 else "騙しの可能性に注意。"
                    checklist["technical"].append({
                        "label": f"出来高: 前日比{vol_ratio:.1f}倍",
                        "value": vol_ratio,
                        "text": f"出来高は5日平均比で{vol_ratio:.1f}倍に{vol_status}。\n💡{vol_advice}",
                        "is_met": False
                    })

                    # [ ] インジケーター (RSI)
                    rsi_status = "中立"
                    rsi_advice = "過熱感なし。トレンドに従う。"
                    if rsi > 70: 
                        rsi_status = "買われすぎ"
                        rsi_advice = "短期的な過熱感あり。利益確定や調整に警戒。"
                    elif rsi < 30: 
                        rsi_status = "売られすぎ"
                        rsi_advice = "売られすぎ水準。自律反発の可能性あり。"
                    
                    checklist["technical"].append({
                        "label": f"RSI(14): {rsi:.1f} ({rsi_status})",
                        "value": rsi,
                        "text": f"RSI(14)は{rsi:.1f}で{rsi_status}水準。\n💡{rsi_advice}",
                        "is_met": False
                    })

            except Exception as e:
                logger.error(f"Technical analysis error: {e}")
                checklist["technical"].append({
                    "label": "テクニカル分析エラー",
                    "value": "Error",
                    "text": f"データ取得エラー: {str(e)}",
                    "is_met": False
                })

            # --- 3. Fundamental Analysis ---
            try:
                info = stock.info
                
                # [ ] 決算 (Growth)
                rev_growth = info.get('revenueGrowth')
                earnings_growth = info.get('earningsGrowth')
                
                if rev_growth is not None or earnings_growth is not None:
                    rev_text = f"売上成長率: {rev_growth*100:.1f}%" if rev_growth else ""
                    earn_text = f"利益成長率: {earnings_growth*100:.1f}%" if earnings_growth else ""
                    full_text = ", ".join(filter(None, [rev_text, earn_text]))
                    
                    # Simple growth advice
                    growth_advice = "成長性あり。高PERでも許容される可能性。" if (rev_growth and rev_growth > 0.1) or (earnings_growth and earnings_growth > 0.1) else "成長性は限定的。バリュエーションを重視。"

                    checklist["fundamental"].append({
                        "label": f"成長性: {full_text}",
                        "value": float(rev_growth) if rev_growth else 0.0,
                        "text": f"直近の成長性は {full_text}。\n💡{growth_advice}",
                        "is_met": False
                    })

                # [ ] 決算日 (Earnings Date)
                # Try stock.calendar first as it often has future dates that info lacks
                earnings_date = None
                try:
                    cal = stock.calendar
                    if cal and 'Earnings Date' in cal and cal['Earnings Date']:
                        earnings_date = cal['Earnings Date'][0]
                except:
                    pass
                
                if not earnings_date:
                    earnings_date = info.get('nextEarningsDate') or info.get('earningsTimestamp')

                if earnings_date:
                    if isinstance(earnings_date, (int, float)):
                        dt = datetime.fromtimestamp(earnings_date)
                    else:
                        dt = pd.to_datetime(earnings_date)
                    
                    days_to_earnings = (dt.date() - datetime.now().date()).days
                    date_str = dt.strftime('%Y/%m/%d')
                    
                    if days_to_earnings >= 0:
                        label_prefix = "次回決算日"
                        earn_advice = "決算発表が近いです。持ち越しリスクを考慮してください。" if days_to_earnings <= 14 else "直近に決算予定はありません。"
                    else:
                        label_prefix = "前回の決算日"
                        earn_advice = "決算発表直後です。内容と市場の反応を確認してください。"

                    checklist["fundamental"].append({
                        "label": f"{label_prefix}: {date_str} ({'あと' if days_to_earnings >= 0 else 'から'}{abs(days_to_earnings)}日)",
                        "value": float(days_to_earnings),
                        "text": f"{label_prefix}は {date_str} です。\n💡{earn_advice}",
                        "is_met": False
                    })

                # [ ] セクター (Sector)
                sector = info.get('sector')
                industry = info.get('industry')
                if sector:
                    checklist["fundamental"].append({
                        "label": f"セクター: {sector} ({industry})",
                        "value": 0.0,
                        "text": f"業種は {sector} - {industry} です。セクター全体の流れ（騰落）も確認しましょう。\n💡同業他社の決算やニュースも材料になります。",
                        "is_met": False
                    })

                # [ ] バリュエーション (Valuation)
                forward_pe = info.get('forwardPE') or info.get('trailingPE')
                pb_ratio = info.get('priceToBook')
                
                val_text_parts = []
                if forward_pe: val_text_parts.append(f"PER {forward_pe:.1f}倍")
                if pb_ratio: val_text_parts.append(f"PBR {pb_ratio:.2f}倍")
                
                if val_text_parts:
                    val_label = ", ".join(val_text_parts)
                    val_advice = "割安水準。下値不安は少ない。" if (forward_pe and forward_pe < 15) or (pb_ratio and pb_ratio < 1.0) else "割高または標準的。成長性や材料が必要。"
                    
                    checklist["fundamental"].append({
                        "label": f"割安性: {val_label}",
                        "value": float(forward_pe) if forward_pe else 0.0,
                        "text": f"バリュエーションは {val_label}。\n💡{val_advice}",
                        "is_met": False
                    })

                # [ ] カタリスト/ニュース (Catalyst)
                news = stock.news
                if news:
                    latest = news[0]
                    title = latest.get('title') or "ニュース項目あり"
                    checklist["fundamental"].append({
                        "label": f"最新ニュース: {title[:30]}...",
                        "value": 0.0,
                        "text": f"最新のヘッドライン: {title}\n💡これが株価を動かす材料（カタリスト）になるか検討してください。",
                        "is_met": False # User to review
                    })

                # [ ] 配当 (Dividend)
                div_yield = info.get('dividendYield')
                if div_yield is not None:
                    val = float(div_yield)
                    if val < 0.5: val = val * 100
                    
                    div_advice = "高配当。インカムゲイン狙いや下支え要因に。" if val >= 3.0 else "配当は限定的。キャピタルゲイン狙い。"
                    
                    checklist["fundamental"].append({
                        "label": f"配当利回り: {val:.2f}%",
                        "value": val,
                        "text": f"配当利回りは{val:.2f}%。\n💡{div_advice}",
                        "is_met": False
                    })
                
                # [ ] 時価総額 (Market Cap)
                market_cap = info.get('marketCap')
                if market_cap:
                    trillion = 1_000_000_000_000
                    billion = 1_000_000_000
                    if market_cap >= trillion:
                        cap_str = f"{market_cap/trillion:.1f}兆円"
                        cap_advice = "大型株。流動性が高く値動きは安定的。"
                    elif market_cap >= billion:
                        cap_str = f"{market_cap/billion:.1f}億円"
                        cap_advice = "中小型株。値動きが軽くボラティリティに注意。"
                    else:
                        cap_str = f"{market_cap}円"
                        cap_advice = "超小型株。板が薄い可能性。"
                    
                    checklist["fundamental"].append({
                        "label": f"時価総額: {cap_str}",
                        "value": float(market_cap),
                        "text": f"時価総額は{cap_str}。\n💡{cap_advice}",
                        "is_met": False
                    })

            except Exception as e:
                logger.error(f"Fundamental analysis error: {e}")
                checklist["fundamental"].append({
                    "label": "ファンダメンタル分析エラー",
                    "value": "Error",
                    "text": f"データ取得エラー: {str(e)}",
                    "is_met": False
                })

            return {
                "checklist": checklist
            }

        except Exception as e:
            logger.error(f"Error fetching analysis data for {ticker_symbol}: {str(e)}")
            raise e
