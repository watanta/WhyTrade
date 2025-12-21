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
} from '@mui/icons-material';
import { fetchTrades, addTrade, editTrade, removeTrade } from '../features/trades/tradeSlice';
import { RootState, AppDispatch } from '../features/store';
import TradeDialog from '../components/TradeDialog';
import { Trade, TradeCreate, TradeUpdate } from '../services/tradeService';

const TradesPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { trades, isLoading, error } = useSelector((state: RootState) => state.trades);
    const [dialogOpen, setDialogOpen] = useState(false);
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

    const handleDeleteClick = (id: string) => {
        if (window.confirm('この取引を削除してもよろしいですか？')) {
            dispatch(removeTrade(id));
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
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
                            <TableCell>約定日時</TableCell>
                            <TableCell align="center">アクション</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
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
                                    <TableCell align="right">{Math.round(trade.quantity).toLocaleString()}</TableCell>
                                    <TableCell align="right">{Math.round(trade.price).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(trade.executed_at).toLocaleString()}</TableCell>
                                    <TableCell align="center">
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
        </Box>
    );
};

export default TradesPage;
