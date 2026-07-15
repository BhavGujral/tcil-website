'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await adminAPI.getStats();
                setStats(res.data.data);
            } catch (error) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const statCards = [
        { label: 'Total News', value: stats?.total_news, icon: '📰', href: '/admin/news', color: 'bg-blue-500' },
        { label: 'Total Tenders', value: stats?.total_tenders, icon: '📋', href: '/admin/tenders', color: 'bg-green-500' },
        { label: 'Total Careers', value: stats?.total_careers, icon: '💼', href: '/admin/careers', color: 'bg-purple-500' },
        { label: 'Unread Messages', value: stats?.unread_contacts, icon: '✉️', href: '/admin/contacts', color: 'bg-yellow-500' },
        { label: 'Open Grievances', value: stats?.open_grievances, icon: '📢', href: '/admin/grievances', color: 'bg-red-500' },
    ];

    const quickActions = [
        { label: 'Add News Article', href: '/admin/news', icon: '📰' },
        { label: 'Upload Tender', href: '/admin/tenders', icon: '📋' },
        { label: 'Post Career Opening', href: '/admin/careers', icon: '💼' },
        { label: 'Upload Report', href: '/admin/reports', icon: '📄' },
        { label: 'Add Banner', href: '/admin/banners', icon: '🖼️' },
        { label: 'Manage Users', href: '/admin/users', icon: '👥' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
                    >
                        <div className={`${card.color} text-white w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3`}>
                            {card.icon}
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                            {loading ? '...' : card.value ?? 0}
                        </p>
                        <p className="text-sm text-gray-500">{card.label}</p>
                    </Link>
                ))}
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-xl border p-6 mb-8">
                <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="border rounded-lg p-3 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                            <p className="text-2xl mb-1">{action.icon}</p>
                            <p className="text-xs font-medium text-gray-600">{action.label}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* INFO BOX */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="font-bold text-blue-900 mb-2">
                    Welcome to TCIL CMS Dashboard
                </h2>
                <p className="text-sm text-blue-700">
                    Use the sidebar to navigate between modules. You can manage all
                    website content including news, tenders, careers, gallery, and more
                    from here. Changes reflect on the public website immediately.
                </p>
            </div>
        </div>
    );
}