'use client';
import { useEffect, useState } from 'react';
import { reportsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title_en: '', title_hi: '', year: '', report_type: 'annual' });
    const [pdf, setPdf] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchReports = async () => {
        try {
            const res = await reportsAPI.getAll();
            setReports(res.data.data || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReports(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pdf) return toast.error('PDF is required');
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.append('pdf', pdf);
            await reportsAPI.upload(formData);
            toast.success('Report uploaded!');
            setShowForm(false);
            setForm({ title_en: '', title_hi: '', year: '', report_type: 'annual' });
            setPdf(null);
            fetchReports();
        } catch { toast.error('Failed to upload'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this report?')) return;
        try {
            await reportsAPI.delete(id);
            toast.success('Deleted!');
            fetchReports();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Reports</h1>
                <button onClick={() => setShowForm(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    + Upload Report
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Upload Report</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Title (English) *</label>
                                <input type="text" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Annual Report 2025-26" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Title (Hindi)</label>
                                <input type="text" value={form.title_hi} onChange={(e) => setForm({ ...form, title_hi: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="वार्षिक रिपोर्ट" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Year *</label>
                                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="2026" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                                <select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                    <option value="annual">Annual Report</option>
                                    <option value="audit">Audit Report</option>
                                    <option value="rti">RTI</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">PDF File *</label>
                            <input type="file" accept=".pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {submitting ? 'Uploading...' : 'Upload Report'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Year</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No reports yet</td></tr>
                            ) : reports.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{item.title_en}</td>
                                    <td className="px-4 py-3">{item.year}</td>
                                    <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs capitalize">{item.report_type}</span></td>
                                    <td className="px-4 py-3"><button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-xs">Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}