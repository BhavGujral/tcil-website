'use client';
import { useEffect, useState } from 'react';
import { careersAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function CareersPage() {
    const [careers, setCareers] = useState<any[]>([]);
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
                const res = await careersAPI.getAll({ status: 'active' });
                setCareers(res.data.data || []);
            } catch {
                toast.error('Failed to load careers');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleDownload = async (id: string) => {
        try {
            const res = await careersAPI.getDownloadUrl(id);
            window.open(res.data.downloadUrl, '_blank');
        } catch {
            toast.error('Failed to get download link');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('Career Opportunities', 'करियर के अवसर')}
                </h1>
                <p className="text-blue-200">
                    {t("Join TCIL and be part of India's premier telecom consultancy", 'टीसीआईएल में शामिल हों और भारत की प्रमुख दूरसंचार परामर्श कंपनी का हिस्सा बनें')}
                </p>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">{t('Loading...', 'लोड हो रहा है...')}</div>
            ) : careers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border">
                    <p className="text-4xl mb-4">💼</p>
                    <p className="text-gray-500">{t('No current openings', 'वर्तमान में कोई रिक्ति नहीं')}</p>
                    <p className="text-sm text-gray-400 mt-2">
                        {t('Please check back later for new opportunities', 'नए अवसरों के लिए बाद में देखें')}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-900 text-white">
                            <tr>
                                <th className="text-left px-4 py-3">{t('Post Name', 'पद का नाम')}</th>
                                <th className="text-left px-4 py-3">{t('Department', 'विभाग')}</th>
                                <th className="text-left px-4 py-3">{t('Vacancies', 'रिक्तियां')}</th>
                                <th className="text-left px-4 py-3">{t('Pay Level', 'वेतन स्तर')}</th>
                                <th className="text-left px-4 py-3">{t('Last Date', 'अंतिम तिथि')}</th>
                                <th className="text-left px-4 py-3">{t('Action', 'कार्रवाई')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {careers.map((career, i) => (
                                <tr key={career.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-3 font-medium">
                                        {lang === 'hi' && career.post_name_hi ? career.post_name_hi : career.post_name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{career.department || '—'}</td>
                                    <td className="px-4 py-3 text-center font-bold text-blue-900">{career.vacancies}</td>
                                    <td className="px-4 py-3 text-gray-600">{career.pay_level || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm font-medium ${moment(career.last_date).isBefore(moment()) ? 'text-red-500' : 'text-green-600'}`}>
                                            {career.last_date ? moment(career.last_date).format('DD MMM YYYY') : '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {career.pdf_key && (
                                            <button onClick={() => handleDownload(career.id)}
                                                className="bg-blue-900 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                                                📥 {t('Download', 'डाउनलोड')}
                                            </button>
                                        )}
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