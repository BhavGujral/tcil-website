"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.login(form.email, form.password);
            localStorage.setItem('tcil_token', res.data.token);
            localStorage.setItem('tcil_user', JSON.stringify(res.data.user));
            toast.success('Login successful!');
            router.push('/admin/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="bg-blue-900 text-white w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">TCIL</div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
                    <p className="text-gray-500 text-sm mt-1">TCIL Content Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="admin@tcil.net.in"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 text-center">
                        Default credentials:<br />
                        <strong>admin@tcil.net.in</strong> / <strong>password</strong>
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    © 2026 TCIL. Authorized personnel only.
                </p>
            </div>
        </div>
    );
}