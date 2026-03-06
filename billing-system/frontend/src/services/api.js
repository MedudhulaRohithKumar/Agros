const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    products: {
        getAll: async () => {
            const res = await fetch(`${API_BASE_URL}/products`);
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        getByBarcode: async (barcode) => {
            const res = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`);
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw await handleApiError(res);
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
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        }
    }
};

async function handleApiError(res) {
    try {
        const errorData = await res.json();
        if (errorData.details) {
            // Validation errors map
            const msg = Object.values(errorData.details).join(", ");
            return new Error(msg || "Validation failed");
        }
        return new Error(errorData.message || 'Unknown API Error');
    } catch (e) {
        return new Error(`Server returned ${res.status}`);
    }
}
