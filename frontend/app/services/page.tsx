'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { servicesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const saved = localStorage.getItem('tcil_lang');
        if (saved) setLang(saved);
        const handler = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handler);
        return () => window.removeEventListener('langChange', handler);
    }, []);

    const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await servicesAPI.getAll();
                setServices(res.data.data || []);
            } catch {
                toast.error('Failed to load services');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const serviceIcons: Record<string, string> = {
        telecom: '📡', it: '💻', healthcare: '🏥',
        solar: '☀️', civil: '🏗️', egovernance: '🏛️',
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('Our Services', 'हमारी सेवाएं')}
                </h1>
                <p className="text-blue-200">
                    {t('World-class solutions across telecom, IT, healthcare and more', 'दूरसंचार, आईटी, स्वास्थ्य और अधिक में विश्व स्तरीय समाधान')}
                </p>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">{t('Loading...', 'लोड हो रहा है...')}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <Link key={service.id} href={`/services/${service.slug}`}
                            className="bg-white border rounded-xl p-6 hover:shadow-lg hover:border-blue-500 transition-all group">
                            <div className="text-5xl mb-4">{serviceIcons[service.category] || '🔧'}</div>
                            <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-900 mb-2">
                                {lang === 'hi' && service.title_hi ? service.title_hi : service.title_en}
                            </h2>
                            <p className="text-gray-600 text-sm line-clamp-3">
                                {lang === 'hi' && service.body_hi
                                    ? service.body_hi?.substring(0, 150)
                                    : service.body_en?.substring(0, 150) || t('Click to learn more about this service', 'इस सेवा के बारे में अधिक जानने के लिए क्लिक करें')}
                            </p>
                            <p className="text-blue-600 text-sm mt-4 group-hover:underline">
                                {t('Learn More →', 'अधिक जानें →')}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}