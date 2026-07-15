'use client';
import { useState, useEffect } from 'react';

export default function ContactPage() {
    const [lang, setLang] = useState('en');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('tcil_lang');
        if (saved) setLang(saved);
        const handler = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handler);
        return () => window.removeEventListener('langChange', handler);
    }, []);

    const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            setError(t('Please fill in all required fields including Subject.', 'कृपया विषय सहित सभी आवश्यक फ़ील्ड भरें।'));
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setSuccess(t('Message sent successfully! We will get back to you soon.', 'संदेश सफलतापूर्वक भेजा गया! हम जल्द ही आपसे संपर्क करेंगे।'));
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="space-y-6">
                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">{t('Head Office', 'प्रधान कार्यालय')}</h3>
                        <div className="space-y-4 text-gray-600 text-sm">
                            <p className="flex items-start gap-3">
                                <span className="mt-1">📍</span>
                                <span>TCIL Bhawan, Greater Kailash - I, New Delhi - 110048, India</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span>📞</span>
                                <span>+91-11-26202020</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span>📠</span>
                                <span>+91-11-26202080</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span>✉️</span>
                                <span>tcil@tcil-india.com</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span>🌐</span>
                                <span>www.tcil.net.in</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">{t('Office Hours', 'कार्यालय समय')}</h3>
                        <div className="space-y-2 text-gray-600 text-sm">
                            <p>{t('Monday - Friday: 9:00 AM - 5:30 PM', 'सोमवार - शुक्रवार: सुबह 9:00 - शाम 5:30')}</p>
                            <p>{t('Saturday: 9:00 AM - 1:00 PM', 'शनिवार: सुबह 9:00 - दोपहर 1:00')}</p>
                            <p>{t('Sunday: Closed', 'रविवार: बंद')}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('Send us a Message', 'हमें संदेश भेजें')}</h2>

                    {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm">{error}</div>}
                    {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 font-medium text-sm">{success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    placeholder={t('Enter phone number', 'फ़ोन नंबर दर्ज करें')}
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Subject *', 'विषय *')}</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder={t('Enter subject', 'विषय दर्ज करें')}
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Message *', 'संदेश *')}</label>
                            <textarea
                                name="message"
                                rows={6}
                                value={formData.message}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-colors mt-4 disabled:opacity-50"
                        >
                            {loading ? t('Sending...', 'भेजा जा रहा है...') : t('Send Message', 'संदेश भेजें')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}