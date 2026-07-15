'use client';
import { useEffect, useState } from 'react';
import { contactAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContacts = async () => {
        try {
            const res = await contactAPI.getAll();
            setContacts(res.data.data || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchContacts(); }, []);

    const handleStatus = async (id: string, status: string) => {
        try {
            await contactAPI.updateStatus(id, status);
            toast.success('Status updated');
            fetchContacts();
        } catch { toast.error('Failed to update'); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Messages</h1>
            {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
                <div className="space-y-4">
                    {contacts.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">No messages yet</div>
                    ) : contacts.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.email} {item.phone && `• ${item.phone}`}</p>
                                    {item.subject && <p className="text-sm font-medium text-blue-900 mt-1">{item.subject}</p>}
                                    <p className="text-sm text-gray-700 mt-2">{item.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">{moment(item.created_at).format('DD MMM YYYY HH:mm')}</p>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'unread' ? 'bg-red-100 text-red-700' : item.status === 'read' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {item.status}
                                    </span>
                                    <select onChange={(e) => handleStatus(item.id, e.target.value)} defaultValue={item.status} className="border rounded text-xs px-2 py-1 focus:outline-none">
                                        <option value="unread">Unread</option>
                                        <option value="read">Read</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}