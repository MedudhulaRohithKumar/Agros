import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { ScanBarcode, Trash2, ShoppingBag, Plus, Minus, Printer } from 'lucide-react';

export default function POS() {
    const [barcodeInput, setBarcodeInput] = useState('');
    const [cart, setCart] = useState([]);
    const [discountType, setDiscountType] = useState('NONE');
    const [discountValue, setDiscountValue] = useState(0);

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [customer, setCustomer] = useState({ name: '', mobile: '' });

    const [completedOrder, setCompletedOrder] = useState(null);

    const barcodeInputRef = useRef(null);

    // Focus barcode input on mount and after modal close
    useEffect(() => {
        if (!isCheckoutModalOpen && !completedOrder) {
            barcodeInputRef.current?.focus();
        }
    }, [isCheckoutModalOpen, completedOrder]);

    const handleBarcodeSubmit = async (e) => {
        e.preventDefault();
        if (!barcodeInput.trim()) return;

        try {
            const product = await api.products.getByBarcode(barcodeInput.trim());
            addToCart(product);
            setBarcodeInput('');
        } catch (err) {
            alert("Product not found");
            setBarcodeInput('');
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    alert(`Cannot add more. Only ${product.stock} items in stock.`);
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            if (product.stock < 1) {
                alert(`Cannot add. Product "${product.name}" is out of stock.`);
                return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                if (newQ > item.stock) {
                    alert(`Cannot exceed available stock of ${item.stock}`);
                    return item;
                }
                return newQ > 0 ? { ...item, quantity: newQ } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const calculateTotal = () => {
        if (discountType === 'PERCENTAGE') {
            return Math.max(0, subTotal - (subTotal * (discountValue / 100)));
        } else if (discountType === 'FLAT') {
            return Math.max(0, subTotal - discountValue);
        }
        return subTotal;
    };

    const total = calculateTotal();

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        try {
            const orderPayload = {
                customerName: customer.name,
                customerMobile: customer.mobile,
                discountType: discountType,
                discountValue: parseFloat(discountValue) || 0,
                items: cart.map(item => ({
                    productId: item.id,
                    barcode: item.barcode,
                    quantity: item.quantity
                }))
            };

            const result = await api.orders.create(orderPayload);
            setCompletedOrder(result);
            setIsCheckoutModalOpen(false);
            setCart([]);
            setCustomer({ name: '', mobile: '' });
            setDiscountType('NONE');
            setDiscountValue(0);
        } catch (err) {
            alert(err.message);
        }
    };

    if (completedOrder) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center bg-slate-100">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full" id="receipt">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Agros Fertilizer Shop</h2>
                        <p className="text-slate-500 text-sm">Receipt #{completedOrder.id}</p>
                        <p className="text-slate-500 text-sm">{new Date(completedOrder.createdAt).toLocaleString()}</p>
                    </div>

                    {completedOrder.customerName && (
                        <div className="mb-4 border-b pb-4 text-sm text-slate-600">
                            <p>Customer: {completedOrder.customerName}</p>
                            <p>Mobile: {completedOrder.customerMobile || 'N/A'}</p>
                        </div>
                    )}

                    <div className="space-y-3 mb-6">
                        {completedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <div>
                                    <p className="font-medium text-slate-800">{item.productName}</p>
                                    <p className="text-slate-500">{item.quantity} x ₹{item.unitPrice.toFixed(2)}</p>
                                </div>
                                <p className="font-medium">₹{item.subTotal.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>₹{completedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                        {completedOrder.discountType !== 'NONE' && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Discount ({completedOrder.discountType === 'PERCENTAGE' ? `${completedOrder.discountValue}%` : `₹${completedOrder.discountValue}`})</span>
                                <span>-₹{(completedOrder.totalAmount - completedOrder.finalAmount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t mt-2">
                            <span>Total</span>
                            <span>₹{completedOrder.finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-md w-full mt-6 flex gap-4">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                    >
                        <Printer size={20} /> Print Receipt
                    </button>
                    <button
                        onClick={() => setCompletedOrder(null)}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        New Sale
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col md:flex-row bg-slate-50">
            {/* Left Area - Barcode Input & Cart */}
            <div className="flex-1 flex flex-col p-6 border-r border-slate-200 overflow-hidden h-full">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Point of Sale</h1>

                <form onSubmit={handleBarcodeSubmit} className="mb-6">
                    <div className="relative">
                        <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" size={24} />
                        <input
                            ref={barcodeInputRef}
                            type="text"
                            placeholder="Scan Barcode or Enter ID..."
                            value={barcodeInput}
                            onChange={e => setBarcodeInput(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>
                </form>

                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                            <ShoppingBag size={20} className="text-slate-500" />
                            Current Cart ({cart.length})
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <ShoppingBag size={48} className="mb-4 opacity-20" />
                                <p>Scan a product to begin</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-800">{item.name}</h3>
                                        <p className="text-sm text-slate-500">₹{item.price.toFixed(2)} <span className="text-slate-300 mx-1">|</span> {item.barcode}</p>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <div className="w-24 text-right font-medium text-slate-800">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>

                                        <button type="button" onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Area - Order Summary & Checkout */}
            <div className="w-full md:w-96 bg-white p-6 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] flex flex-col h-full z-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-800">₹{subTotal.toFixed(2)}</span>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Discount</label>
                        <div className="flex gap-2">
                            <select
                                value={discountType}
                                onChange={e => setDiscountType(e.target.value)}
                                className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="NONE">No Discount</option>
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FLAT">Flat ₹</option>
                            </select>
                            <input
                                type="number"
                                disabled={discountType === 'NONE'}
                                value={discountValue}
                                onChange={e => setDiscountValue(e.target.value)}
                                placeholder="Value"
                                className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between items-center py-4 border-t-2 border-slate-100 mb-6">
                        <span className="text-slate-500 font-medium text-lg">Total</span>
                        <span className="text-3xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={() => setIsCheckoutModalOpen(true)}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                    >
                        Checkout
                    </button>
                </div>
            </div>

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">Customer Details</h2>
                            <p className="text-slate-500 pl-0 mt-1 text-sm">Optional info for market basket analysis</p>
                        </div>

                        <form onSubmit={handleCheckout} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                                    <input
                                        type="text"
                                        placeholder="Walk-in"
                                        value={customer.name}
                                        onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter 10-digit number"
                                        value={customer.mobile}
                                        onChange={e => setCustomer({ ...customer, mobile: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCheckoutModalOpen(false)}
                                    className="w-1/3 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 py-3 bg-slate-900 hover:bg-black text-white rounded-xl transition-colors font-bold shadow-sm"
                                >
                                    Complete Sale (₹{total.toFixed(2)})
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
