'use client';
import { useEffect, useState } from 'react';
import { careersAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function AdminCareersPage() {
    const [careers, setCareers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        post_name: '', post_name_hi: '', department: '',
        vacancies: '1', qualification: '', pay_level: '',
        last_date: '', status: 'active',
    });
    const [pdf, setPdf] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchCareers = async () => {
        try {
            const res = await careersAPI.getAll({ limit: 100 });
            setCareers(res.data.data || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCareers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (pdf) formData.append('pdf', pdf);
            await careersAPI.create(formData);
            toast.success('Career opening created!');
            setShowForm(false);
            setForm({ post_name: '', post_name_hi: '', department: '', vacancies: '1', qualification: '', pay_level: '', last_date: '', status: 'active' });
            setPdf(null);
            fetchCareers();
        } catch { toast.error('Failed to create'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this career opening?')) return;
        try {
            await careersAPI.delete(id);
            toast.success('Deleted!');
            fetchCareers();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Careers</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Add Opening
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Add Career Opening</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Post Name (English) *', key: 'post_name', required: true, placeholder: 'e.g. Junior Engineer' },
                                { label: 'Post Name (Hindi)', key: 'post_name_hi', placeholder: 'हिंदी में पद का नाम' },
                                { label: 'Department', key: 'department', placeholder: 'e.g. IT Division' },
                                { label: 'Vacancies', key: 'vacancies', placeholder: '1', type: 'number' },
                                { label: 'Pay Level', key: 'pay_level', placeholder: 'e.g. Level-7' },
                                { label: 'Last Date', key: 'last_date', type: 'date' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                                    <input
                                        type={field.type || 'text'}
                                        value={(form as any)[field.key]}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        required={field.required}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Qualification</label>
                            <textarea
                                value={form.qualification}
                                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                                rows={3}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Required qualifications..."
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
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Notification PDF</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setPdf(e.target.files?.[0] || null)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Create Opening'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg hover:bg-gray-50">
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
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Post Name</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Vacancies</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Date</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {careers.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No career openings yet</td></tr>
                            ) : careers.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{item.post_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.department || '—'}</td>
                                    <td className="px-4 py-3 text-center font-bold">{item.vacancies}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.last_date ? moment(item.last_date).format('DD MMM YYYY') : '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}