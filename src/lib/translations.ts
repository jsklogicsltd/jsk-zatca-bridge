export type Language = 'en' | 'ar';

export interface Translations {
    navbar: {
        logo: string;
        home: string;
        features: string;
        documentation: string;
        pricing: string;
        signIn: string;
        getStarted: string;
    };
    hero: {
        badge: string;
        headline: string;
        headlineHighlight: string;
        subheading: string;
        subheadingHighlight: string;
        ctaPrimary: string;
        ctaSecondary: string;
        dashboardPreview: string;
    };
    problem: {
        heading: string;
        subheading: string;
        cards: {
            legacy: {
                title: string;
                description: string;
            };
            regulations: {
                title: string;
                description: string;
            };
            expensive: {
                title: string;
                description: string;
            };
        };
    };
    solution: {
        heading: string;
        subheading: string;
        steps: {
            send: {
                title: string;
                description: string;
            };
            transform: {
                title: string;
                description: string;
            };
            sign: {
                title: string;
                description: string;
            };
            receive: {
                title: string;
                description: string;
            };
        };
    };
    features: {
        heading: string;
        subheading: string;
        learnMore: string;
        cards: {
            realtime: {
                title: string;
                description: string;
            };
            crypto: {
                title: string;
                description: string;
            };
            renewal: {
                title: string;
                description: string;
            };
            sandbox: {
                title: string;
                description: string;
            };
            analytics: {
                title: string;
                description: string;
            };
            api: {
                title: string;
                description: string;
            };
        };
    };
    cta: {
        heading: string;
        socialProof: string;
        socialProofHighlight: string;
        button: string;
        reassurance1: string;
        reassurance2: string;
    };
    footer: {
        tagline: string;
        product: {
            title: string;
            features: string;
            pricing: string;
            documentation: string;
        };
        company: {
            title: string;
            about: string;
            contact: string;
            blog: string;
        };
        legal: {
            title: string;
            privacy: string;
            terms: string;
        };
        copyright: string;
        madeWith: string;
    };
}

