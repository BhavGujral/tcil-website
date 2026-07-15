import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-blue-900 text-white mt-16">
            {/* MAIN FOOTER */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* ABOUT */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white text-blue-900 w-10 h-10 rounded flex items-center justify-center font-bold">
                                TCIL
                            </div>
                            <div>
                                <p className="font-bold text-sm">Telecommunications Consultants India Limited</p>
                                <p className="text-xs text-blue-300">A Govt. of India Enterprise</p>
                            </div>
                        </div>
                        <p className="text-blue-200 text-sm leading-relaxed mb-4">
                            TCIL is a premier consultancy organization providing services in
                            telecom, IT, healthcare and infrastructure sectors across the globe
                            in over 80 countries.
                        </p>
                        <div className="text-sm text-blue-200">
                            <p className="font-semibold text-white mb-1">Head Office:</p>
                            <p>TCIL Bhawan, Greater Kailash - I</p>
                            <p>New Delhi - 110048, India</p>
                            <p className="mt-1">📞 +91-11-26202020</p>
                            <p>📧 tcil@tcil-india.com</p>
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 border-b border-blue-700 pb-2">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-200">
                            {[
                                { href: '/about', label: 'About TCIL' },
                                { href: '/services', label: 'Our Services' },
                                { href: '/tenders', label: 'Tenders' },
                                { href: '/careers', label: 'Careers' },
                                { href: '/news', label: 'News & Events' },
                                { href: '/gallery', label: 'Photo Gallery' },
                                { href: '/reports', label: 'Annual Reports' },
                                { href: '/contact', label: 'Contact Us' },
                                { href: '/grievance', label: 'Grievance Portal' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-white hover:underline transition-colors"
                                    >
                                        ▶ {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* IMPORTANT LINKS */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 border-b border-blue-700 pb-2">
                            Important Links
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-200">
                            {[
                                { href: 'https://www.india.gov.in', label: 'India.gov.in' },
                                { href: 'https://www.dot.gov.in', label: 'Dept. of Telecom' },
                                { href: 'https://www.tec.gov.in', label: 'TEC' },
                                { href: '/reports?type=rti', label: 'RTI' },
                                { href: '/reports?type=audit', label: 'Audit Reports' },
                                { href: '#', label: 'Privacy Policy' },
                                { href: '#', label: 'Disclaimer' },
                                { href: '#', label: 'Sitemap' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-white hover:underline transition-colors"
                                        target={link.href.startsWith('http') ? '_blank' : '_self'}
                                    >
                                        ▶ {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="bg-blue-950 py-3 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-blue-300">
                    <p>
                        © 2026 Telecommunications Consultants India Limited. All Rights Reserved.
                    </p>
                    <p className="mt-1 md:mt-0">
                        Designed & Developed for TCIL Website Revamp Project
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;