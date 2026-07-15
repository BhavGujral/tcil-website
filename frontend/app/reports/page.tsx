'use client';
import { useEffect, useState } from 'react';
import { reportsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('');
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
                setLoading(true);
                const res = await reportsAPI.getAll({ type });
                setReports(res.data.data || []);
            } catch {
                toast.error('Failed to load reports');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [type]);

    const handleDownload = async (id: string) => {
        try {
            const res = await reportsAPI.getDownloadUrl(id);
            window.open(res.data.downloadUrl, '_blank');
        } catch {
            toast.error('Failed to get download link');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('Reports & Publications', 'रिपोर्ट और प्रकाशन')}
                </h1>
                <p className="text-blue-200">
                    {t('Annual reports, audit reports, RTI documents and more', 'वार्षिक रिपोर्ट, ऑडिट रिपोर्ट, आरटीआई दस्तावेज और अधिक')}
                </p>
            </div>

            <div className="bg-white rounded-xl border p-4 mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                    {t('Filter by Type', 'प्रकार के अनुसार फ़िल्टर करें')}
                </label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                    className="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">{t('All Types', 'सभी प्रकार')}</option>
                    <option value="annual">{t('Annual Reports', 'वार्षिक रिपोर्ट')}</option>
                    <option value="audit">{t('Audit Reports', 'ऑडिट रिपोर्ट')}</option>
                    <option value="rti">{t('RTI', 'आरटीआई')}</option>
                    <option value="other">{t('Other', 'अन्य')}</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">{t('Loading...', 'लोड हो रहा है...')}</div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
                    <p className="text-4xl mb-4">📄</p>
                    <p>{t('No reports found', 'कोई रिपोर्ट नहीं मिली')}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-900 text-white">
                            <tr>
                                <th className="text-left px-4 py-3">{t('Title', 'शीर्षक')}</th>
                                <th className="text-left px-4 py-3">{t('Year', 'वर्ष')}</th>
                                <th className="text-left px-4 py-3">{t('Type', 'प्रकार')}</th>
                                <th className="text-left px-4 py-3">{t('Action', 'कार्रवाई')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={report.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-3 font-medium">
                                        {lang === 'hi' && report.title_hi ? report.title_hi : report.title_en}
                                    </td>
                                    <td className="px-4 py-3">{report.year}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs capitalize">
                                            {report.report_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDownload(report.id)}
                                            className="bg-blue-900 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                                            📥 {t('Download PDF', 'पीडीएफ डाउनलोड करें')}
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