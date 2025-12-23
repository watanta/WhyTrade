from fastapi import APIRouter, HTTPException, Depends, status
from typing import Any
from app.services.stock_service import StockService

router = APIRouter()

@router.get("/price/{ticker_symbol}")
async def get_stock_price(
    ticker_symbol: str,
) -> Any:
    """
    Get current stock price for a given ticker symbol.
    """
    try:
        # Basic validation for ticker symbol
        if not ticker_symbol or len(ticker_symbol) > 10:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ticker symbol format"
            )
            
        result = StockService.get_stock_price(ticker_symbol)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stock price: {str(e)}"
        )

@router.get("/analysis/{ticker_symbol}")
async def get_stock_analysis(
    ticker_symbol: str,
) -> Any:
    """
    Get analysis data (market env, technicals, fundamentals) for a given ticker symbol.
    """
    try:
        # Basic validation for ticker symbol
        if not ticker_symbol or len(ticker_symbol) > 10:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ticker symbol format"
            )
            
        result = StockService.get_analysis_data(ticker_symbol)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analysis data: {str(e)}"
        )
