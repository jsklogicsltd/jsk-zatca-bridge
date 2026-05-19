import { z } from "zod";

// Reusable validators
export const emailValidator = z.string().email("Invalid email address");

export const passwordValidator = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number");

export const vatNumberValidator = z.string()
    .regex(/^\d{15}$/, "VAT number must be exactly 15 digits");

// Sign In Schema
export const signInSchema = z.object({
    email: emailValidator,
    password: z.string().min(8, "Password must be at least 8 characters"),
    rememberMe: z.boolean().optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Sign Up Schema
export const signUpSchema = z.object({
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string(),
    vatNumber: vatNumberValidator,
    acceptTerms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions",
    }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: emailValidator,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Password strength calculation helper
export function calculatePasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
} {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 33, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score: 66, label: "Medium", color: "bg-yellow-500" };
    return { score: 100, label: "Strong", color: "bg-green-500" };
}
