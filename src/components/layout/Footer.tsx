"use client";

import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useTranslation();

    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">{t.navbar.logo}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {t.footer.tagline}
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                            {t.footer.product.title}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#features" className="hover:text-amber-500 transition-colors">
                                    {t.footer.product.features}
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="hover:text-amber-500 transition-colors">
                                    {t.footer.product.pricing}
                                </a>
                            </li>
                            <li>
                                <a href="#docs" className="hover:text-amber-500 transition-colors">
                                    {t.footer.product.documentation}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                            {t.footer.company.title}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#about" className="hover:text-amber-500 transition-colors">
                                    {t.footer.company.about}
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="hover:text-amber-500 transition-colors">
                                    {t.footer.company.contact}
                                </a>
                            </li>
                            <li>
                                <a href="#blog" className="hover:text-amber-500 transition-colors">
                                    {t.footer.company.blog}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                            {t.footer.legal.title}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#privacy" className="hover:text-amber-500 transition-colors">
                                    {t.footer.legal.privacy}
                                </a>
                            </li>
                            <li>
                                <a href="#terms" className="hover:text-amber-500 transition-colors">
                                    {t.footer.legal.terms}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8 bg-slate-700" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                    <p>© {currentYear} {t.footer.copyright}</p>
                    <p>{t.footer.madeWith}</p>
                </div>
            </div>
        </footer>
    );
}
