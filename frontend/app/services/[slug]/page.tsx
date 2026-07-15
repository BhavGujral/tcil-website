'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { servicesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await servicesAPI.getOne(slug as string);
                setService(res.data.data);
            } catch {
                toast.error('Service not found');
                router.push('/services');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [slug]);

    if (loading) return <div className="text-center py-16">Loading...</div>;
    if (!service) return null;

    const serviceIcons: Record<string, string> = {
        telecom: '📡', it: '💻', healthcare: '🏥',
        solar: '☀️', civil: '🏗️', egovernance: '🏛️',
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="text-blue-600 hover:underline mb-6 inline-block"
            >
                ← Back to Services
            </button>
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="bg-blue-900 text-white p-8">
                    <div className="text-6xl mb-4">
                        {serviceIcons[service.category] || '🔧'}
                    </div>
                    <h1 className="text-3xl font-bold">{service.title_en}</h1>
                    {service.title_hi && (
                        <p className="text-blue-300 mt-1">{service.title_hi}</p>
                    )}
                </div>
                <div className="p-8">
                    {service.body_en ? (
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {service.body_en}
                        </div>
                    ) : (
                        <p className="text-gray-400">
                            Content coming soon. Please contact us for more information.
                        </p>
                    )}
                    {service.body_hi && (
                        <div className="mt-8 pt-8 border-t">
                            <h2 className="text-lg font-bold text-gray-600 mb-4">हिंदी</h2>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {service.body_hi}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}