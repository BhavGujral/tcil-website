'use client';
import { useEffect, useState } from 'react';

export default function AboutPage() {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const saved = localStorage.getItem('tcil_lang');
        if (saved) setLang(saved);
        const handler = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handler);
        return () => window.removeEventListener('langChange', handler);
    }, []);

    const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('About TCIL', 'टीसीआईएल के बारे में')}
                </h1>
                <p className="text-blue-200">
                    {t('Telecommunications Consultants India Limited', 'दूरसंचार सलाहकार भारत लिमिटेड')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">
                            {t('Who We Are', 'हम कौन हैं')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {t(
                                'Telecommunications Consultants India Limited (TCIL) is a premier Government of India Enterprise under the Department of Telecommunications, Ministry of Communications. Established in 1974, TCIL has been providing world-class consultancy and turnkey solutions in the field of telecommunications, information technology, and other infrastructure sectors.',
                                'दूरसंचार सलाहकार भारत लिमिटेड (टीसीआईएल) संचार मंत्रालय के दूरसंचार विभाग के अंतर्गत भारत सरकार का एक प्रमुख उद्यम है। 1974 में स्थापित, टीसीआईएल दूरसंचार, सूचना प्रौद्योगिकी और अन्य बुनियादी ढांचा क्षेत्रों में विश्व स्तरीय परामर्श और टर्नकी समाधान प्रदान कर रहा है।'
                            )}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">
                            {t('Our Mission', 'हमारा मिशन')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {t(
                                'To be a globally competitive organization providing value-added telecom, IT, and infrastructure solutions and services to customers worldwide, contributing to the economic growth and development of nations.',
                                'एक वैश्विक रूप से प्रतिस्पर्धी संगठन बनना जो दुनिया भर के ग्राहकों को मूल्य वर्धित दूरसंचार, आईटी और बुनियादी ढांचा समाधान और सेवाएं प्रदान करे, राष्ट्रों के आर्थिक विकास में योगदान दे।'
                            )}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">
                            {t('Our Vision', 'हमारी दृष्टि')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {t(
                                'To emerge as a world-class organization in providing end-to-end solutions in Telecommunications, IT, Power, and Infrastructure sectors across the globe.',
                                'दुनिया भर में दूरसंचार, आईटी, बिजली और बुनियादी ढांचा क्षेत्रों में एंड-टू-एंड समाधान प्रदान करने में एक विश्व स्तरीय संगठन के रूप में उभरना।'
                            )}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-900 text-white rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">{t('Key Facts', 'मुख्य तथ्य')}</h2>
                        <div className="space-y-4">
                            {[
                                { label: t('Established', 'स्थापित'), value: '1974' },
                                { label: t('Status', 'दर्जा'), value: t('Miniratna Category-I', 'मिनीरत्न श्रेणी-I') },
                                { label: t('Ministry', 'मंत्रालय'), value: t('Dept. of Telecom', 'दूरसंचार विभाग') },
                                { label: t('Countries', 'देश'), value: '80+' },
                                { label: t('Projects', 'परियोजनाएं'), value: '1000+' },
                                { label: t('Employees', 'कर्मचारी'), value: '5000+' },
                            ].map((fact) => (
                                <div key={fact.label} className="flex justify-between border-b border-blue-700 pb-2">
                                    <span className="text-blue-300 text-sm">{fact.label}</span>
                                    <span className="font-bold text-sm">{fact.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">
                            {t('Certifications', 'प्रमाणपत्र')}
                        </h2>
                        <div className="space-y-2 text-sm text-gray-600">
                            {[
                                '✅ ISO 9001:2015 Certified',
                                '✅ CMMI Level 3',
                                '✅ ISO 27001 (Information Security)',
                                '✅ Miniratna Category-I PSU',
                            ].map((cert) => (
                                <p key={cert}>{cert}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}