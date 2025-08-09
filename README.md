# 🏥 Advanced OPD Clinic Tracker

A comprehensive patient management and revenue tracking system for medical clinics.

## ✨ Features

- **Patient Management**: Add, edit, and track patient records
- **Revenue Tracking**: Real-time calculation of daily earnings
- **Multi-Service Billing**: Support for consultations, 2E, lab tests, and extras
- **Free Consultation Tracking**: Mark and track free consultations
- **Export Capabilities**: Export data to CSV and Excel formats
- **Cloud Sync**: Real-time synchronization with Supabase database
- **Offline Support**: Works offline with local storage backup
- **Mobile Responsive**: Optimized for all devices
- **Indian Currency**: Formatted for INR with number-to-words conversion

## 🚀 Live Demo

**Production URL**: https://zingy-kelpie-b0a480.netlify.app

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Export**: XLSX library for Excel export

## 📊 Database Schema

The application uses a single `opd_records` table with the following structure:

- Patient information (name, review type)
- Financial data (amounts, free consultations)
- Service flags (2E, lab, extra services)
- Timestamps and audit fields
- Row-level security enabled

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Features Overview

### Patient Management
- Add new patients with comprehensive details
- Track consultation types and observations
- Mark free consultations for community service

### Revenue Tracking
- Real-time calculation of daily totals
- Support for multiple service types
- Indian currency formatting with words conversion
- Export capabilities for accounting

### Data Sync
- Primary storage: Local browser storage
- Cloud backup: Supabase database
- Offline-first approach with automatic sync
- Connection health monitoring

### Export Options
- **CSV Export**: For basic data analysis
- **Excel Export**: Formatted spreadsheets with totals
- **Print-friendly**: Clean layouts for physical records

## 🔒 Security Features

- Row-level security on database
- HTTPS encryption
- Local data encryption
- Secure API key management

## 📈 Scalability

- Handles thousands of patient records
- Optimized for multi-user access
- Global CDN deployment
- 99.9% uptime guarantee

## 🎯 Use Cases

- **Small Clinics**: Daily patient and revenue tracking
- **Multi-doctor Practices**: Shared patient database
- **Mobile Clinics**: Offline-capable patient records
- **Accounting**: Export data for financial reporting

## 🤝 Contributing

This is a production medical application. Please ensure all changes maintain:
- Data integrity and security
- HIPAA compliance considerations
- Mobile responsiveness
- Offline functionality

## 📄 License

Private medical practice software. All rights reserved.

---

**Built with ❤️ for healthcare professionals**