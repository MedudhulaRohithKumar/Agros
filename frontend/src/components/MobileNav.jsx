import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, PackageSearch, ReceiptText, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileNav() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Store', path: '/', icon: Store },
        { name: 'POS', path: '/pos', icon: ShoppingCart },
        { name: 'Stock', path: '/products', icon: PackageSearch },
        { name: 'Invoices', path: '/invoices', icon: ReceiptText },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1">
            <div className="clay-mobile-nav px-4 py-2.5 flex items-center justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-2xl font-bold text-[11px] transition-all duration-200 ${
                                    isActive
                                        ? 'text-emerald-700 bg-emerald-100 shadow-inner scale-105'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-2xl font-bold text-[11px] text-rose-500 hover:text-rose-700 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Exit</span>
                </button>
            </div>
        </div>
    );
}
