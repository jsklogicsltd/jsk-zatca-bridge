// Onboarding state management and mock data

export interface OnboardingState {
    currentStep: number;
    completed: boolean;
    company: {
        legalName: string;
        registrationNumber: string;
        vatNumber: string;
        category: string;
        monthlyInvoices: string;
        address: {
            building: string;
            street: string;
            district: string;
            city: string;
            postalCode: string;
        };
    };
    zatca: {
        environment: "sandbox" | "production";
        otpVerified: boolean;
        csidGenerated: boolean;
    };
    preferences: {
        invoicePrefix: string;
        startingNumber: number;
        vatRate: number;
        paymentTerms: string;
        notifications: {
            customerCopy: boolean;
            clearanceConfirmations: boolean;
            failedSubmissions: boolean;
            csidExpiry: boolean;
        };
    };
    integration: {
        method: "api" | "manual" | "excel" | null;
        apiKey?: string;
    };
    testInvoiceCompleted: boolean;
}

export const initialOnboardingState: OnboardingState = {
    currentStep: 0,
    completed: false,
    company: {
        legalName: "",
        registrationNumber: "",
        vatNumber: "",
        category: "",
        monthlyInvoices: "",
        address: {
            building: "",
            street: "",
            district: "",
            city: "",
            postalCode: "",
        },
    },
    zatca: {
        environment: "sandbox",
        otpVerified: false,
        csidGenerated: false,
    },
    preferences: {
        invoicePrefix: "INV",
        startingNumber: 1,
        vatRate: 15,
        paymentTerms: "Net 30",
        notifications: {
            customerCopy: true,
            clearanceConfirmations: true,
            failedSubmissions: true,
            csidExpiry: true,
        },
    },
    integration: {
        method: null,
    },
    testInvoiceCompleted: false,
};

export const saudiCities = [
    "Riyadh",
    "Jeddah",
    "Mecca",
    "Medina",
    "Dammam",
    "Khobar",
    "Tabuk",
    "Abha",
    "Khamis Mushait",
    "Al Ahsa",
];

export const businessCategories = [
    { value: "retail", label: "Retail" },
    { value: "wholesale", label: "Wholesale" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "services", label: "Services" },
    { value: "other", label: "Other" },
];

export const monthlyInvoiceRanges = [
    { value: "0-50", label: "0-50 invoices" },
    { value: "51-200", label: "51-200 invoices" },
    { value: "201-500", label: "201-500 invoices" },
    { value: "500+", label: "500+ invoices" },
];
