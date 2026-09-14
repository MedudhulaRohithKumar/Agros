import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, PackageSearch, ReceiptText, LogOut, Sparkles, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Storefront Home', path: '/', icon: Store },
        { name: 'Point of Sale', path: '/pos', icon: ShoppingCart, badge: 'Live' },
        { name: 'Products & Stock', path: '/products', icon: PackageSearch },
        { name: 'Invoices & History', path: '/invoices', icon: ReceiptText },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="hidden md:flex w-72 h-screen p-5 flex-col shrink-0 select-none">
            <div className="clay-card h-full flex flex-col p-5 bg-white/90">
                {/* Brand Header */}
                <div className="mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-xl shadow-md">
                            🌾
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 leading-none flex items-center gap-1.5">
                                Agros <span className="text-emerald-600">Billing</span>
                            </h1>
                            <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                                Fertilizers & Crop Care
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 translate-x-1'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-0.5'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={19} className="shrink-0" />
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Profile Card & Logout */}
                <div className="pt-4 border-t border-slate-100 mt-auto space-y-3">
                    {user && (
                        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                {user.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{user.full_name || user.username}</p>
                                <span className="inline-block text-[10px] font-extrabold text-violet-600 bg-violet-100 px-2 py-0.2 rounded-full uppercase tracking-wider">
                                    {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Cashier'}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full clay-btn-secondary py-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
