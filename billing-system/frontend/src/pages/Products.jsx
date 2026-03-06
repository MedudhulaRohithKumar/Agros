import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Search, Edit2 } from 'lucide-react';
import Barcode from 'react-barcode';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({ name: '', price: '', barcode: '', stock: '' });

    const loadProducts = async () => {
        try {
            const data = await api.products.getAll();
            setProducts(data);
        } catch (error) {
            console.error(error);
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
                    stock: parseInt(formData.stock) || 0
                });
            } else {
                await api.products.create({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    barcode: formData.barcode || null,
                    stock: parseInt(formData.stock) || 0
                });
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            alert("Error saving product: " + error.message);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', price: '', barcode: '', stock: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({ name: product.name, price: product.price, barcode: product.barcode, stock: product.stock });
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
                    <p className="text-slate-500 mt-1">Manage fertilizer inventory and view barcodes.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or barcode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="pb-3 font-medium px-4">Name</th>
                                <th className="pb-3 font-medium px-4">Price</th>
                                <th className="pb-3 font-medium px-4">Stock</th>
                                <th className="pb-3 font-medium px-4">Barcode</th>
                                <th className="pb-3 font-medium px-4 w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-8 text-slate-500">Loading...</td></tr>
                            ) : filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="py-4 px-4 font-medium text-slate-900">{product.name}</td>
                                    <td className="py-4 px-4 text-slate-600">₹{product.price.toFixed(2)}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <Barcode value={product.barcode} width={1.2} height={40} fontSize={12} margin={0} />
                                    </td>
                                    <td className="py-4 px-4">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredProducts.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-8 text-slate-500">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                {!editingProduct && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Barcode (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Leave blank to auto-generate"
                                            value={formData.barcode}
                                            onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">If using a physical scanner, plug it in, focus this input, and scan the product.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
