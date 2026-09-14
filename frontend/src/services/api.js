const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('agros_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export const api = {
    auth: {
        login: async (credentials) => {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        getMe: async () => {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        }
    },
    products: {
        getAll: async () => {
            const res = await fetch(`${API_BASE_URL}/products`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        getByBarcode: async (barcode) => {
            const res = await fetch(`${API_BASE_URL}/products/barcode/${encodeURIComponent(barcode)}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw await handleApiError(res);
            return true;
        }
    },
    orders: {
        create: async (data) => {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        getAll: async (limit = 50) => {
            const res = await fetch(`${API_BASE_URL}/orders?limit=${limit}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        },
        getById: async (id) => {
            const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        }
    },
    stats: {
        get: async () => {
            const res = await fetch(`${API_BASE_URL}/stats`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw await handleApiError(res);
            return res.json();
        }
    }
};

async function handleApiError(res) {
    try {
        const errorData = await res.json();
        if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
                return new Error(errorData.detail.map(d => d.msg || JSON.stringify(d)).join(', '));
            }
            return new Error(errorData.detail);
        }
        return new Error(errorData.message || `API error (${res.status})`);
    } catch (e) {
        return new Error(`Server returned HTTP ${res.status}`);
    }
}
