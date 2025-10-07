# ProDigital Doctor - EMR SaaS Frontend

A production-ready Electronic Medical Records (EMR) and Prescription Management system built with Vite, React, Tailwind CSS, and Clerk authentication.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Components Documentation](#components-documentation)
- [Pages Documentation](#pages-documentation)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

## Features

### Core Functionality
- **Patient Management**: Create, view, and manage patient records with ABHA integration
- **Prescription Management**: Create prescriptions with medication search, dosage, and frequency
- **Drug-Drug Interaction (DDI) Checking**: Real-time interaction warnings with severity levels
- **PDF Generation**: Auto-generate prescription PDFs with presigned S3 URLs
- **Appointment Scheduling**: Calendar-based appointment management
- **Medication Database**: Search and browse medications by brand/generic name
- **Multi-Clinic Support**: Manage multiple clinics with clinic selector
- **ABDM Integration**: Share prescriptions via Ayushman Bharat Digital Mission

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG AA baseline with keyboard navigation and ARIA labels
- **Performance Optimized**: React Query for caching, lazy loading, debounced search
- **Type-Safe Forms**: react-hook-form with Zod validation
- **Real-time Validation**: Client-side validation with detailed error messages
- **File Uploads**: Presigned S3 uploads with progress tracking
- **Toast Notifications**: User feedback for all actions

## Tech Stack

- **Framework**: Vite + React 19 (Plain JavaScript)
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: react-hook-form + Zod
- **Routing**: React Router v7
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:5000
```

### Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Key Features

- ✅ Complete EMR system with patient management
- ✅ Prescription creation with DDI checking  
- ✅ Real-time medication search
- ✅ PDF generation and viewing
- ✅ ABDM integration ready
- ✅ Multi-clinic support
- ✅ Responsive and accessible (WCAG AA)
- ✅ Production-ready with testing

## Documentation

See full documentation above for:
- Component API reference
- Page functionality
- Testing guide
- Deployment instructions

---

**Built with Vite + React + Tailwind CSS**
