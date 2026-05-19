import type { Metadata } from "next";

interface SEOConfig {
    title: string;
    description: string;
    path?: string;
    ogImage?: string;
}

export function generateSEO(config: SEOConfig): Metadata {
    const {
        title,
        description,
        path = "",
        ogImage = "/og-image.png",
    } = config;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zatcabridge.com";
    const url = `${baseUrl}${path}`;
    const fullTitle = `${title} | ZATCA Bridge`;

    return {
        title: fullTitle,
        description,
        metadataBase: new URL(baseUrl),

        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: "ZATCA Bridge",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: "en_US",
            type: "website",
        },

        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [ogImage],
            creator: "@zatcabridge",
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },

        alternates: {
            canonical: url,
        },
    };
}

// Default SEO for the application
export const defaultSEO: Metadata = {
    title: {
        default: "ZATCA Bridge | Saudi Arabia E-Invoicing Compliance Platform",
        template: "%s | ZATCA Bridge",
    },
    description:
        "Simplify ZATCA compliance with our enterprise-grade e-invoicing platform. Submit, validate, and manage Saudi Arabian tax invoices with ease.",
    keywords: [
        "ZATCA",
        "Saudi Arabia",
        "e-invoicing",
        "tax compliance",
        "Fatoora",
        "electronic invoicing",
        "QR code",
        "CSID",
        "tax authority",
    ],
    authors: [{ name: "JSK Logics Ltd" }],
    creator: "JSK Logics Ltd",
    publisher: "JSK Logics Ltd",
    applicationName: "ZATCA Bridge",

    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png" },
        ],
    },

    manifest: "/site.webmanifest",
};

// Generate JSON-LD structured data
export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ZATCA Bridge",
        description: "Enterprise-grade ZATCA e-invoicing compliance platform for Saudi Arabia",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://zatcabridge.com",
        logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://zatcabridge.com"}/logo.png`,
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "Customer Support",
            email: "support@zatcabridge.com",
        },
    };
}

export function generateWebsiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ZATCA Bridge",
        description: "ZATCA e-invoicing compliance platform",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://zatcabridge.com",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://zatcabridge.com"}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}
