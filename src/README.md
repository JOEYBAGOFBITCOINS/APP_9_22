# 🚗 FuelTrakr - Napleton Automotive Group

> **Sophisticated fuel expense tracking app with glassmorphic design, biometric auth, and real-time GPS tracking**

![FuelTrakr](https://img.shields.io/badge/FuelTrakr-Production%20Ready-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)

---

## 🎯 **DEPLOYED & READY TO USE!**

### 🌐 **Live App:** https://escape-plan-two.vercel.app/

### 🔑 **Quick Login:**
1. Click **"Quick Access (Porter Mode)"** button on login screen
2. Start tracking fuel immediately! 🚗⛽

**OR** use demo credentials:
- Admin: `admin@napleton.com` / `admin123`
- Porter: `porter@napleton.com` / `porter123`

> 💡 **Having login issues?** See [LOGIN_HELP.md](./LOGIN_HELP.md) or [ANSWER_TO_YOUR_QUESTIONS.md](./ANSWER_TO_YOUR_QUESTIONS.md)

---

## ✨ Features

### 🎨 **Premium UI/UX**
- **Glassmorphic design** with blue-tinted gradients
- **Animated borders** and glass effects
- **Mobile-first optimization** for field use
- **Dark automotive theme** throughout

### 🔐 **Authentication & Security**
- **Role-based access control** (Admin/Porter)
- **Email domain restrictions** (@napleton.com only - ready to enable)
- **Auto-login demo mode** for testing

### ⛽ **Simplified Fuel Tracking**
- **Stock number entry** (primary method)
- **VIN photo capture** (backup option)  
- **Receipt photo required** for verification
- **Key data points**: Mileage, Gallons, Total Cost
- **No location tracking** - respects employee privacy

### 👥 **Admin Features**
- **View all entries** from all porters
- **CSV export** for accounting
- **Photo viewing** (receipts and VINs)
- **Real-time dashboard**

### 📱 **Mobile Optimized**
- **Quick field entry** with minimal taps
- **Numeric keypad defaults**
- **Camera integration** for photos
- **Works offline**

## 🚀 Quick Start

### **Demo Mode (No Setup Required)**
```bash
npm install
npm run dev
```
**No login required!** Auto-logs in as "John Porter" for immediate testing.

### **Production Setup**
1. **Configure Supabase** (optional - demo works without it)
2. **Deploy Edge Functions** for full backend
3. **Enable email domain restrictions**
4. **Set up user roles** and permissions

## 🚀 Deployment

### **Deploy to Vercel (3 Minutes)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy!
vercel --prod
```

**📋 See `/DEPLOY_NOW.md` for step-by-step guide**

**📖 See `/VERCEL_DEPLOYMENT_GUIDE.md` for complete documentation**

Your app will be live at: `https://fueltrakr-[random].vercel.app` ✨

### **What You Get:**
- ✅ HTTPS enabled (camera/GPS work!)
- ✅ Global CDN (fast worldwide)
- ✅ Auto-scaling (handles any traffic)
- ✅ Analytics dashboard
- ✅ Continuous deployment

### **After First Deploy:**
Add environment variables in Vercel Dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_DEMO_MODE=false` (production)

Then **Redeploy** to apply changes.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS 4.0
- **Backend**: Supabase Edge Functions + PostgreSQL
- **Storage**: Supabase Storage for photos + KV Store
- **Auth**: Supabase Auth with custom user profiles
- **Styling**: Glassmorphic components with custom animations

## 🔧 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18.2, TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.0, Custom Glassmorphic |
| **Backend** | Supabase Edge Functions (Hono) |
| **Database** | PostgreSQL + KV Store |
| **Storage** | Supabase Storage (Photos) |
| **Auth** | Supabase Auth + Custom Profiles |
| **Build** | Vite 4.4 |
| **Deployment** | Vercel / Netlify |

## 📁 Project Structure

```
├── App.tsx                 # Main application component
├── components/            
│   ├── AdminPanel.tsx     # Admin dashboard
│   ├── FuelEntryForm.tsx  # Fuel entry interface
│   ├── MainApp.tsx        # Primary app interface
│   └── ui/                # Shadcn/ui components
├── services/              
│   ├── authService.ts     # Authentication logic
│   ├── fuelService.ts     # Fuel entry management
│   └── adminService.ts    # Admin functionality
├── supabase/functions/    
│   └── make-server-218dc5b7/  # Edge function backend
└── utils/supabase/        # Supabase configuration
```

## 🎯 Key Features Demo

1. **No-Login Demo** - Automatic porter login
2. **Fuel Entry** - Stock number or VIN photo workflow  
3. **Photo Capture** - Receipt and VIN documentation
4. **GPS Tracking** - Location-based fuel purchases
5. **Admin Panel** - User management and data export
6. **Statistics** - Real-time tracking and reporting

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Porter** | `porter@napleton.com` | `porter123` |
| **Admin** | `admin@napleton.com` | `admin123` |

## 📄 License

© 2024 Napleton Automotive Group. All rights reserved.

---

**Built for Napleton Automotive Group** with ❤️ by the FuelTrakr team