'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (pathname === '/admin/login') return;
        const token = localStorage.getItem('tcil_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        const userData = localStorage.getItem('tcil_user');
        if (userData) setUser(JSON.parse(userData));
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('tcil_token');
        localStorage.removeItem('tcil_user');
        router.push('/admin/login');
    };

    if (pathname === '/admin/login') return <>{children}</>;

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/admin/news', label: 'News', icon: '📰' },
        { href: '/admin/tenders', label: 'Tenders', icon: '📋' },
        { href: '/admin/careers', label: 'Careers', icon: '💼' },
        { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
        { href: '/admin/reports', label: 'Reports', icon: '📄' },
        { href: '/admin/banners', label: 'Banners', icon: '🖼️' },
        { href: '/admin/contacts', label: 'Contacts', icon: '✉️' },
        { href: '/admin/grievances', label: 'Grievances', icon: '📢' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* SIDEBAR */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
                {/* SIDEBAR HEADER */}
                <div className="p-4 border-b border-blue-700 flex items-center justify-between">
                    {sidebarOpen && (
                        <div>
                            <p className="font-bold text-sm">TCIL Admin</p>
                            <p className="text-xs text-blue-300">CMS Dashboard</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-white hover:bg-blue-700 p-1 rounded"
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                {/* NAV ITEMS */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-700 transition-colors ${pathname === item.href ? 'bg-blue-700 border-r-4 border-white' : ''
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {sidebarOpen && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* USER INFO */}
                <div className="p-4 border-t border-blue-700">
                    {sidebarOpen && user && (
                        <div className="mb-3">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-blue-300 capitalize">{user.role}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-blue-300 hover:text-white"
                    >
                        <span>🚪</span>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOP BAR */}
                <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
                    <h1 className="font-bold text-gray-800">
                        TCIL Content Management System
                    </h1>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            View Website →
                        </Link>
                        {user && (
                            <span className="text-sm text-gray-500">
                                Welcome, {user.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* PAGE CONTENT */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}