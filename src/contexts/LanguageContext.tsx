"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    // Load language preference on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('preferred-language') as Language;
        if (savedLang === 'en' || savedLang === 'ar') {
            setLanguageState(savedLang);
        }
        setMounted(true);
    }, []);

    // Save language preference when it changes
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('preferred-language', lang);

        // Update document attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    const dir = language === 'ar' ? 'rtl' : 'ltr';

    // Prevent hydration mismatch by rendering children only after mount
    if (!mounted) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
