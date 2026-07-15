'use client';
import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function AdminNewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState({
        title_en: '', title_hi: '', body_en: '', body_hi: '', status: 'draft',
    });
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchNews = async () => {
        try {
            const res = await newsAPI.getAll({ status: 'published', limit: 50 });
            const res2 = await newsAPI.getAll({ status: 'draft', limit: 50 });
            setNews([...(res.data.data || []), ...(res2.data.data || [])]);
        } catch { toast.error('Failed to load news'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNews(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (image) formData.append('image', image);

            if (editItem) {
                await newsAPI.update(editItem.id, formData);
                toast.success('News updated!');
            } else {
                await newsAPI.create(formData);
                toast.success('News created!');
            }
            setShowForm(false);
            setEditItem(null);
            setForm({ title_en: '', title_hi: '', body_en: '', body_hi: '', status: 'draft' });
            setImage(null);
            fetchNews();
        } catch { toast.error('Failed to save news'); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setForm({
            title_en: item.title_en || '',
            title_hi: item.title_hi || '',
            body_en: item.body_en || '',
            body_hi: item.body_hi || '',
            status: item.status || 'draft',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await newsAPI.delete(id);
            toast.success('Deleted successfully');
            fetchNews();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage News</h1>
                <button
                    onClick={() => { setShowForm(true); setEditItem(null); setForm({ title_en: '', title_hi: '', body_en: '', body_hi: '', status: 'draft' }); }}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Add News
                </button>
            </div>

            {/* FORM */}
            {showForm && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">
                        {editItem ? 'Edit Article' : 'Add New Article'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Title (English) *</label>
                                <input
                                    type="text"
                                    value={form.title_en}
                                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Enter title in English"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Title (Hindi)</label>
                                <input
                                    type="text"
                                    value={form.title_hi}
                                    onChange={(e) => setForm({ ...form, title_hi: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="हिंदी में शीर्षक दर्ज करें"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Body (English) *</label>
                            <textarea
                                value={form.body_en}
                                onChange={(e) => setForm({ ...form, body_en: e.target.value })}
                                required
                                rows={6}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Enter article content in English"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Body (Hindi)</label>
                            <textarea
                                value={form.body_hi}
                                onChange={(e) => setForm({ ...form, body_hi: e.target.value })}
                                rows={6}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="हिंदी में सामग्री दर्ज करें"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Featured Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : editItem ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditItem(null); }}
                                className="border px-6 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LIST */}
            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-400">
                                        No news articles yet
                                    </td>
                                </tr>
                            ) : (
                                news.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{item.title_en}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : item.status === 'draft'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {moment(item.created_at).format('DD MMM YYYY')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:underline text-xs"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:underline text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}