'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'hi';

interface LangContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LangContextType>({
    lang: 'en',
    setLang: () => { },
    t: (en) => en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>('en');

    useEffect(() => {
        const saved = localStorage.getItem('tcil_lang') as Lang;
        if (saved) setLangState(saved);

        const handler = (e: any) => {
            setLangState(e.detail);
        };
        window.addEventListener('langChange', handler);
        return () => window.removeEventListener('langChange', handler);
    }, []);

    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem('tcil_lang', l);
        window.dispatchEvent(new CustomEvent('langChange', { detail: l }));
    };

    const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLang = () => useContext(LanguageContext);