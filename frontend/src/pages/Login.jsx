import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShoppingBag, ArrowRight, Lock, User, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login, quickLogin } = useAuth();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/pos');
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (role) => {
        setError('');
        setLoading(true);
        try {
            await quickLogin(role);
            navigate('/pos');
        } catch (err) {
            setError(err.message || 'Quick login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#EBF1F7] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Playful Gen-Z background ambient spheres */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg z-10">
                {/* Header Brand */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3 shadow-inner">
                        <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                        Smart Agriculture & Crop Nutrition
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center gap-3">
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 bg-clip-text text-transparent">Agros</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Smart Fertilizer & Retail Inventory Checkout
                    </p>
                </div>

                {/* Main Clay Card */}
                <div className="clay-card p-6 md:p-8">
                    {/* Free DB Notification Pill */}
                    <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            ✨
                        </div>
                        <div className="text-xs text-slate-700">
                            <span className="font-bold text-emerald-900 block text-sm">Free Temporary Database Active</span>
                            Zero configuration required. Pre-seeded with catalog, demo sales & accounts.
                        </div>
                    </div>

                    {/* Quick 1-Click Demo Logins */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Quick 1-Click Demo Login
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('admin')}
                                disabled={loading}
                                className="clay-btn-secondary p-3 text-left flex items-center justify-between group hover:border-emerald-300"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                        ⚡
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-800">Admin</span>
                                        <span className="text-[10px] text-slate-400">Full Access</span>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickLogin('cashier')}
                                disabled={loading}
                                className="clay-btn-secondary p-3 text-left flex items-center justify-between group hover:border-violet-300"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                                        🛒
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-800">Cashier</span>
                                        <span className="text-[10px] text-slate-400">POS Terminal</span>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
                            </button>
                        </div>
                    </div>

                    <div className="relative flex py-2 items-center mb-6">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Or Custom Sign In</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Standard Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Enter username (e.g. admin)"
                                    className="clay-input w-full pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="clay-input w-full pl-10 pr-10 py-3 text-sm text-slate-800 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="clay-btn-primary w-full py-3.5 text-sm font-bold shadow-md mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In to Agros POS
                                    <ArrowRight size={16} />
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer credentials reminder */}
                <div className="text-center mt-6 text-xs text-slate-400">
                    Default Credentials: <span className="font-semibold text-slate-600">admin / password123</span> or <span className="font-semibold text-slate-600">cashier / cashier123</span>
                </div>
            </div>
        </div>
    );
}
