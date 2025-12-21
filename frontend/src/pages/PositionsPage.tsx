import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Alert,
    Tooltip,
    Collapse,
} from '@mui/material';
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { fetchPositions, settleTrade } from '../features/trades/tradeSlice';
import { RootState, AppDispatch } from '../features/store';
import SettleTradeDialog from '../components/SettleTradeDialog';
import { Trade, Position, TradeClose } from '../services/tradeService';

const PositionRow = (props: { position: Position, onSettle: (trade: Trade) => void }) => {
    const { position, onSettle } = props;
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {position.ticker_symbol}
                </TableCell>
                <TableCell align="right">{Math.round(position.total_quantity).toLocaleString()}</TableCell>
                <TableCell align="right">{Math.round(position.average_price).toLocaleString()}</TableCell>
                <TableCell align="right">{Math.round(position.total_amount).toLocaleString()}</TableCell>
                <TableCell align="right">
                    {/* Position level action could be here, but for now we settle individual trades */}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                内訳（個別取引）
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>約定日時</TableCell>
                                        <TableCell>売買</TableCell>
                                        <TableCell align="right">数量</TableCell>
                                        <TableCell align="right">単価</TableCell>
                                        <TableCell align="center">アクション</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {position.trades.map((trade) => (
                                        <TableRow key={trade.id}>
                                            <TableCell>{new Date(trade.executed_at).toLocaleString()}</TableCell>
                                            <TableCell>{trade.trade_type === 'BUY' ? '買い' : '売り'}</TableCell>
                                            <TableCell align="right">{Math.round(trade.quantity).toLocaleString()}</TableCell>
                                            <TableCell align="right">{Math.round(trade.price).toLocaleString()}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="この取引を決済する">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => onSettle(trade)}
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const PositionsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { positions, isLoading, error } = useSelector((state: RootState) => state.trades);
    const [settleDialogOpen, setSettleDialogOpen] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

    useEffect(() => {
        dispatch(fetchPositions());
    }, [dispatch]);

    const handleSettleClick = (trade: Trade) => {
        setSelectedTrade(trade);
        setSettleDialogOpen(true);
    };

    const handleSettleDialogClose = () => {
        setSettleDialogOpen(false);
        setSelectedTrade(null);
    };

    const handleSettleSubmit = async (data: TradeClose) => {
        if (selectedTrade) {
            await dispatch(settleTrade({ id: selectedTrade.id, data }));
            // Refresh positions after settlement
            dispatch(fetchPositions());
        }
        handleSettleDialogClose();
    };

    if (isLoading && positions.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                保有ポジション
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>銘柄</TableCell>
                            <TableCell align="right">合計数量</TableCell>
                            <TableCell align="right">平均取得単価</TableCell>
                            <TableCell align="right">合計金額</TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {positions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    現在保有しているポジションはありません。
                                </TableCell>
                            </TableRow>
                        ) : (
                            positions.map((position) => (
                                <PositionRow
                                    key={position.ticker_symbol}
                                    position={position}
                                    onSettle={handleSettleClick}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <SettleTradeDialog
                open={settleDialogOpen}
                onClose={handleSettleDialogClose}
                onSubmit={handleSettleSubmit}
                trade={selectedTrade}
            />
        </Box>
    );
};

export default PositionsPage;