export const translations: Record<Language, Translations> = {
    en: {
        navbar: {
            logo: 'JSK Logics',
            home: 'Home',
            features: 'Features',
            documentation: 'Documentation',
            pricing: 'Pricing',
            signIn: 'Sign In',
            getStarted: 'Get Started',
        },
        hero: {
            badge: 'Enterprise Tax Compliance',
            headline: 'ZATCA Phase 2 Compliance',
            headlineHighlight: 'Made Simple',
            subheading: 'Connect your legacy ERP to Saudi tax authorities in',
            subheadingHighlight: 'minutes, not months',
            ctaPrimary: 'Start Free Trial',
            ctaSecondary: 'Watch Demo',
            dashboardPreview: 'Dashboard Preview',
        },
        problem: {
            heading: 'The Challenge Saudi Businesses Face',
            subheading: "ZATCA compliance isn't just a checkbox—it's a technical challenge",
            cards: {
                legacy: {
                    title: 'Legacy Systems',
                    description: "Outdated ERPs can't generate compliant UBL 2.1 XML invoices for ZATCA.",
                },
                regulations: {
                    title: 'Complex Regulations',
                    description: 'Saudi e-invoicing Phase 2 requires cryptographic signing and PIH tracking.',
                },
                expensive: {
                    title: 'Expensive Upgrades',
                    description: 'Full ERP replacements cost millions and take months to implement.',
                },
            },
        },
        solution: {
            heading: 'How ZATCA Bridge Works',
            subheading: 'Four simple steps to full compliance',
            steps: {
                send: {
                    title: 'Send Simple JSON',
                    description: 'Your system sends invoice data in standard JSON format via REST API.',
                },
                transform: {
                    title: 'Transform to UBL XML',
                    description: 'Our engine converts it to ZATCA-compliant UBL 2.1 XML with all required fields.',
                },
                sign: {
                    title: 'Sign & Submit',
                    description: 'Cryptographically sign with your certificate and submit to ZATCA in real-time.',
                },
                receive: {
                    title: 'Receive Clearance',
                    description: 'Get instant clearance response with QR code and compliance confirmation.',
                },
            },
        },
        features: {
            heading: 'Everything You Need for Compliance',
            subheading: 'Enterprise-grade features built for reliability and scale',
            learnMore: 'Learn more',
            cards: {
                realtime: {
                    title: 'Real-time Integration',
                    description: 'Instant invoice submission with sub-second response times from ZATCA servers.',
                },
                crypto: {
                    title: 'Cryptographic Signing',
                    description: 'Secure certificate management with HSM support and automatic key rotation.',
                },
                renewal: {
                    title: 'Auto-renewal',
                    description: 'Certificate auto-renewal 30 days before expiry with zero downtime migration.',
                },
                sandbox: {
                    title: 'Sandbox Testing',
                    description: 'Full ZATCA sandbox environment for testing before production deployment.',
                },
                analytics: {
                    title: 'Dashboard Analytics',
                    description: 'Real-time compliance monitoring with detailed reports and audit trails.',
                },
                api: {
                    title: 'API-First',
                    description: 'RESTful API with comprehensive documentation and language-specific SDKs.',
                },
            },
        },
        cta: {
            heading: 'Ready to Achieve Compliance?',
            socialProof: 'Join',
            socialProofHighlight: '500+ Saudi businesses',
            button: 'Start Your Free Trial',
            reassurance1: 'No credit card required',
            reassurance2: 'Setup in 10 minutes',
        },
        footer: {
            tagline: 'ZATCA compliance middleware for Saudi Arabian businesses.',
            product: {
                title: 'Product',
                features: 'Features',
                pricing: 'Pricing',
                documentation: 'Documentation',
            },
            company: {
                title: 'Company',
                about: 'About Us',
                contact: 'Contact',
                blog: 'Blog',
            },
            legal: {
                title: 'Legal',
                privacy: 'Privacy Policy',
                terms: 'Terms of Service',
            },
            copyright: 'JSK Logics. All rights reserved.',
            madeWith: 'Made with precision for Saudi businesses',
        },
    },
    ar: {
        navbar: {
            logo: 'جي إس كيه لوجيكس',
            home: 'الرئيسية',
            features: 'المميزات',
            documentation: 'التوثيق',
            pricing: 'الأسعار',
            signIn: 'تسجيل الدخول',
            getStarted: 'ابدأ الآن',
        },
        hero: {
            badge: 'الامتثال الضريبي للمؤسسات',
            headline: 'الامتثال للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك',
            headlineHighlight: 'أصبح سهلاً',
            subheading: 'اربط نظام تخطيط موارد المؤسسات القديم الخاص بك مع هيئة الزكاة والضريبة والجمارك في',
            subheadingHighlight: 'دقائق، وليس أشهر',
            ctaPrimary: 'ابدأ النسخة التجريبية المجانية',
            ctaSecondary: 'شاهد العرض التوضيحي',
            dashboardPreview: 'معاينة لوحة التحكم',
        },
        problem: {
            heading: 'التحديات التي تواجه الشركات السعودية',
            subheading: 'الامتثال لهيئة الزكاة والضريبة والجمارك ليس مجرد خانة اختيار—إنه تحدٍ تقني',
            cards: {
                legacy: {
                    title: 'الأنظمة القديمة',
                    description: 'أنظمة تخطيط الموارد القديمة لا يمكنها إنشاء فواتير XML متوافقة مع معيار UBL 2.1 لهيئة الزكاة والضريبة والجمارك.',
                },
                regulations: {
                    title: 'اللوائح المعقدة',
                    description: 'المرحلة الثانية من الفوترة الإلكترونية السعودية تتطلب التوقيع التشفيري وتتبع PIH.',
                },
                expensive: {
                    title: 'الترقيات المكلفة',
                    description: 'استبدال أنظمة تخطيط الموارد بالكامل يكلف ملايين الريالات ويستغرق أشهراً للتنفيذ.',
                },
            },
        },
        solution: {
            heading: 'كيف يعمل جسر الزكاة والضريبة والجمارك',
            subheading: 'أربع خطوات بسيطة للامتثال الكامل',
            steps: {
                send: {
                    title: 'إرسال JSON بسيط',
                    description: 'يرسل نظامك بيانات الفاتورة بتنسيق JSON القياسي عبر واجهة برمجة التطبيقات REST.',
                },
                transform: {
                    title: 'التحويل إلى UBL XML',
                    description: 'يقوم محركنا بتحويلها إلى XML متوافق مع معيار UBL 2.1 لهيئة الزكاة والضريبة والجمارك مع جميع الحقول المطلوبة.',
                },
                sign: {
                    title: 'التوقيع والإرسال',
                    description: 'التوقيع التشفيري باستخدام شهادتك وإرسالها إلى هيئة الزكاة والضريبة والجمارك في الوقت الفعلي.',
                },
                receive: {
                    title: 'استلام التصريح',
                    description: 'احصل على استجابة فورية مع رمز QR وتأكيد الامتثال.',
                },
            },
        },
        features: {
            heading: 'كل ما تحتاجه للامتثال',
            subheading: 'ميزات على مستوى المؤسسات مصممة للموثوقية والتوسع',
            learnMore: 'اعرف المزيد',
            cards: {
                realtime: {
                    title: 'التكامل الفوري',
                    description: 'إرسال الفواتير الفوري مع أوقات استجابة أقل من ثانية من خوادم هيئة الزكاة والضريبة والجمارك.',
                },
                crypto: {
                    title: 'التوقيع التشفيري',
                    description: 'إدارة الشهادات الآمنة مع دعم وحدة الأمان الأجهزة والتناوب التلقائي للمفاتيح.',
                },
                renewal: {
                    title: 'التجديد التلقائي',
                    description: 'تجديد الشهادة تلقائياً قبل 30 يوماً من انتهاء صلاحيتها مع الانتقال بدون توقف.',
                },
                sandbox: {
                    title: 'بيئة الاختبار',
                    description: 'بيئة اختبار كاملة من هيئة الزكاة والضريبة والجمارك للاختبار قبل النشر الإنتاجي.',
                },
                analytics: {
                    title: 'تحليلات لوحة التحكم',
                    description: 'مراقبة الامتثال في الوقت الفعلي مع تقارير مفصلة ومسارات التدقيق.',
                },
                api: {
                    title: 'API أولاً',
                    description: 'واجهة برمجة التطبيقات RESTful مع توثيق شامل ومكتبات برمجية خاصة باللغة.',
                },
            },
        },
        cta: {
            heading: 'هل أنت مستعد لتحقيق الامتثال؟',
            socialProof: 'انضم إلى',
            socialProofHighlight: '500+ شركة سعودية',
            button: 'ابدأ نسختك التجريبية المجانية',
            reassurance1: 'لا حاجة لبطاقة ائتمان',
            reassurance2: 'الإعداد في 10 دقائق',
        },
        footer: {
            tagline: 'منصة الامتثال لهيئة الزكاة والضريبة والجمارك للشركات السعودية.',
            product: {
                title: 'المنتج',
                features: 'المميزات',
                pricing: 'الأسعار',
                documentation: 'التوثيق',
            },
            company: {
                title: 'الشركة',
                about: 'من نحن',
                contact: 'اتصل بنا',
                blog: 'المدونة',
            },
            legal: {
                title: 'قانوني',
                privacy: 'سياسة الخصوصية',
                terms: 'شروط الخدمة',
            },
            copyright: 'جي إس كيه لوجيكس. جميع الحقوق محفوظة.',
            madeWith: 'صُنع بدقة للشركات السعودية',
        },
    },
};
