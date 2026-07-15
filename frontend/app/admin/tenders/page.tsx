'use client';
import { useEffect, useState } from 'react';
import { tendersAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function AdminTendersPage() {
    const [tenders, setTenders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        ref_number: '', title_en: '', title_hi: '',
        description_en: '', description_hi: '',
        department: '', deadline: '', value: '', status: 'open',
    });
    const [pdf, setPdf] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchTenders = async () => {
        try {
            const res = await tendersAPI.getAll({ limit: 100 });
            setTenders(res.data.data || []);
        } catch { toast.error('Failed to load tenders'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTenders(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (pdf) formData.append('pdf', pdf);
            await tendersAPI.create(formData);
            toast.success('Tender created successfully!');
            setShowForm(false);
            setForm({ ref_number: '', title_en: '', title_hi: '', description_en: '', description_hi: '', department: '', deadline: '', value: '', status: 'open' });
            setPdf(null);
            fetchTenders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create tender');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this tender?')) return;
        try {
            await tendersAPI.delete(id);
            toast.success('Deleted!');
            fetchTenders();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Tenders</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Add Tender
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Add New Tender</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Reference Number *</label>
                                <input
                                    type="text"
                                    value={form.ref_number}
                                    onChange={(e) => setForm({ ...form, ref_number: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. TCIL/IT/2026/001"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Department</label>
                                <input
                                    type="text"
                                    value={form.department}
                                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. IT Division"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Title (English) *</label>
                                <input
                                    type="text"
                                    value={form.title_en}
                                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Tender title in English"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Title (Hindi)</label>
                                <input
                                    type="text"
                                    value={form.title_hi}
                                    onChange={(e) => setForm({ ...form, title_hi: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="हिंदी में शीर्षक"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Deadline</label>
                                <input
                                    type="datetime-local"
                                    value={form.deadline}
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Estimated Value (₹)</label>
                                <input
                                    type="number"
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. 1000000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Description (English)</label>
                            <textarea
                                value={form.description_en}
                                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                                rows={4}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Tender description in English"
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
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="awarded">Awarded</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Tender PDF</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setPdf(e.target.files?.[0] || null)}
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
                                {submitting ? 'Uploading...' : 'Create Tender'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border px-6 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Ref No.</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Deadline</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400">
                                        No tenders yet
                                    </td>
                                </tr>
                            ) : (
                                tenders.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-xs text-blue-700">{item.ref_number}</td>
                                        <td className="px-4 py-3 font-medium">{item.title_en}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {item.deadline ? moment(item.deadline).format('DD MMM YYYY') : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:underline text-xs"
                                            >
                                                Delete
                                            </button>
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