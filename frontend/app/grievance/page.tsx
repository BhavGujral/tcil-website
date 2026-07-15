'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function GrievancePage() {
    const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
    const [lang, setLang] = useState('en');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: '',
        description: ''
    });

    const [trackingId, setTrackingId] = useState('');
    const [ticketDetails, setTicketDetails] = useState<any>(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedId, setSubmittedId] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('tcil_lang');
        if (saved) setLang(saved);
        const handler = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handler);
        return () => window.removeEventListener('langChange', handler);
    }, []);

    const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmitGrievance = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // We call the exact backend route. No retries, no guessing.
            const res = await axios.post('http://localhost:4000/api/grievance', formData);

            // Use ticket_number directly from your backend database response
            const ticketNumber = res.data.data.ticket_number;

            setSubmittedId(ticketNumber);
            setIsSubmitted(true);
            setToast(t('Grievance submitted successfully!', 'शिकायत सफलतापूर्वक सबमिट की गई!'));
            setTimeout(() => setToast(''), 4000);
        } catch (err: any) {
            console.error(err);
            setError(t('Failed to submit grievance. Please try again.', 'शिकायत सबमिट करने में विफल।'));
        } finally {
            setLoading(false);
        }
    };

    const handleTrackGrievance = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setTicketDetails(null);
        setLoading(true);

        try {
            const res = await axios.get(`http://localhost:4000/api/grievance/track/${trackingId.trim()}`);
            setTicketDetails(res.data.data);
        } catch (err: any) {
            setError(t('Grievance record not found.', 'शिकायत रिकॉर्ड नहीं मिला।'));
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 relative">

            {toast && (
                <div className="fixed top-20 right-8 bg-white border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 z-50 animate-fade-in">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
                    <p className="text-gray-800 text-sm font-medium">{toast}</p>
                </div>
            )}

            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 rounded-xl mb-8 shadow-md">
                <h1 className="text-3xl font-bold mb-2">{t('Grievance Portal', 'शिकायत पोर्टल')}</h1>
                <p className="text-blue-100">{t('Submit and track your grievances with TCIL securely', 'टीसीआईएल के साथ अपनी शिकायतें सुरक्षित रूप से सबमिट और ट्रैक करें')}</p>
            </div>

            <div className="flex gap-4 mb-6 border-b pb-3">
                <button
                    onClick={() => { setActiveTab('submit'); setError(''); }}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${activeTab === 'submit' ? 'bg-blue-900 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {t('Submit Grievance', 'शिकायत दर्ज करें')}
                </button>
                <button
                    onClick={() => { setActiveTab('track'); setError(''); }}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${activeTab === 'track' ? 'bg-blue-900 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {t('Track Grievance', 'शिकायत ट्रैक करें')}
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm">{error}</div>}

            {activeTab === 'submit' && (
                !isSubmitted ? (
                    <form onSubmit={handleSubmitGrievance} className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('Submit New Grievance', 'नई शिकायत दर्ज करें')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Your Name *', 'आपका नाम *')}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Email Address *', 'ईमेल पता *')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Phone Number', 'फ़ोन नंबर')}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Category *', 'श्रेणी *')}</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="">{t('-- Select Category --', '-- श्रेणी का चयन करें --')}</option>
                                    <option value="telecom">{t('Telecom Services', 'दूरसंचार सेवाएं')}</option>
                                    <option value="it">{t('IT Procurement', 'आईटी खरीद')}</option>
                                    <option value="billing">{t('Billing & Tenders', 'बिलिंग और निविदाएं')}</option>
                                    <option value="other">{t('Other Issues', 'अन्य मुद्दे')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Description * (Minimum 20 characters)', 'विवरण * (कम से कम 20 वर्ण)')}
                            </label>
                            <textarea
                                name="description"
                                rows={5}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={t('Provide complete details regarding your grievance...', 'अपनी शिकायत के बारे में पूरी जानकारी प्रदान करें...')}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-colors mt-4 disabled:opacity-50"
                        >
                            {loading ? t('Submitting...', 'सबमिट किया जा रहा है...') : t('Submit Grievance', 'शिकायत सबमिट करें')}
                        </button>
                    </form>
                ) : (
                    <div className="bg-white border rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-[#4ade80] rounded-xl flex items-center justify-center shadow-sm mb-2">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-[#4ade80]">{t('Grievance Submitted!', 'शिकायत सबमिट की गई!')}</h2>
                        <p className="text-gray-600 font-medium mt-2">{t('Your ticket number is:', 'आपका टिकट नंबर है:')}</p>

                        <div className="bg-blue-50 border border-blue-100 text-blue-900 font-mono font-bold text-2xl py-4 px-10 rounded-lg shadow-sm w-full max-w-md my-4">
                            {submittedId}
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            {t('Please save this ticket number to track your grievance', 'कृपया अपनी शिकायत ट्रैक करने के लिए इस टिकट नंबर को सहेजें')}
                        </p>

                        <button
                            onClick={() => {
                                setIsSubmitted(false);
                                setFormData({ name: '', email: '', phone: '', category: '', description: '' });
                                setSubmittedId('');
                            }}
                            className="mt-4 bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                        >
                            {t('Submit Another', 'एक और सबमिट करें')}
                        </button>
                    </div>
                )
            )}

            {activeTab === 'track' && (
                <div className="space-y-6">
                    <form onSubmit={handleTrackGrievance} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Enter Tracking ID / Ticket ID', 'ट्रैकिंग आईडी / टिकट आईडी दर्ज करें')}</label>
                            <input
                                type="text"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                placeholder="e.g., GRV-123456"
                                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-blue-900 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors h-11 disabled:opacity-50"
                        >
                            {loading ? t('Tracking...', 'ट्रैक किया जा रहा है...') : t('Track Status', 'स्थिति ट्रैक करें')}
                        </button>
                    </form>

                    {ticketDetails && (
                        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="font-bold text-lg text-gray-800">
                                    {t('Grievance Details', 'शिकायत का विवरण')}
                                </h3>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${ticketDetails.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                    ticketDetails.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {t(ticketDetails.status || 'pending', ticketDetails.status || 'लंबित')}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">{t('Tracking ID', 'ट्रैकिंग आईडी')}</p>
                                    <p className="font-semibold font-mono">{ticketDetails.tracking_id || ticketDetails.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">{t('Category', 'श्रेणी')}</p>
                                    <p className="font-semibold uppercase">{ticketDetails.category}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500">{t('Description', 'विवरण')}</p>
                                    <p className="bg-gray-50 p-3 rounded-lg border mt-1 text-gray-700">{ticketDetails.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}