# FuelTrakr

A comprehensive fuel expense tracking application for Napleton Automotive Group's fleet management. Built with React, TypeScript, Vite, and Supabase.

Original design: https://www.figma.com/design/NRIukBWwVyqCNbudOkIbSc/FuelTrakr

## 🚀 Features

- **Vehicle Identification**: Scan VINs or enter stock numbers with automatic vehicle data lookup via NHTSA API
- **Receipt Capture**: Camera integration for capturing fuel receipts and VIN photos
- **User Management**: Two-tier access control (Admin/Porter roles)
- **Real-time Data**: Supabase backend with instant data synchronization
- **Analytics Dashboard**: View fuel consumption statistics and trends
- **Mobile-First Design**: Responsive glassmorphic UI optimized for mobile devices
- **Demo Mode**: Built-in demonstration mode for testing without backend

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Modern web browser with camera access (for receipt capture)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd APP_9_22
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory (see `.env.example`):

   ```bash
   # Application Mode
   VITE_DEMO_MODE=false

   # Authentication Settings
   VITE_SKIP_AUTH=false
   VITE_AUTO_LOGIN=false
   VITE_DEFAULT_USER_ROLE=porter

   # Debug Settings
   VITE_DEBUG_MODE=false
   VITE_CONSOLE_LOGGING=false

   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Edge Functions
  - Real-time subscriptions

### Services
- **NHTSA API** - Vehicle identification via VIN decoding

## 📁 Project Structure

```
APP_9_22/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── figma/          # Design system components
│   │   ├── LoginScreen.tsx
│   │   ├── MainApp.tsx
│   │   ├── FuelEntryForm.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── Statistics.tsx
│   │   └── ...
│   ├── services/           # API and business logic
│   │   ├── authService.ts
│   │   ├── fuelService.ts
│   │   ├── vinService.ts
│   │   └── adminService.ts
│   ├── utils/              # Utility functions
│   │   └── supabase/       # Supabase configuration
│   ├── App.tsx             # Root component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment template
└── package.json            # Dependencies
```

## 🔐 Authentication

The app supports two user roles:

### Porter Role
- Submit fuel entries
- View own entries and statistics
- Capture receipts and VIN photos

### Admin Role
- All porter capabilities
- View all user entries
- Manage users
- Export data
- Access admin dashboard

### Demo Mode

For testing, enable demo mode in your `.env`:
```bash
VITE_DEMO_MODE=true
VITE_SKIP_AUTH=true
```

Demo credentials will be available on the login screen:
- **Porter**: `porter@napleton.com` / `porter123`
- **Admin**: `admin@napleton.com` / `admin123`

## 🎯 Key Improvements (Latest Update)

### Critical Bug Fixes
1. **Configuration System** - Fixed hardcoded values that prevented demo mode from working
2. **Navigation Bug** - Fixed MainApp component that rendered blank screen after form submission
3. **Data Loading** - Implemented automatic fuel entry loading after login
4. **Error Handling** - Replaced silent failures with user-visible error messages

### Security Enhancements
1. **Environment Variables** - Moved Supabase credentials from code to `.env`
2. **Credential Protection** - Removed hardcoded demo credentials from source code
3. **Demo Mode Gating** - Quick access button only shown when demo mode is enabled

### Performance & Reliability
1. **VIN Service Caching** - Added TTL-based cache with 24hr expiration for valid data
2. **API Timeouts** - Implemented 10-second timeout for NHTSA API calls
3. **Form Submission** - Added double-submission prevention and loading states
4. **Error Boundaries** - Improved error handling throughout the application

### User Experience
1. **Navigation Tabs** - Added Dashboard and All Entries tabs in main view
2. **Floating Action Button** - Quick access to add new fuel entries
3. **Loading States** - Clear visual feedback during async operations
4. **Better Error Messages** - Specific, actionable error messages for users

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with demo mode enabled
- [ ] Submit a fuel entry with VIN
- [ ] Submit a fuel entry with stock number
- [ ] Capture receipt photo
- [ ] View statistics dashboard
- [ ] Navigate between Dashboard and All Entries tabs
- [ ] Admin: View all users' entries
- [ ] Admin: Export data
- [ ] Logout functionality

### Demo Mode Testing

1. Set `VITE_DEMO_MODE=true` in `.env`
2. Restart dev server
3. Click "Quick Access" button on login
4. Test all features with mock data

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Environment Setup

Ensure production environment variables are set:
- Use secure Supabase anon keys
- Set `VITE_DEMO_MODE=false`
- Set `VITE_DEBUG_MODE=false`
- Configure proper HTTPS for camera access

### Deployment Platforms

The app can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 📝 Configuration Reference

### Application Modes

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEMO_MODE` | `false` | Enable demo mode with mock data |
| `VITE_SKIP_AUTH` | `false` | Skip authentication (dev only) |
| `VITE_AUTO_LOGIN` | `false` | Auto-login on startup (dev only) |
| `VITE_DEFAULT_USER_ROLE` | `porter` | Default role for auto-login |
| `VITE_DEBUG_MODE` | `false` | Enable debug logging |

### Supabase Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `VITE_SUPABASE_PROJECT_ID` | Yes | Your Supabase project ID |

## 🐛 Troubleshooting

### Camera not working
- Ensure you're using HTTPS (or localhost for development)
- Check browser camera permissions
- Verify camera is not being used by another application

### Demo mode not working
- Verify `VITE_DEMO_MODE=true` in `.env`
- Restart the development server after changing `.env`
- Clear browser cache and reload

### Can't see fuel entries after login
- Check browser console for API errors
- Verify Supabase credentials are correct
- Ensure user has permission to access fuel entries table

### Build fails
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist .vite`
- Check Node.js version: `node --version` (should be 18+)

## 📄 License

Proprietary - Napleton Automotive Group

## 🤝 Contributing

This is a private application for Napleton Automotive Group. Contact the development team for contribution guidelines.

## 📧 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for Napleton Automotive Group**
