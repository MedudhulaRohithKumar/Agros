import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { printReceipt } from '../utils/printReceipt';
import { ReceiptText, Search, Printer, Eye, X, Calendar, User, CreditCard, Sparkles } from 'lucide-react';

export default function Invoices() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await api.orders.getAll(100);
            setOrders(data);
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = orders.filter(o =>
        o.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (o.customerMobile && o.customerMobile.includes(search))
    );

    const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);

    return (
        <div className="h-full p-4 md:p-8 flex flex-col overflow-hidden pb-24 md:pb-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                        <span>Billing & Invoices</span>
                        <span className="clay-badge bg-emerald-100 text-emerald-800 font-mono">
                            {orders.length} Invoices
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Track sales receipts, customer records, and transaction history
                    </p>
                </div>

                {/* Quick Revenue Summary Pill */}
                <div className="clay-card-flat px-4 py-2.5 flex items-center gap-3 bg-white self-start sm:self-auto">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        ₹
                    </div>
                    <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Total Sales</span>
                        <span className="text-base font-black text-slate-800 font-mono">₹{totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-5">
                <div className="clay-card-flat p-2 flex items-center gap-2 max-w-md bg-white">
                    <Search size={18} className="text-slate-400 ml-2" />
                    <input
                        type="text"
                        placeholder="Search invoice number, customer name, mobile..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-transparent px-2 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
                    />
                </div>
            </div>

            {/* Invoices List Container */}
            <div className="clay-card flex-1 flex flex-col p-4 md:p-6 overflow-hidden bg-white/95">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-y-auto flex-1 pr-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3 px-4">Invoice No</th>
                                <th className="pb-3 px-4">Date & Time</th>
                                <th className="pb-3 px-4">Customer</th>
                                <th className="pb-3 px-4">Payment</th>
                                <th className="pb-3 px-4">Items</th>
                                <th className="pb-3 px-4">Final Amount</th>
                                <th className="pb-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">Loading invoices...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">No invoices found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-4 font-black font-mono text-emerald-700">
                                            {order.invoiceNumber}
                                        </td>
                                        <td className="py-4 px-4 text-slate-500 text-[11px]">
                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-slate-800">{order.customerName}</div>
                                            {order.customerMobile && (
                                                <div className="text-[10px] text-slate-400 font-mono">{order.customerMobile}</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="clay-badge text-[10px] bg-slate-100 text-slate-700">
                                                {order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 font-medium">
                                            {order.items.length} items
                                        </td>
                                        <td className="py-4 px-4 font-black font-mono text-slate-900 text-sm">
                                            ₹{order.finalAmount.toFixed(2)}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="clay-btn-secondary px-3 py-1.5 text-xs text-emerald-700 hover:border-emerald-300"
                                            >
                                                <Eye size={14} />
                                                <span>Receipt</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="md:hidden overflow-y-auto flex-1 space-y-3 pr-1">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 text-xs">Loading invoices...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">No invoices found.</div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="clay-card-flat p-4 bg-white space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="font-mono font-black text-xs text-emerald-700 block">
                                            {order.invoiceNumber}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className="clay-badge text-[10px] bg-slate-100 text-slate-700">
                                        {order.paymentMethod}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <div>
                                        <p className="font-bold text-xs text-slate-800">{order.customerName}</p>
                                        <p className="text-[11px] text-slate-400">{order.items.length} products billed</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black font-mono text-slate-900 block">
                                            ₹{order.finalAmount.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 mt-0.5"
                                        >
                                            <Eye size={12} /> View Bill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Receipt Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="clay-card p-6 md:p-8 max-w-md w-full bg-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🌾</span>
                                <div>
                                    <h2 className="font-black text-lg text-slate-800">Agros Fertilizer Shop</h2>
                                    <p className="text-[11px] font-mono text-emerald-600 font-bold">{selectedOrder.invoiceNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-xs space-y-1 text-slate-500 pb-4 border-b border-dashed border-slate-200">
                            <div className="flex justify-between">
                                <span>Date:</span>
                                <span className="font-mono text-slate-700">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Customer:</span>
                                <span className="font-bold text-slate-800">{selectedOrder.customerName}</span>
                            </div>
                            {selectedOrder.customerMobile && (
                                <div className="flex justify-between">
                                    <span>Mobile:</span>
                                    <span className="font-mono text-slate-700">{selectedOrder.customerMobile}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Payment Mode:</span>
                                <span className="font-bold text-emerald-700">{selectedOrder.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="py-4 border-b border-dashed border-slate-200 space-y-2 text-xs">
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800">{item.productName}</p>
                                        <p className="text-[11px] text-slate-400 font-mono">{item.quantity} x ₹{item.unitPrice.toFixed(2)}</p>
                                    </div>
                                    <p className="font-mono font-bold text-slate-800">₹{item.subTotal.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-mono">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                            </div>
                            {selectedOrder.discountType !== 'NONE' && (
                                <div className="flex justify-between text-emerald-600 font-bold">
                                    <span>Discount</span>
                                    <span className="font-mono">-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total Paid</span>
                                <span className="text-emerald-600 font-mono">₹{selectedOrder.finalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button
                                onClick={() => printReceipt(selectedOrder)}
                                className="clay-btn-secondary flex-1 py-3 text-xs font-bold"
                            >
                                <Printer size={15} /> Print Receipt
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="clay-btn-primary flex-1 py-3 text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
