'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import moment from 'moment';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get('q') || '';
    const [query, setQuery] = useState(q);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
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
        if (q) { setQuery(q); doSearch(q); }
    }, [q]);

    const doSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const res = await searchAPI.search(searchQuery);
            setResults(res.data.results);
        } catch {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const totalResults = results
        ? (results.news?.length || 0) + (results.tenders?.length || 0) +
        (results.careers?.length || 0) + (results.services?.length || 0)
        : 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-4">{t('Search', 'खोज')}</h1>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('Search tenders, news, careers, services...', 'निविदाएं, समाचार, करियर, सेवाएं खोजें...')}
                        className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none" />
                    <button type="submit" className="bg-white text-blue-900 px-6 py-3 rounded-lg font-medium hover:bg-blue-50">
                        {t('Search', 'खोजें')}
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">{t('Searching...', 'खोज जारी है...')}</div>
            ) : results ? (
                <div className="space-y-8">
                    <p className="text-gray-600">
                        {t('Found', 'मिले')} <strong>{totalResults}</strong> {t('results for', 'परिणाम')} <strong>"{q}"</strong>
                    </p>

                    {results.news?.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-4">
                                {t('News', 'समाचार')} ({results.news.length})
                            </h2>
                            <div className="space-y-3">
                                {results.news.map((item: any) => (
                                    <Link key={item.id} href={`/news/${item.id}`}
                                        className="block bg-white border rounded-lg p-4 hover:shadow-md">
                                        <h3 className="font-medium text-blue-900">
                                            {lang === 'hi' && item.title_hi ? item.title_hi : item.title_en}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {moment(item.published_at).format('DD MMM YYYY')}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.tenders?.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-4">
                                {t('Tenders', 'निविदाएं')} ({results.tenders.length})
                            </h2>
                            <div className="space-y-3">
                                {results.tenders.map((item: any) => (
                                    <Link key={item.id} href={`/tenders/${item.id}`}
                                        className="block bg-white border rounded-lg p-4 hover:shadow-md">
                                        <span className="text-xs font-mono text-blue-600">{item.ref_number}</span>
                                        <h3 className="font-medium text-gray-800 mt-1">
                                            {lang === 'hi' && item.title_hi ? item.title_hi : item.title_en}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.careers?.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-4">
                                {t('Careers', 'करियर')} ({results.careers.length})
                            </h2>
                            <div className="space-y-3">
                                {results.careers.map((item: any) => (
                                    <Link key={item.id} href="/careers"
                                        className="block bg-white border rounded-lg p-4 hover:shadow-md">
                                        <h3 className="font-medium text-gray-800">
                                            {lang === 'hi' && item.post_name_hi ? item.post_name_hi : item.post_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{item.department}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.services?.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-4">
                                {t('Services', 'सेवाएं')} ({results.services.length})
                            </h2>
                            <div className="space-y-3">
                                {results.services.map((item: any) => (
                                    <Link key={item.id} href={`/services/${item.slug}`}
                                        className="block bg-white border rounded-lg p-4 hover:shadow-md">
                                        <h3 className="font-medium text-gray-800">
                                            {lang === 'hi' && item.title_hi ? item.title_hi : item.title_en}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {totalResults === 0 && (
                        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
                            <p className="text-4xl mb-4">🔍</p>
                            <p>{t('No results found for', 'के लिए कोई परिणाम नहीं मिला')} "{q}"</p>
                            <p className="text-sm mt-2">{t('Try different keywords', 'अलग कीवर्ड आज़माएं')}</p>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}