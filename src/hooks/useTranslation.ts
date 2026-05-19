import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export function useTranslation() {
    const { language, toggleLanguage, dir } = useLanguage();

    const t = translations[language];

    return {
        t,
        language,
        toggleLanguage,
        dir,
        isRTL: language === 'ar',
    };
}
