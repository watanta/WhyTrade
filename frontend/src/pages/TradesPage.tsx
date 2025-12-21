import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { fetchTrades, addTrade, editTrade, removeTrade, settleTrade } from '../features/trades/tradeSlice';
import { RootState, AppDispatch } from '../features/store';
import TradeDialog from '../components/TradeDialog';
import SettleTradeDialog from '../components/SettleTradeDialog';
import { Trade, TradeCreate, TradeUpdate, TradeClose } from '../services/tradeService';

const TradesPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { trades, isLoading, error } = useSelector((state: RootState) => state.trades);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [settleDialogOpen, setSettleDialogOpen] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

    useEffect(() => {
        dispatch(fetchTrades());
    }, [dispatch]);

    const handleAddClick = () => {
        setSelectedTrade(null);
        setDialogOpen(true);
    };

    const handleEditClick = (trade: Trade) => {
        setSelectedTrade(trade);
        setDialogOpen(true);
    };

    const handleSettleClick = (trade: Trade) => {
        setSelectedTrade(trade);
        setSettleDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        if (window.confirm('この取引を削除してもよろしいですか？')) {
            dispatch(removeTrade(id));
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedTrade(null);
    };

    const handleSettleDialogClose = () => {
        setSettleDialogOpen(false);
        setSelectedTrade(null);
    };

    const handleDialogSubmit = (data: TradeCreate | TradeUpdate) => {
        if (selectedTrade) {
            dispatch(editTrade({ id: selectedTrade.id, data: data as TradeUpdate }));
        } else {
            dispatch(addTrade(data as TradeCreate));
        }
        handleDialogClose();
    };

    const handleSettleSubmit = (data: TradeClose) => {
        if (selectedTrade) {
            dispatch(settleTrade({ id: selectedTrade.id, data }));
        }
        handleSettleDialogClose();
    };

    if (isLoading && trades.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    取引一覧
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                >
                    新規取引登録
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>銘柄</TableCell>
                            <TableCell>売買</TableCell>
                            <TableCell align="right">数量</TableCell>
                            <TableCell align="right">単価</TableCell>
                            <TableCell align="right">損益</TableCell>
                            <TableCell>確信度/根拠</TableCell>
                            <TableCell>約定日時</TableCell>
                            <TableCell>状態</TableCell>
                            <TableCell align="center">アクション</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    取引がありません。「新規取引登録」から登録してください。
                                </TableCell>
                            </TableRow>
                        ) : (
                            trades.map((trade: Trade) => (
                                <TableRow key={trade.id}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{trade.ticker_symbol}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={trade.trade_type === 'BUY' ? '買い' : '売り'}
                                            color={trade.trade_type === 'BUY' ? 'primary' : 'secondary'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">{trade.quantity.toLocaleString()}</TableCell>
                                    <TableCell align="right">{trade.price.toLocaleString()}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        {trade.profit_loss != null ? (
                                            <Typography
                                                component="span"
                                                color={trade.profit_loss >= 0 ? 'success.main' : 'error.main'}
                                            >
                                                {trade.profit_loss >= 0 ? '+' : ''}
                                                {trade.profit_loss.toLocaleString()}
                                            </Typography>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', color: 'gold', mr: 1 }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Box
                                                        key={star}
                                                        component="span"
                                                        sx={{
                                                            fontSize: '0.8rem',
                                                            opacity: star <= (trade.confidence_level || 0) ? 1 : 0.2
                                                        }}
                                                    >
                                                        ★
                                                    </Box>
                                                ))}
                                            </Box>
                                            {(trade.rationale || trade.market_env) && (
                                                <Tooltip
                                                    title={
                                                        <Box sx={{ p: 1 }}>
                                                            {trade.market_env && <Typography variant="caption" display="block">市場: {trade.market_env}</Typography>}
                                                            {trade.rationale && <Typography variant="caption" display="block">根拠: {trade.rationale}</Typography>}
                                                        </Box>
                                                    }
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            textDecoration: 'underline',
                                                            cursor: 'help',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        詳細
                                                    </Typography>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{new Date(trade.executed_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={trade.status === 'OPEN' ? '保有中' : '決済済'}
                                            color={trade.status === 'OPEN' ? 'warning' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {trade.status === 'OPEN' && (
                                            <Tooltip title="決済する">
                                                <IconButton size="small" color="primary" onClick={() => handleSettleClick(trade)}>
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <IconButton size="small" onClick={() => handleEditClick(trade)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteClick(trade.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TradeDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onSubmit={handleDialogSubmit}
                initialData={selectedTrade}
            />

            <SettleTradeDialog
                open={settleDialogOpen}
                onClose={handleSettleDialogClose}
                onSubmit={handleSettleSubmit}
                trade={selectedTrade}
            />
        </Box>
    );
};

export default TradesPage;
