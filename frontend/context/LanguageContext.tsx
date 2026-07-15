"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
    language: 'en' | 'hi';
    setLanguage: (lang: 'en' | 'hi') => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('tcil_lang') as 'en' | 'hi';
        if (savedLang) setLanguage(savedLang);
    }, []);

    const handleSetLanguage = (lang: 'en' | 'hi') => {
        setLanguage(lang);
        localStorage.setItem('tcil_lang', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        return { language: 'en', setLanguage: () => { } };
    }
    return context;
};