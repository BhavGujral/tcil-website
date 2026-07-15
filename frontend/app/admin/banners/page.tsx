'use client';
import { useEffect, useState } from 'react';
import { bannersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title_en: '', title_hi: '', subtitle_en: '', subtitle_hi: '', link_url: '', sort_order: '0' });
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchBanners = async () => {
        try {
            const res = await bannersAPI.getAll();
            setBanners(res.data.data || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) return toast.error('Image is required');
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.append('image', image);
            await bannersAPI.create(formData);
            toast.success('Banner created!');
            setShowForm(false);
            setForm({ title_en: '', title_hi: '', subtitle_en: '', subtitle_hi: '', link_url: '', sort_order: '0' });
            setImage(null);
            fetchBanners();
        } catch { toast.error('Failed to create banner'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        try {
            await bannersAPI.delete(id);
            toast.success('Deleted!');
            fetchBanners();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Banners</h1>
                <button onClick={() => setShowForm(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Banner</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Add Homepage Banner</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Title (English)', key: 'title_en', placeholder: 'Banner title' },
                                { label: 'Title (Hindi)', key: 'title_hi', placeholder: 'बैनर शीर्षक' },
                                { label: 'Subtitle (English)', key: 'subtitle_en', placeholder: 'Banner subtitle' },
                                { label: 'Subtitle (Hindi)', key: 'subtitle_hi', placeholder: 'उपशीर्षक' },
                                { label: 'Link URL', key: 'link_url', placeholder: 'https://...' },
                                { label: 'Sort Order', key: 'sort_order', placeholder: '0' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                                    <input type="text" value={(form as any)[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder={field.placeholder} />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Banner Image * (recommended: 1920x600)</label>
                            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {submitting ? 'Uploading...' : 'Create Banner'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
                <div className="space-y-4">
                    {banners.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">No banners yet</div>
                    ) : banners.map((banner) => (
                        <div key={banner.id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img src={`${MINIO_URL}/tcil-banners/${banner.image_key}`} alt={banner.title_en} className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = 'none'; }} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{banner.title_en || 'No title'}</p>
                                    <p className="text-sm text-gray-500">{banner.subtitle_en || ''}</p>
                                    <p className="text-xs text-gray-400">Order: {banner.sort_order}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(banner.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}