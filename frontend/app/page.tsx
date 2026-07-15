'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { newsAPI, tendersAPI, servicesAPI } from '@/lib/api';
import moment from 'moment';

export default function HomePage() {
  const [news, setNews] = useState<any[]>([]);
  const [tenders, setTenders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('tcil_lang');
    if (saved) setLang(saved);
    const handler = (e: any) => setLang(e.detail);
    window.addEventListener('langChange', handler);
    return () => window.removeEventListener('langChange', handler);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, tendersRes, servicesRes] = await Promise.all([
          newsAPI.getAll({ limit: 5 }),
          tendersAPI.getAll({ limit: 5, status: 'open' }),
          servicesAPI.getAll(),
        ]);
        setNews(newsRes.data.data || []);
        setTenders(tendersRes.data.data || []);
        setServices(servicesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

  const serviceIcons: Record<string, string> = {
    telecom: '📡', it: '💻', healthcare: '🏥',
    solar: '☀️', civil: '🏗️', egovernance: '🏛️',
  };

  return (
    <div>
      {/* Dynamic Banner Feature Removed: Replaced with a clean, static header block */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('Telecommunications Consultants India Limited', 'दूरसंचार सलाहकार भारत लिमिटेड')}
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            {t('A Government of India Enterprise | Serving 80+ Countries Worldwide', 'भारत सरकार का उद्यम | विश्व के 80+ देशों में सेवारत')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/services" className="bg-white text-blue-900 px-8 py-3 rounded font-semibold hover:bg-blue-50">
              {t('Our Services', 'हमारी सेवाएं')}
            </Link>
            <Link href="/tenders" className="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-blue-800">
              {t('View Tenders', 'निविदाएं देखें')}
            </Link>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-blue-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { number: '50+', label: t('Years of Excellence', 'उत्कृष्टता के वर्ष') },
              { number: '80+', label: t('Countries Served', 'देश सेवारत') },
              { number: '1000+', label: t('Projects Completed', 'परियोजनाएं पूर्ण') },
              { number: '5000+', label: t('Employees', 'कर्मचारी') },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-yellow-400">{stat.number}</p>
                <p className="text-sm text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LATEST NEWS */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3">
                {t('Latest News & Events', 'ताजा समाचार और कार्यक्रम')}
              </h2>
              <Link href="/news" className="text-blue-600 hover:underline text-sm">
                {t('View All →', 'सभी देखें →')}
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-400">{t('Loading...', 'लोड हो रहा है...')}</div>
            ) : news.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-white rounded-lg border">
                {t('No news available yet', 'अभी कोई समाचार उपलब्ध नहीं')}
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((article) => (
                  <div key={article.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="bg-blue-900 text-white text-center p-2 rounded min-w-16 h-16 flex flex-col justify-center">
                        <p className="text-lg font-bold leading-none">
                          {moment(article.published_at).format('DD')}
                        </p>
                        <p className="text-xs">{moment(article.published_at).format('MMM YYYY')}</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 hover:text-blue-900">
                          <Link href={`/news/${article.id}`}>
                            {lang === 'hi' && article.title_hi ? article.title_hi : article.title_en}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {lang === 'hi' && article.body_hi
                            ? article.body_hi?.substring(0, 150)
                            : article.body_en?.substring(0, 150)}...
                        </p>
                        <Link href={`/news/${article.id}`} className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                          {t('Read More →', 'और पढ़ें →')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LATEST TENDERS */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3">
                {t('Latest Tenders', 'नवीनतम निविदाएं')}
              </h2>
              <Link href="/tenders" className="text-blue-600 hover:underline text-sm">
                {t('View All →', 'सभी देखें →')}
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-400">{t('Loading...', 'लोड हो रहा है...')}</div>
            ) : tenders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-white rounded-lg border">
                {t('No open tenders', 'कोई खुली निविदा नहीं')}
              </div>
            ) : (
              <div className="space-y-3">
                {tenders.map((tender) => (
                  <div key={tender.id} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                      {tender.ref_number}
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-2 line-clamp-2">
                      {lang === 'hi' && tender.title_hi ? tender.title_hi : tender.title_en}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {t('Deadline', 'अंतिम तिथि')}: {moment(tender.deadline).format('DD MMM YYYY')}
                    </p>
                    <Link href={`/tenders/${tender.id}`} className="text-blue-600 text-xs hover:underline mt-1 inline-block">
                      {t('View Details →', 'विवरण देखें →')}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* OUR SERVICES */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-8">
            {t('Our Services', 'हमारी सेवाएं')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              <div className="col-span-6 text-center py-8 text-gray-400">{t('Loading...', 'लोड हो रहा है...')}</div>
            ) : (
              services.map((service) => (
                <Link key={service.id} href={`/services/${service.slug}`}
                  className="bg-white border rounded-lg p-6 text-center hover:shadow-lg hover:border-blue-500 transition-all group">
                  <div className="text-4xl mb-3">{serviceIcons[service.category] || '🔧'}</div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-900">
                    {lang === 'hi' && service.title_hi ? service.title_hi : service.title_en}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* WHY TCIL */}
        <div className="mt-16 bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-blue-900 text-center mb-8">
            {t('Why Choose TCIL?', 'टीसीआईएल क्यों चुनें?')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🏆',
                title: t('50+ Years Experience', '50+ वर्षों का अनुभव'),
                desc: t('Decades of expertise in delivering world-class telecom and IT solutions', 'विश्व स्तरीय दूरसंचार और आईटी समाधान देने में दशकों की विशेषज्ञता'),
              },
              {
                icon: '🌍',
                title: t('Global Presence', 'वैश्विक उपस्थिति'),
                desc: t('Successfully executed projects in 80+ countries across Asia, Africa, and beyond', 'एशिया, अफ्रीका और उससे आगे 80+ देशों में परियोजनाएं सफलतापूर्वक पूर्ण'),
              },
              {
                icon: '🏛️',
                title: t('Government Backed', 'सरकार समर्थित'),
                desc: t('A trusted Government of India enterprise under Department of Telecommunications', 'दूरसंचार विभाग के अंतर्गत विश्वसनीय भारत सरकार का उद्यम'),
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}