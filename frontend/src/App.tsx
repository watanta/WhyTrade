import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    CssBaseline,
    Box,
    Button,
} from '@mui/material';
import { RootState, AppDispatch } from './features/store';
import { logout } from './features/auth/authSlice';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import TradesPage from './pages/TradesPage';
import PositionsPage from './pages/PositionsPage';

function App() {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        WhyTrade
                    </Typography>
                    {isAuthenticated ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button color="inherit" component={Link} to="/positions" sx={{ mr: 2 }}>
                                保有ポジション
                            </Button>
                            <Button color="inherit" component={Link} to="/trades" sx={{ mr: 2 }}>
                                取引履歴
                            </Button>
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                {user?.full_name}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                ログアウト
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Button color="inherit" component={Link} to="/login">
                                ログイン
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4 }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/"
                            element={
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" component="h1" gutterBottom>
                                        Welcome to WhyTrade
                                    </Typography>
                                    <Typography variant="body1">
                                        トレードの「なぜ」を記録し、振り返る。
                                    </Typography>
                                </Box>
                            }
                        />
                        <Route path="/positions" element={<PositionsPage />} />
                        <Route path="/trades" element={<TradesPage />} />
                    </Route>
                </Routes>
            </Container>
        </>
    );
}

export default App;
