const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    products: {
        getAll: async () => {
            const res = await fetch(`${API_BASE_URL}/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
        getByBarcode: async (barcode) => {
            const res = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`);
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create product');
            return res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update product');
            return res.json();
        }
    },
    orders: {
        create: async (data) => {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to complete order');
            return res.json();
        }
    }
};
