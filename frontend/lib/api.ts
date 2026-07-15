import axios from 'axios';

// This is the base URL of our Node.js backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance with default settings
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add JWT token to every request if user is logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('tcil_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('tcil_token');
            if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// ---- AUTH ----
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),
    me: () => api.get('/api/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.put('/api/auth/change-password', { currentPassword, newPassword }),
};

// ---- NEWS ----
export const newsAPI = {
    getAll: (params?: any) => api.get('/api/news', { params }),
    getOne: (id: string) => api.get(`/api/news/${id}`),
    create: (data: FormData) =>
        api.post('/api/news', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    update: (id: string, data: FormData) =>
        api.put(`/api/news/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) => api.delete(`/api/news/${id}`),
};

// ---- TENDERS ----
export const tendersAPI = {
    getAll: (params?: any) => api.get('/api/tenders', { params }),
    getOne: (id: string) => api.get(`/api/tenders/${id}`),
    getDownloadUrl: (id: string) => api.get(`/api/tenders/${id}/download`),
    create: (data: FormData) =>
        api.post('/api/tenders', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    update: (id: string, data: FormData) =>
        api.put(`/api/tenders/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) => api.delete(`/api/tenders/${id}`),
};

// ---- CAREERS ----
export const careersAPI = {
    getAll: (params?: any) => api.get('/api/careers', { params }),
    getOne: (id: string) => api.get(`/api/careers/${id}`),
    getDownloadUrl: (id: string) => api.get(`/api/careers/${id}/download`),
    create: (data: FormData) =>
        api.post('/api/careers', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    update: (id: string, data: FormData) =>
        api.put(`/api/careers/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) => api.delete(`/api/careers/${id}`),
};

// ---- SERVICES ----
export const servicesAPI = {
    getAll: () => api.get('/api/services'),
    getOne: (slug: string) => api.get(`/api/services/${slug}`),
    update: (id: string, data: FormData) =>
        api.put(`/api/services/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

// ---- GALLERY ----
export const galleryAPI = {
    getAlbums: () => api.get('/api/gallery/albums'),
    getPhotos: (albumId: string) =>
        api.get(`/api/gallery/albums/${albumId}/photos`),
    createAlbum: (data: any) => api.post('/api/gallery/albums', data),
    uploadPhotos: (albumId: string, data: FormData) =>
        api.post(`/api/gallery/albums/${albumId}/photos`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    deletePhoto: (id: string) => api.delete(`/api/gallery/photos/${id}`),
};

// ---- REPORTS ----
export const reportsAPI = {
    getAll: (params?: any) => api.get('/api/reports', { params }),
    getDownloadUrl: (id: string) => api.get(`/api/reports/${id}/download`),
    upload: (data: FormData) =>
        api.post('/api/reports', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) => api.delete(`/api/reports/${id}`),
};

// ---- BANNERS ----
export const bannersAPI = {
    getAll: () => api.get('/api/banners'),
    create: (data: FormData) =>
        api.post('/api/banners', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) => api.delete(`/api/banners/${id}`),
};

// ---- CONTACT ----
export const contactAPI = {
    submit: (data: any) => api.post('/api/contact', data),
    getAll: (params?: any) => api.get('/api/contact', { params }),
    updateStatus: (id: string, status: string) =>
        api.put(`/api/contact/${id}`, { status }),
};

// ---- GRIEVANCE ----
export const grievanceAPI = {
    submit: (data: any) => api.post('/api/grievance', data),
    track: (ticketNumber: string) =>
        api.get(`/api/grievance/track/${ticketNumber}`),
    getAll: (params?: any) => api.get('/api/grievance', { params }),
    respond: (id: string, data: any) => api.put(`/api/grievance/${id}`, data),
};

// ---- SEARCH ----
export const searchAPI = {
    search: (q: string, type?: string) =>
        api.get('/api/search', { params: { q, type } }),
};

// ---- ADMIN ----
export const adminAPI = {
    getStats: () => api.get('/api/admin/stats'),
    getUsers: () => api.get('/api/admin/users'),
    createUser: (data: any) => api.post('/api/admin/users', data),
    toggleUser: (id: string) => api.put(`/api/admin/users/${id}/toggle`),
};

export default api;