'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor', department: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await adminAPI.getUsers();
            setUsers(res.data.data || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminAPI.createUser(form);
            toast.success('User created!');
            setShowForm(false);
            setForm({ name: '', email: '', password: '', role: 'editor', department: '' });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally { setSubmitting(false); }
    };

    const handleToggle = async (id: string) => {
        try {
            await adminAPI.toggleUser(id);
            toast.success('Status updated!');
            fetchUsers();
        } catch { toast.error('Failed to update'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
                <button onClick={() => setShowForm(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add User</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Create Admin User</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'John Doe' },
                                { label: 'Email *', key: 'email', type: 'email', placeholder: 'john@tcil.net.in' },
                                { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
                                { label: 'Department', key: 'department', type: 'text', placeholder: 'e.g. IT Division' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={(form as any)[field.key]}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        required={field.label.includes('*')}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                    <option value="editor">Editor</option>
                                    <option value="publisher">Publisher</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {submitting ? 'Creating...' : 'Create User'}
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
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                                    <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs capitalize">{user.role}</span></td>
                                    <td className="px-4 py-3 text-gray-500">{user.department || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleToggle(user.id)} className="text-blue-600 hover:underline text-xs">
                                            {user.active ? 'Deactivate' : 'Activate'}
                                        </button>
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