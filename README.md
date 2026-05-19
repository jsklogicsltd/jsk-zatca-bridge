# ZATCA Bridge

**Enterprise-grade ZATCA e-invoicing compliance platform for Saudi Arabia**

ZATCA Bridge simplifies tax compliance by providing a modern, intuitive platform for submitting, validating, and managing electronic invoices in accordance with Saudi Arabian tax authority (ZATCA) requirements.

---

## 🚀 Features

- **✅ ZATCA Compliance**: Full compliance with Saudi Arabia's e-invoicing (Fatoora) regulations
- **📊 Dashboard**: Real-time overview of invoice status, compliance metrics, and system health
- **🔐 Secure Authentication**: Enterprise-grade security with session management
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **♿ Accessible**: WCAG AA compliant with keyboard navigation and screen reader support
- **🎨 Modern Design**: Premium UI with smooth animations and contemporary aesthetics
- **🔍 Advanced Search**: Quick invoice and customer lookup
- **📈 Analytics**: Detailed reporting and compliance tracking
- **🧪 Validation**: Real-time XML validation and error detection

---

## 🛠 Technology Stack

**Frontend Framework**:
- [Next.js 14+](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

**UI Components**:
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable component library
- [Lucide React](https://lucide.dev/) - Icon library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

**Form Handling**:
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Zod](https://zod.dev/) - Schema validation

---

## 📋 Prerequisites

- **Node.js**: v18.17 or higher
- **npm**: v9 or higher (or yarn/pnpm)
- **Git**: For version control

---

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/jsk-logics-zatca-bridge.git
cd jsk-logics-zatca-bridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration. See `.env.local.example` for all available variables.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard and main app
│   ├── onboarding/        # User onboarding flow
│   ├── error.tsx          # Global error boundary
│   └── not-found.tsx      # 404 page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   └── utils.ts         # General utilities
└── styles/              # Global styles
```

---

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## ♿ Accessibility

ZATCA Bridge meets WCAG 2.1 AA standards:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast compliance
- ✅ Focus indicators

---

## 📄 License

Copyright © 2026 JSK Logics Ltd. All rights reserved.

---

## 🤝 Support

- **Email**: support@zatcabridge.com
- **Documentation**: [docs.zatcabridge.com](https://docs.zatcabridge.com)

---

**Built with ❤️ by JSK Logics Ltd**
