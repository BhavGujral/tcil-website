'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState('en');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const toggleLanguage = () => {
        const newLang = lang === 'en' ? 'hi' : 'en';
        setLang(newLang);
        localStorage.setItem('tcil_lang', newLang);
        window.dispatchEvent(new CustomEvent('langChange', { detail: newLang }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            {/* TOP BAR */}
            <div className="bg-blue-900 text-white py-1 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-xs">
                    <span>A Government of India Enterprise</span>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="bg-white text-blue-900 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100"
                        >
                            {lang === 'en' ? 'हिंदी' : 'English'}
                        </button>
                        <Link href="/admin/login" className="hover:underline">
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* MAIN NAVBAR */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-blue-900 text-white w-12 h-12 rounded flex items-center justify-center font-bold text-lg">
                            TCIL
                        </div>
                        <div>
                            <p className="font-bold text-blue-900 text-sm leading-tight">
                                Telecommunications Consultants
                            </p>
                            <p className="font-bold text-blue-900 text-sm leading-tight">
                                India Limited
                            </p>
                            <p className="text-xs text-gray-500">
                                {lang === 'en' ? 'A Govt. of India Enterprise' : 'भारत सरकार का उद्यम'}
                            </p>
                        </div>
                    </Link>

                    {/* SEARCH BAR */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={lang === 'en' ? 'Search...' : 'खोजें...'}
                            className="border border-gray-300 rounded-l px-4 py-2 text-sm w-64 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-blue-900 text-white px-4 py-2 rounded-r text-sm hover:bg-blue-800"
                        >
                            🔍
                        </button>
                    </form>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-blue-900"
                    >
                        {isOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* NAVIGATION LINKS */}
            <div className="bg-blue-900">
                <div className="max-w-7xl mx-auto px-4">
                    <div className={`${isOpen ? 'block' : 'hidden'} md:flex flex-wrap gap-1 py-2`}>
                        {[
                            { href: '/', label: lang === 'en' ? 'Home' : 'होम' },
                            { href: '/about', label: lang === 'en' ? 'About Us' : 'हमारे बारे में' },
                            { href: '/services', label: lang === 'en' ? 'Services' : 'सेवाएं' },
                            { href: '/tenders', label: lang === 'en' ? 'Tenders' : 'निविदाएं' },
                            { href: '/careers', label: lang === 'en' ? 'Careers' : 'करियर' },
                            { href: '/news', label: lang === 'en' ? 'News & Events' : 'समाचार' },
                            { href: '/gallery', label: lang === 'en' ? 'Gallery' : 'गैलरी' },
                            { href: '/reports', label: lang === 'en' ? 'Reports' : 'रिपोर्ट' },
                            { href: '/grievance', label: lang === 'en' ? 'Grievance' : 'शिकायत' },
                            { href: '/contact', label: lang === 'en' ? 'Contact' : 'संपर्क' },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-white hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors block md:inline-block"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;