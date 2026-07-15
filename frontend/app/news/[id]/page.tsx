'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { newsAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function NewsDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await newsAPI.getOne(id as string);
                setArticle(res.data.data);
            } catch {
                toast.error('Article not found');
                router.push('/news');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) return <div className="text-center py-16">Loading...</div>;
    if (!article) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="text-blue-600 hover:underline mb-6 inline-block"
            >
                ← Back to News
            </button>
            <div className="bg-white rounded-xl border p-8">
                <p className="text-sm text-gray-400 mb-2">
                    {moment(article.published_at).format('DD MMMM YYYY')}
                </p>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {article.title_en}
                </h1>
                {article.title_hi && (
                    <p className="text-xl text-gray-500 mb-6">{article.title_hi}</p>
                )}
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {article.body_en}
                </div>
                {article.body_hi && (
                    <div className="mt-8 pt-8 border-t">
                        <h2 className="text-lg font-bold text-gray-600 mb-4">हिंदी</h2>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {article.body_hi}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
