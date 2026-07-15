'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { newsAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const saved = localStorage.getItem('tcil_lang');
        if (saved) setLang(saved);
        const handler = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handler);
        return () => window.removeEventListener('langChange', handler);
    }, []);

    const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

    const fetchNews = async () => {
        try {
            setLoading(true);
            const res = await newsAPI.getAll({ page, limit: 10 });
            setNews(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
        } catch {
            toast.error('Failed to load news');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNews(); }, [page]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('News & Events', 'समाचार और कार्यक्रम')}
                </h1>
                <p className="text-blue-200">{t('Latest updates from TCIL', 'टीसीआईएल के ताजा अपडेट')}</p>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">{t('Loading...', 'लोड हो रहा है...')}</div>
            ) : news.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
                    <p className="text-4xl mb-4">📰</p>
                    <p>{t('No news articles found', 'कोई समाचार नहीं मिला')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((article) => (
                        <div key={article.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-blue-900 text-white p-4">
                                <p className="text-xs text-blue-300">
                                    {moment(article.published_at).format('DD MMMM YYYY')}
                                </p>
                                <h2 className="font-bold mt-1 line-clamp-2">
                                    {lang === 'hi' && article.title_hi ? article.title_hi : article.title_en}
                                </h2>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-600 text-sm line-clamp-3">
                                    {lang === 'hi' && article.body_hi
                                        ? article.body_hi?.substring(0, 200)
                                        : article.body_en?.substring(0, 200)}...
                                </p>
                                <Link href={`/news/${article.id}`}
                                    className="mt-3 inline-block bg-blue-900 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                                    {t('Read More →', 'और पढ़ें →')}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`px-4 py-2 rounded ${p === page ? 'bg-blue-900 text-white' : 'bg-white border hover:bg-gray-50'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}