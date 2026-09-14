import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Barcode as BarcodeIcon, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import Barcode from 'react-barcode';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Delete confirmation state
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dashboard notification toast message
    const [toastMessage, setToastMessage] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        barcode: '',
        category: 'Fertilizers',
        alert_stock: '10'
    });

    const showToast = (text, type = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.products.getAll();
            setProducts(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load products: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.products.update(editingProduct.id, {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock) || 0,
                    category: formData.category,
                    barcode: formData.barcode || null,
                    alert_stock: parseInt(formData.alert_stock) || 10
                });
                showToast(`Updated "${formData.name}" successfully!`);
            } else {
                await api.products.create({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock) || 0,
                    category: formData.category,
                    barcode: formData.barcode || null,
                    alert_stock: parseInt(formData.alert_stock) || 10
                });
                showToast(`Added new product "${formData.name}"!`);
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            showToast('Error saving product: ' + error.message, 'error');
        }
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            await api.products.delete(productToDelete.id);
            showToast(`Product "${productToDelete.name}" was successfully deleted from inventory.`);
            setProductToDelete(null);
            loadProducts();
        } catch (err) {
            showToast('Failed to delete product: ' + err.message, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            price: '',
            stock: '',
            barcode: '',
            category: 'Fertilizers',
            alert_stock: '10'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            barcode: product.barcode,
            category: product.category || 'Fertilizers',
            alert_stock: (product.alert_stock || 10).toString()
        });
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="h-full p-4 md:p-8 flex flex-col overflow-hidden pb-24 md:pb-8 max-w-7xl mx-auto w-full relative">
            {/* Pop-up Toast Message Banner in Dashboard */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-4 duration-200">
                    <div className={`clay-card px-5 py-3.5 flex items-center gap-3 border shadow-xl ${
                        toastMessage.type === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                        {toastMessage.type === 'error' ? (
                            <AlertCircle size={20} className="text-rose-600 shrink-0" />
                        ) : (
                            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                        )}
                        <span className="text-xs font-extrabold">{toastMessage.text}</span>
                        <button
                            onClick={() => setToastMessage(null)}
                            className="text-slate-400 hover:text-slate-600 ml-2"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                        <span>Stock & Inventory</span>
                        <span className="clay-badge bg-emerald-100 text-emerald-800 font-mono">
                            {products.length} Products
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Manage fertilizer products, prices, barcodes, and inventory levels
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="clay-btn-primary px-5 py-3 text-xs font-bold shadow-md self-start sm:self-auto"
                >
                    <Plus size={18} />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-5">
                <div className="clay-card-flat p-2 flex items-center gap-2 max-w-md bg-white">
                    <Search size={18} className="text-slate-400 ml-2" />
                    <input
                        type="text"
                        placeholder="Search by name, barcode, or category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-transparent px-2 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
                    />
                </div>
            </div>

            {/* Products Container */}
            <div className="clay-card flex-1 flex flex-col p-4 md:p-6 overflow-hidden bg-white/95">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-y-auto flex-1 pr-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3 px-4">Product Details</th>
                                <th className="pb-3 px-4">Category</th>
                                <th className="pb-3 px-4">Price</th>
                                <th className="pb-3 px-4">Stock Level</th>
                                <th className="pb-3 px-4">Barcode</th>
                                <th className="pb-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        Loading inventory items...
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        No products matched your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => {
                                    const isLow = product.stock <= (product.alert_stock || 10) && product.stock > 0;
                                    const isOut = product.stock <= 0;

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-4 font-bold text-slate-900">
                                                {product.name}
                                            </td>
                                            <td className="py-4 px-4 text-slate-500">
                                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-semibold text-[11px]">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-black text-slate-800 font-mono text-sm">
                                                ₹{product.price.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`clay-badge text-[10px] ${
                                                    isOut
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : isLow
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {isOut ? 'Out of Stock' : `${product.stock} units`}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="bg-white p-1 rounded-lg border border-slate-100 inline-block shadow-2xs">
                                                    <Barcode value={product.barcode} width={1.1} height={28} fontSize={11} margin={0} />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        title="Edit Product"
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setProductToDelete(product)}
                                                        title="Delete Product"
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Responsive Cards View */}
                <div className="md:hidden overflow-y-auto flex-1 space-y-3 pr-1">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 text-xs">Loading items...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">No products found.</div>
                    ) : (
                        filteredProducts.map(product => {
                            const isLow = product.stock <= (product.alert_stock || 10) && product.stock > 0;
                            const isOut = product.stock <= 0;

                            return (
                                <div key={product.id} className="clay-card-flat p-4 bg-white space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {product.category}
                                            </span>
                                            <h3 className="font-extrabold text-sm text-slate-800 leading-snug">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <span className={`clay-badge text-[10px] shrink-0 ${
                                            isOut
                                                ? 'bg-rose-100 text-rose-700'
                                                : isLow
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {isOut ? 'Out of Stock' : `${product.stock} units`}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <span className="text-lg font-black text-emerald-600 font-mono">
                                            ₹{product.price.toFixed(2)}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 text-slate-500 hover:text-emerald-600 bg-slate-50 rounded-xl"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setProductToDelete(product)}
                                                className="p-2 text-slate-500 hover:text-rose-600 bg-slate-50 rounded-xl"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-center bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                                        <Barcode value={product.barcode} width={1.2} height={30} fontSize={11} margin={0} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal - Add / Edit Product */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="clay-card p-6 md:p-8 max-w-md w-full bg-white animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <h2 className="text-xl font-black text-slate-800">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Urea 46% Nitrogen (45kg)"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="clay-input w-full px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="clay-input w-full px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        className="clay-input w-full px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="clay-input w-full px-3 py-2 text-xs text-slate-800 focus:outline-none"
                                    >
                                        <option value="Fertilizers">Fertilizers</option>
                                        <option value="Chemical Fertilizer">Chemical Fertilizer</option>
                                        <option value="Bio-Fertilizer">Bio-Fertilizer</option>
                                        <option value="Organic Manure">Organic Manure</option>
                                        <option value="Pesticides">Pesticides</option>
                                        <option value="Insecticides">Insecticides</option>
                                        <option value="Fungicides">Fungicides</option>
                                        <option value="Herbicides">Herbicides</option>
                                        <option value="Micronutrients">Micronutrients</option>
                                        <option value="Seeds">Seeds</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Alert</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.alert_stock}
                                        onChange={e => setFormData({ ...formData, alert_stock: e.target.value })}
                                        className="clay-input w-full px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Barcode (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Leave blank to auto-generate (e.g. AG...)"
                                    value={formData.barcode}
                                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                    className="clay-input w-full px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                                />
                                <span className="text-[10px] text-slate-400 block mt-1">
                                    Scan product with scanner or let system auto-assign code
                                </span>
                            </div>

                            <div className="pt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="clay-btn-secondary flex-1 py-3 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="clay-btn-primary flex-2 py-3 text-xs font-bold shadow-lg"
                                >
                                    {editingProduct ? 'Update Product' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Claymorphism Pop-up Modal: Delete Product Confirmation */}
            {productToDelete && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="clay-card p-6 md:p-8 max-w-md w-full bg-white animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Delete Product</h3>
                                <span className="clay-badge bg-rose-100 text-rose-700 text-[10px]">Irreversible Action</span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 mb-5 text-xs">
                            <p className="text-slate-400 font-semibold">Selected for deletion:</p>
                            <p className="font-extrabold text-slate-900 text-sm">{productToDelete.name}</p>
                            <div className="flex justify-between text-slate-500 pt-1 font-mono">
                                <span>Barcode: {productToDelete.barcode}</span>
                                <span>Stock: {productToDelete.stock} units</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                            Are you sure you want to remove this product from the inventory catalog? Historical sales records will keep their item details safely intact.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setProductToDelete(null)}
                                disabled={isDeleting}
                                className="clay-btn-secondary flex-1 py-3 text-xs font-bold"
                            >
                                Keep Product
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="clay-btn-danger flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <span>Deleting...</span>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>Yes, Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
