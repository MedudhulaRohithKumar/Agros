import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import POS from './pages/POS';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import Login from './pages/Login';

function ProtectedLayout({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F0F4F8] text-slate-500">
                <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Agros...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen w-screen bg-[#F0F4F8] font-sans text-slate-900 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative h-full">
                {children}
            </main>
            <MobileNav />
        </div>
    );
}

function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/pos" replace />;
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Main Storefront Showcase Page */}
                    <Route path="/" element={<Home />} />

                    {/* Staff Login */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* Protected POS & Inventory Routes */}
                    <Route
                        path="/pos"
                        element={
                            <ProtectedLayout>
                                <POS />
                            </ProtectedLayout>
                        }
                    />
                    <Route
                        path="/products"
                        element={
                            <ProtectedLayout>
                                <Products />
                            </ProtectedLayout>
                        }
                    />
                    <Route
                        path="/invoices"
                        element={
                            <ProtectedLayout>
                                <Invoices />
                            </ProtectedLayout>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
