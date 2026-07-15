'use client';
import { useEffect, useState } from 'react';
import { grievanceAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function AdminGrievancesPage() {
    const [grievances, setGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState<string | null>(null);
    const [response, setResponse] = useState('');

    const fetchGrievances = async () => {
        try {
            const res = await grievanceAPI.getAll();
            setGrievances(res.data.data || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGrievances(); }, []);

    const handleRespond = async (id: string) => {
        try {
            await grievanceAPI.respond(id, { status: 'resolved', admin_response: response });
            toast.success('Response sent!');
            setResponding(null);
            setResponse('');
            fetchGrievances();
        } catch { toast.error('Failed to respond'); }
    };

    const statusColors: Record<string, string> = {
        open: 'bg-red-100 text-red-700',
        in_progress: 'bg-yellow-100 text-yellow-700',
        resolved: 'bg-green-100 text-green-700',
        closed: 'bg-gray-100 text-gray-700',
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Grievances</h1>
            {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
                <div className="space-y-4">
                    {grievances.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">No grievances yet</div>
                    ) : grievances.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="font-mono text-xs text-blue-700">{item.ticket_number}</span>
                                    <p className="font-bold text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.email}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[item.status]}`}>
                                    {item.status?.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                            {item.admin_response && (
                                <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                                    <p className="text-xs text-green-600 font-medium">Response:</p>
                                    <p className="text-sm">{item.admin_response}</p>
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mb-3">{moment(item.created_at).format('DD MMM YYYY')}</p>
                            {responding === item.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        rows={3}
                                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="Type your response..."
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRespond(item.id)} className="bg-blue-900 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">Send Response</button>
                                        <button onClick={() => setResponding(null)} className="border px-4 py-1 rounded text-sm hover:bg-gray-50">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setResponding(item.id)} className="text-blue-600 hover:underline text-sm">
                                    {item.admin_response ? 'Update Response' : 'Respond'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}