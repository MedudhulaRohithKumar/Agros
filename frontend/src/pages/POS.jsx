import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { printReceipt } from '../utils/printReceipt';
import { 
    ScanBarcode, Trash2, ShoppingBag, Plus, Minus, Printer, 
    Sparkles, CheckCircle2, CreditCard, Banknote, Smartphone, X, Search, Tag, Percent
} from 'lucide-react';

export default function POS() {
    const [barcodeInput, setBarcodeInput] = useState('');
    const [cart, setCart] = useState([]);
    const [discountType, setDiscountType] = useState('NONE');
    const [discountValue, setDiscountValue] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [customer, setCustomer] = useState({ name: '', mobile: '' });
    const [completedOrder, setCompletedOrder] = useState(null);

    // Quick product catalog for 1-tap add
    const [catalog, setCatalog] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingCatalog, setLoadingCatalog] = useState(true);

    const barcodeInputRef = useRef(null);

    const loadCatalog = async () => {
        try {
            const data = await api.products.getAll();
            setCatalog(data);
        } catch (err) {
            console.error('Failed to load products catalog', err);
        } finally {
            setLoadingCatalog(false);
        }
    };

    useEffect(() => {
        loadCatalog();
    }, []);

    // Keep barcode input focused for physical hardware scanner
    useEffect(() => {
        if (!isCheckoutModalOpen && !completedOrder && !isMobileCartOpen) {
            barcodeInputRef.current?.focus();
        }
    }, [isCheckoutModalOpen, completedOrder, isMobileCartOpen]);

    const handleBarcodeSubmit = async (e) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        try {
            const product = await api.products.getByBarcode(code);
            addToCart(product);
            setBarcodeInput('');
        } catch (err) {
            alert(`Product not found for barcode: "${code}"`);
            setBarcodeInput('');
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    alert(`Maximum available stock reached (${product.stock} units)`);
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            if (product.stock < 1) {
                alert(`"${product.name}" is out of stock!`);
                return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.quantity + delta;
                if (newQ > item.stock) {
                    alert(`Cannot exceed stock limit (${item.stock})`);
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

    // Precise discount calculation
    const getDiscountAmount = () => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'PERCENTAGE') {
            return (subTotal * val) / 100;
        } else if (discountType === 'FLAT') {
            return Math.min(subTotal, val);
        }
        return 0;
    };

    const discountAmount = getDiscountAmount();
    const finalTotal = Math.max(0, subTotal - discountAmount);

    const applyQuickDiscount = (type, val) => {
        setDiscountType(type);
        setDiscountValue(val);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        try {
            const payload = {
                customerName: customer.name.trim() || 'Walk-in Customer',
                customerMobile: customer.mobile.trim() || null,
                discountType: discountType,
                discountValue: parseFloat(discountValue) || 0,
                paymentMethod: paymentMethod,
                items: cart.map(item => ({
                    productId: item.id,
                    barcode: item.barcode,
                    quantity: item.quantity
                }))
            };

            const result = await api.orders.create(payload);
            setCompletedOrder(result);
            setIsCheckoutModalOpen(false);
            setIsMobileCartOpen(false);
            setCart([]);
            setCustomer({ name: '', mobile: '' });
            setDiscountType('NONE');
            setDiscountValue(0);
            loadCatalog(); // Refresh stock in catalog
        } catch (err) {
            alert('Checkout failed: ' + err.message);
        }
    };

    const filteredCatalog = catalog.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ----------------- SUCCESSFUL SALE RECEIPT VIEW -----------------
    if (completedOrder) {
        return (
            <div className="min-h-full p-4 md:p-8 flex flex-col items-center justify-center pb-24 md:pb-8">
                {/* Printable receipt card */}
                <div className="clay-card p-6 md:p-8 max-w-sm w-full animate-in zoom-in-95 duration-200" id="printable-receipt">
                    {/* Header */}
                    <div className="text-center pb-5 border-b border-dashed border-slate-300">
                        <div className="text-2xl mb-1.5">🌾</div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Agros Fertilizer Shop</h2>
                        <p className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mt-0.5">Official Tax Invoice</p>
                        <p className="text-[11px] font-mono text-slate-500 font-bold mt-1">{completedOrder.invoiceNumber}</p>
                        <p className="text-[10px] text-slate-400">{new Date(completedOrder.createdAt).toLocaleString()}</p>
                    </div>

                    {/* Customer & Payment Info */}
                    <div className="py-3 border-b border-dashed border-slate-300 text-[11px] space-y-1 text-slate-600">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Customer:</span>
                            <span className="font-bold text-slate-800">{completedOrder.customerName}</span>
                        </div>
                        {completedOrder.customerMobile && (
                            <div className="flex justify-between">
                                <span className="text-slate-400">Mobile:</span>
                                <span className="font-mono">{completedOrder.customerMobile}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-slate-400">Payment Mode:</span>
                            <span className="font-bold text-emerald-600">{completedOrder.paymentMethod}</span>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
                        {completedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px]">
                                <div className="pr-3">
                                    <p className="font-bold text-slate-800 leading-tight">{item.productName}</p>
                                    <p className="text-slate-400 font-mono text-[10px]">
                                        {item.quantity} x ₹{item.unitPrice.toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-bold text-slate-800 font-mono shrink-0">₹{item.subTotal.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Totals Breakdown */}
                    <div className="pt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-mono">₹{completedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                        {completedOrder.discountType !== 'NONE' && (
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Discount ({completedOrder.discountType === 'PERCENTAGE' ? `${completedOrder.discountValue}%` : `Flat ₹${completedOrder.discountValue}`})</span>
                                <span className="font-mono">-₹{completedOrder.discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                            <span>Total Paid</span>
                            <span className="text-emerald-700 font-mono">₹{completedOrder.finalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="text-center pt-5 text-[10px] text-slate-400">
                        Thank you for visiting Agros! 🌱
                    </div>
                </div>

                {/* Print & New Sale Controls (Hidden during print) */}
                <div className="max-w-sm w-full mt-5 flex gap-3 no-print">
                    <button
                        onClick={() => printReceipt(completedOrder)}
                        className="clay-btn-secondary flex-1 py-3 text-xs font-bold"
                    >
                        <Printer size={16} /> Print Receipt
                    </button>
                    <button
                        onClick={() => setCompletedOrder(null)}
                        className="clay-btn-primary flex-1 py-3 text-xs font-bold"
                    >
                        <Sparkles size={16} /> New Sale
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col md:flex-row p-3 md:p-6 gap-5 overflow-hidden pb-24 md:pb-6">
            {/* Left Area - Barcode Scanner & Quick-Add Catalog */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-4">
                {/* Header Bar */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <span>Point of Sale</span>
                            <span className="clay-badge bg-emerald-100 text-emerald-700">Live</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium hidden sm:block">
                            Scan barcodes or tap products to build customer invoice
                        </p>
                    </div>

                    {/* Mobile Cart Trigger Button */}
                    <button
                        onClick={() => setIsMobileCartOpen(true)}
                        className="md:hidden clay-btn-primary px-4 py-2.5 text-xs relative"
                    >
                        <ShoppingBag size={18} />
                        <span>Cart ({cart.length})</span>
                        {cart.length > 0 && (
                            <span className="ml-1 font-mono font-bold">₹{finalTotal.toFixed(0)}</span>
                        )}
                    </button>
                </div>

                {/* Barcode Input Well */}
                <form onSubmit={handleBarcodeSubmit} className="relative">
                    <div className="clay-card-flat p-2 flex items-center gap-2 bg-white">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <ScanBarcode size={22} />
                        </div>
                        <input
                            ref={barcodeInputRef}
                            type="text"
                            placeholder="Scan Barcode or Enter code (e.g. AG001, AG002)..."
                            value={barcodeInput}
                            onChange={e => setBarcodeInput(e.target.value)}
                            className="w-full bg-transparent px-2 text-sm md:text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="clay-btn-primary px-4 py-2 text-xs font-bold shrink-0"
                        >
                            Add
                        </button>
                    </div>
                </form>

                {/* Fast Catalog Picker */}
                <div className="clay-card flex-1 flex flex-col p-4 md:p-5 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-800">Quick Catalog</span>
                            <span className="text-[11px] font-bold text-slate-400">({filteredCatalog.length} items)</span>
                        </div>
                        <div className="relative max-w-xs w-full">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search fertilizers..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="clay-input w-full pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Catalog Grid */}
                    <div className="flex-1 overflow-y-auto pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1">
                        {loadingCatalog ? (
                            <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                                Loading catalog...
                            </div>
                        ) : filteredCatalog.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                                No products found. Add products in the Stock tab.
                            </div>
                        ) : (
                            filteredCatalog.map(item => {
                                const inCart = cart.find(c => c.id === item.id);
                                const isLow = item.stock <= item.alert_stock && item.stock > 0;
                                const isOut = item.stock <= 0;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => !isOut && addToCart(item)}
                                        className={`clay-card-flat p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                                            isOut 
                                                ? 'opacity-50 cursor-not-allowed bg-slate-100' 
                                                : 'hover:border-emerald-300 hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <span className="text-[10px] font-extrabold text-slate-400 font-mono">{item.barcode}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    isOut ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {isOut ? 'Out of stock' : `${item.stock} left`}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight">
                                                {item.name}
                                            </h3>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                                            <span className="text-sm font-black text-slate-900 font-mono">
                                                ₹{item.price.toFixed(2)}
                                            </span>
                                            {inCart ? (
                                                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                                                    {inCart.quantity}
                                                </span>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                                                    +
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Right Area (Desktop) / Slide Drawer (Mobile) - Cart & Checkout */}
            <div className={`
                fixed md:static inset-0 md:inset-auto z-50 md:z-auto
                w-full md:w-96 shrink-0 flex flex-col
                ${isMobileCartOpen ? 'flex' : 'hidden md:flex'}
                bg-black/40 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none
            `}>
                <div className="mt-auto md:mt-0 clay-card flex-1 flex flex-col p-5 max-h-[90vh] md:max-h-full overflow-hidden bg-white/95 rounded-t-3xl md:rounded-3xl">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <ShoppingBag size={18} />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-sm text-slate-800">Current Order</h2>
                                <span className="text-[11px] font-bold text-slate-400">{cart.length} items</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {cart.length > 0 && (
                                <button
                                    onClick={() => setCart([])}
                                    className="text-[11px] font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={() => setIsMobileCartOpen(false)}
                                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2 text-xl">
                                    🛒
                                </div>
                                <p className="font-bold text-xs text-slate-600">Cart is empty</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Scan a barcode or tap products from catalog</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="clay-card-flat p-2.5 flex items-center justify-between gap-2.5 bg-white">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs text-slate-800 truncate">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">₹{item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Stepper */}
                                    <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-xl p-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-5 h-5 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-90"
                                        >
                                            <Minus size={10} />
                                        </button>
                                        <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-5 h-5 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-90"
                                        >
                                            <Plus size={10} />
                                        </button>
                                    </div>

                                    <div className="w-14 text-right font-black text-xs text-slate-800 font-mono shrink-0">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors shrink-0"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary & Interactive Discount Selector */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5 mt-auto">
                        {/* Discount Selector in Cart */}
                        <div className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/60 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-700 flex items-center gap-1">
                                    <Tag size={13} className="text-emerald-600" /> Apply Discount
                                </span>
                                <span className="font-mono text-[11px] font-bold text-emerald-700">
                                    {discountType !== 'NONE' && `-₹${discountAmount.toFixed(2)}`}
                                </span>
                            </div>

                            {/* Preset Buttons */}
                            <div className="grid grid-cols-4 gap-1">
                                <button
                                    type="button"
                                    onClick={() => applyQuickDiscount('NONE', 0)}
                                    className={`py-1 rounded-xl text-[10px] font-bold transition-all ${
                                        discountType === 'NONE' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                                    }`}
                                >
                                    None
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyQuickDiscount('PERCENTAGE', 5)}
                                    className={`py-1 rounded-xl text-[10px] font-bold transition-all ${
                                        discountType === 'PERCENTAGE' && discountValue == 5 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                                    }`}
                                >
                                    5%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyQuickDiscount('PERCENTAGE', 10)}
                                    className={`py-1 rounded-xl text-[10px] font-bold transition-all ${
                                        discountType === 'PERCENTAGE' && discountValue == 10 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                                    }`}
                                >
                                    10%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyQuickDiscount('FLAT', 50)}
                                    className={`py-1 rounded-xl text-[10px] font-bold transition-all ${
                                        discountType === 'FLAT' && discountValue == 50 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                                    }`}
                                >
                                    ₹50
                                </button>
                            </div>

                            {/* Custom Discount Input */}
                            <div className="flex gap-2 items-center">
                                <select
                                    value={discountType}
                                    onChange={e => {
                                        setDiscountType(e.target.value);
                                        if (e.target.value === 'NONE') setDiscountValue(0);
                                    }}
                                    className="clay-input py-1 px-2 text-[11px] font-bold w-1/2 bg-white"
                                >
                                    <option value="NONE">No Discount</option>
                                    <option value="PERCENTAGE">Percent (%)</option>
                                    <option value="FLAT">Flat (₹)</option>
                                </select>
                                <input
                                    type="number"
                                    min="0"
                                    disabled={discountType === 'NONE'}
                                    placeholder={discountType === 'PERCENTAGE' ? '%' : '₹'}
                                    value={discountValue || ''}
                                    onChange={e => setDiscountValue(e.target.value)}
                                    className="clay-input py-1 px-2.5 text-[11px] font-mono font-bold w-1/2 bg-white disabled:opacity-40"
                                />
                            </div>
                        </div>

                        {/* Calculations */}
                        <div className="space-y-1 text-xs px-1">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-mono font-bold">₹{subTotal.toFixed(2)}</span>
                            </div>
                            {discountType !== 'NONE' && (
                                <div className="flex justify-between text-emerald-600 font-bold">
                                    <span>Discount ({discountType === 'PERCENTAGE' ? `${discountValue}%` : `₹${discountValue}`})</span>
                                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
                                <span className="font-extrabold text-sm text-slate-800">Total Payable</span>
                                <span className="text-2xl font-black text-emerald-600 font-mono">₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Checkout CTA */}
                        <button
                            type="button"
                            onClick={() => setIsCheckoutModalOpen(true)}
                            disabled={cart.length === 0}
                            className="clay-btn-primary w-full py-3.5 text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Proceed to Checkout (₹{finalTotal.toFixed(2)})
                        </button>
                    </div>
                </div>
            </div>

            {/* ----------------- CHECKOUT MODAL ----------------- */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="clay-card p-6 md:p-8 max-w-md w-full bg-white animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Complete Sale</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Attach customer details & confirm discount</p>
                            </div>
                            <button
                                onClick={() => setIsCheckoutModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-4">
                            {/* Customer Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    placeholder="Walk-in Customer (or enter name)"
                                    value={customer.name}
                                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                    className="clay-input w-full px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                                />
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (Optional)</label>
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    value={customer.mobile}
                                    onChange={e => setCustomer({ ...customer, mobile: e.target.value })}
                                    className="clay-input w-full px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                                />
                            </div>

                            {/* Discount Options in Checkout Modal */}
                            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                                <label className="block text-xs font-extrabold text-emerald-900 flex items-center justify-between">
                                    <span>Discount Selection</span>
                                    <span className="font-mono text-emerald-700">
                                        {discountType !== 'NONE' ? `-₹${discountAmount.toFixed(2)}` : 'No discount'}
                                    </span>
                                </label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => applyQuickDiscount('NONE', 0)}
                                        className={`py-1.5 rounded-xl text-[10px] font-bold ${
                                            discountType === 'NONE' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                                        }`}
                                    >
                                        None (0%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyQuickDiscount('PERCENTAGE', 5)}
                                        className={`py-1.5 rounded-xl text-[10px] font-bold ${
                                            discountType === 'PERCENTAGE' && discountValue == 5 ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                                        }`}
                                    >
                                        5% Off
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyQuickDiscount('PERCENTAGE', 10)}
                                        className={`py-1.5 rounded-xl text-[10px] font-bold ${
                                            discountType === 'PERCENTAGE' && discountValue == 10 ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                                        }`}
                                    >
                                        10% Off
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyQuickDiscount('FLAT', 100)}
                                        className={`py-1.5 rounded-xl text-[10px] font-bold ${
                                            discountType === 'FLAT' && discountValue == 100 ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                                        }`}
                                    >
                                        Flat ₹100
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'CASH', label: 'Cash', icon: Banknote },
                                        { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                                        { id: 'CARD', label: 'Card', icon: CreditCard },
                                    ].map(pm => {
                                        const Icon = pm.icon;
                                        const selected = paymentMethod === pm.id;
                                        return (
                                            <button
                                                key={pm.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(pm.id)}
                                                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                                                    selected
                                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                                                        : 'clay-card-flat text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Icon size={18} />
                                                <span>{pm.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Order Total Preview with Breakdown */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1 text-xs">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal:</span>
                                    <span className="font-mono">₹{subTotal.toFixed(2)}</span>
                                </div>
                                {discountType !== 'NONE' && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Discount:</span>
                                        <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200 text-slate-800">
                                    <span className="font-extrabold text-sm">Final Bill Amount:</span>
                                    <span className="text-xl font-black text-emerald-700 font-mono">₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCheckoutModalOpen(false)}
                                    className="clay-btn-secondary flex-1 py-3 text-xs font-bold"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="clay-btn-primary flex-2 py-3 text-xs font-bold shadow-lg"
                                >
                                    <CheckCircle2 size={16} /> Confirm & Print Bill
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
