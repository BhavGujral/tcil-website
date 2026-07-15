'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tendersAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function TenderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [tender, setTender] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await tendersAPI.getOne(id as string);
                setTender(res.data.data);
            } catch {
                toast.error('Tender not found');
                router.push('/tenders');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleDownload = async () => {
        try {
            const res = await tendersAPI.getDownloadUrl(id as string);
            window.open(res.data.downloadUrl, '_blank');
        } catch {
            toast.error('Failed to get download link');
        }
    };

    if (loading) return (
        <div className="text-center py-16 text-gray-400">Loading...</div>
    );

    if (!tender) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="text-blue-600 hover:underline mb-6 inline-block"
            >
                ← Back to Tenders
            </button>

            <div className="bg-white rounded-xl border p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded font-mono">
                            {tender.ref_number}
                        </span>
                        <h1 className="text-2xl font-bold text-gray-800 mt-3">
                            {tender.title_en}
                        </h1>
                        {tender.title_hi && (
                            <p className="text-gray-500 mt-1">{tender.title_hi}</p>
                        )}
                    </div>
                    <span
                        className={`px-3 py-1 rounded text-sm font-medium ${tender.status === 'open'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {tender.status?.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Department', value: tender.department },
                        { label: 'Deadline', value: tender.deadline ? moment(tender.deadline).format('DD MMM YYYY') : 'N/A' },
                        { label: 'Estimated Value', value: tender.value ? `₹${Number(tender.value).toLocaleString()}` : 'N/A' },
                        { label: 'Published', value: moment(tender.created_at).format('DD MMM YYYY') },
                    ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="font-medium text-gray-800">{item.value || '—'}</p>
                        </div>
                    ))}
                </div>

                {tender.description_en && (
                    <div className="mb-6">
                        <h2 className="font-bold text-gray-800 mb-2">Description</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {tender.description_en}
                        </p>
                    </div>
                )}

                {tender.pdf_key && (
                    <button
                        onClick={handleDownload}
                        className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        📥 Download Tender Document
                    </button>
                )}
            </div>
        </div>
    );
}