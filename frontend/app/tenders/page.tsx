'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tendersAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function TendersPage() {
    const [tenders, setTenders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [department, setDepartment] = useState('');
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const saved = localStorage.getItem('tcil_lang');
        if (saved) setLang(saved);
        const handler = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handler);
        return () => window.removeEventListener('langChange', handler);
    }, []);

    const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

    const fetchTenders = async () => {
        try {
            setLoading(true);
            const res = await tendersAPI.getAll({ status, department });
            setTenders(res.data.data || []);
        } catch {
            toast.error('Failed to load tenders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTenders(); }, [status, department]);

    const handleDownload = async (id: string) => {
        try {
            const res = await tendersAPI.getDownloadUrl(id);
            window.open(res.data.downloadUrl, '_blank');
        } catch {
            toast.error('Failed to get download link');
        }
    };

    const statusColors: Record<string, string> = {
        open: 'bg-green-100 text-green-700',
        closed: 'bg-red-100 text-red-700',
        awarded: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-gray-100 text-gray-700',
    };

    const statusLabels: Record<string, string> = {
        open: t('Open', 'खुली'),
        closed: t('Closed', 'बंद'),
        awarded: t('Awarded', 'प्रदान की गई'),
        cancelled: t('Cancelled', 'रद्द'),
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('Tenders & Procurement', 'निविदाएं और खरीद')}
                </h1>
                <p className="text-blue-200">
                    {t('Find all active and archived tenders from TCIL', 'टीसीआईएल की सभी सक्रिय और संग्रहीत निविदाएं खोजें')}
                </p>
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                        {t('Filter by Status', 'स्थिति के अनुसार फ़िल्टर करें')}
                    </label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                        <option value="">{t('All Status', 'सभी स्थिति')}</option>
                        <option value="open">{t('Open', 'खुली')}</option>
                        <option value="closed">{t('Closed', 'बंद')}</option>
                        <option value="awarded">{t('Awarded', 'प्रदान की गई')}</option>
                        <option value="cancelled">{t('Cancelled', 'रद्द')}</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                        {t('Filter by Department', 'विभाग के अनुसार फ़िल्टर करें')}
                    </label>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                        placeholder={t('Enter department...', 'विभाग दर्ज करें...')}
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-4">⏳</p>
                    <p>{t('Loading tenders...', 'निविदाएं लोड हो रही हैं...')}</p>
                </div>
            ) : tenders.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
                    <p className="text-4xl mb-4">📋</p>
                    <p>{t('No tenders found', 'कोई निविदा नहीं मिली')}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-900 text-white">
                            <tr>
                                <th className="text-left px-4 py-3">{t('Ref. No.', 'संदर्भ संख्या')}</th>
                                <th className="text-left px-4 py-3">{t('Title', 'शीर्षक')}</th>
                                <th className="text-left px-4 py-3">{t('Department', 'विभाग')}</th>
                                <th className="text-left px-4 py-3">{t('Deadline', 'अंतिम तिथि')}</th>
                                <th className="text-left px-4 py-3">{t('Status', 'स्थिति')}</th>
                                <th className="text-left px-4 py-3">{t('Action', 'कार्रवाई')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenders.map((tender, index) => (
                                <tr key={tender.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{tender.ref_number}</td>
                                    <td className="px-4 py-3 font-medium">
                                        <Link href={`/tenders/${tender.id}`} className="hover:text-blue-700 hover:underline">
                                            {lang === 'hi' && tender.title_hi ? tender.title_hi : tender.title_en}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{tender.department || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {tender.deadline ? moment(tender.deadline).format('DD MMM YYYY') : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tender.status] || 'bg-gray-100'}`}>
                                            {statusLabels[tender.status] || tender.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {tender.pdf_key && (
                                            <button onClick={() => handleDownload(tender.id)}
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