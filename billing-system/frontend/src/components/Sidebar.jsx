import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, PackageSearch } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: 'Point of Sale', path: '/', icon: ShoppingCart },
        { name: 'Products', path: '/products', icon: PackageSearch },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-primary-500">Agros</span> Billing
                </h1>
                <p className="text-slate-400 text-sm mt-1">Fertilizer Shop POS</p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                Powered by Agros
            </div>
        </div>
    );
}
