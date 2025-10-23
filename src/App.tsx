import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from 'sonner@2.0.3';
import { authService, User } from './services/authService';
import { fuelService, FuelEntry as BackendFuelEntry } from './services/fuelService';
import { toast } from 'sonner@2.0.3';
// Use safe demo configuration that works even when environment variables fail
import { isDemoMode, skipAuth, autoLogin, defaultUserRole, debugMode } from './utils/supabase/safe-demo-config';
// Suppress expected camera permission errors
import { enableCameraErrorSuppression } from './utils/suppress-camera-errors';

// Frontend FuelEntry interface for compatibility with existing components
export interface FuelEntry {
  id: string;
  userId: string;
  userName: string;
  stockNumber?: string;
  vin?: string;
  mileage: number;
  fuelAmount: number;
  fuelCost: number;
  timestamp: Date;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  receiptPhoto?: string; // Made optional for testing
  vinPhoto?: string;
  submittedAt: Date;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'login' | 'main' | 'admin'>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [showFuelEntryForm, setShowFuelEntryForm] = useState(false);

  // Initialize app and check for existing session
  useEffect(() => {
    // Enable camera error suppression to hide expected permission denial messages
    enableCameraErrorSuppression();
    
    console.log('🚀 App initializing...');
    console.log('🎭 Demo Mode:', isDemoMode);
    console.log('🔓 Skip Auth:', skipAuth);
    console.log('🤖 Auto Login:', autoLogin);
    console.log('👤 Default Role:', defaultUserRole);
    
    const initializeApp = async () => {
      // Check if we should skip authentication (development mode)
      if (skipAuth && autoLogin) {
        console.log('⚡ Auto-login enabled, logging in automatically...');
        setTimeout(() => {
          // Set up a mock user based on environment configuration
          const mockUser: User = {
            id: `dev-${defaultUserRole}-user`,
            email: `${defaultUserRole}@napleton.com`,
            name: `Development ${defaultUserRole.charAt(0).toUpperCase() + defaultUserRole.slice(1)} User`,
            role: defaultUserRole as 'admin' | 'porter'
          };
          
          setCurrentUser(mockUser);
          setAccessToken(`dev-token-${defaultUserRole}`);
          setIsGuestMode(false);
          setCurrentScreen('main');
          setShowFuelEntryForm(true); // Start with fuel entry form
          setIsLoading(false);
          
          toast.success(`🚀 Development mode - Welcome ${mockUser.name}!`);
        }, 10500); // Wait for full 10-second splash animation to complete
        return;
      }
      
      console.log('🔑 Showing login screen...');
      // Demo mode or production - show login screen after splash
      setTimeout(() => {
        setCurrentScreen('login');
        setIsLoading(false);
      }, 10500); // Wait for full 10-second splash animation to complete
    };

    // Use async initialization
    initializeApp();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('🚪 APP.TSX - handleLogin() called');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password ? '***' + password.slice(-3) : 'EMPTY');
    
    try {
      console.log('⏳ Calling authService.signIn()...');
      const result = await authService.signIn(email, password);
      
      console.log('📦 Login result:', result);
      
      if ('user' in result) {
        console.log('✅ User found in result, setting state...');
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setIsGuestMode(false);
        setCurrentScreen('main');
        setShowFuelEntryForm(true); // Start directly on fuel entry form
        
        // Load user's fuel entries with timeout (don't block on this)
        loadUserFuelEntries(result.accessToken).catch(() => {
          // Silently fail - entries will be empty
        });
        
        toast.success(`Welcome back, ${result.user.name}!`);
        console.log('🎉 Login successful, returning true');
        return true;
      } else {
        console.log('❌ Error in result:', result.error);
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.log('💥 Exception caught:', error);
      toast.error('Login error. Try Quick Access button instead.');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setAccessToken(null);
      setIsGuestMode(false);
      setFuelEntries([]); // Clear fuel entries on logout
      setCurrentScreen('login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };



  const handleSignUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('🚀 APP.TSX - handleSignUp() called');
      console.log('📧 Email:', email);
      console.log('👤 Name:', name);
      
      const result = await authService.signUp(email, password, name);
      
      console.log('📦 Signup result:', result);
      
      if ('user' in result) {
        console.log('✅ Signup successful, showing success toast');
        toast.success('Account created successfully! You can now sign in.');
        return true;
      } else {
        console.log('❌ Signup failed with error:', result.error);
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error('💥 Signup exception:', error);
      toast.error(`Failed to create account: ${error.message}`);
      return false;
    }
  };

  // Load user's fuel entries from backend
  const loadUserFuelEntries = async (token: string) => {
    try {
      const entries = await fuelService.getUserFuelEntries(token);
      const convertedEntries: FuelEntry[] = entries.map((entry: BackendFuelEntry) => ({
        id: entry.id,
        userId: entry.userId,
        userName: entry.userName,
        stockNumber: entry.stockNumber,
        vin: entry.vin,
        mileage: entry.mileage,
        fuelAmount: entry.fuelAmount,
        fuelCost: entry.fuelCost,
        timestamp: new Date(entry.timestamp),
        notes: entry.notes,
        location: entry.location,
        receiptPhoto: entry.receiptPhoto,
        vinPhoto: entry.vinPhoto,
        submittedAt: new Date(entry.submittedAt)
      }));
      setFuelEntries(convertedEntries);
    } catch (error) {
      // Set empty array on error to prevent issues
      setFuelEntries([]);
    }
  };

  const handleSubmitFuelEntry = async (entryData: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => {
    if (!currentUser || !accessToken) {
      toast.error('Please sign in to submit fuel entries');
      return;
    }

    try {
      const backendEntryData = {
        stockNumber: entryData.stockNumber,
        vin: entryData.vin,
        mileage: entryData.mileage,
        fuelAmount: entryData.fuelAmount,
        fuelCost: entryData.fuelCost,
        timestamp: entryData.timestamp.toISOString(),
        notes: entryData.notes,
        receiptPhoto: entryData.receiptPhoto,
        vinPhoto: entryData.vinPhoto
      };

      const result = await fuelService.submitFuelEntry(backendEntryData, accessToken);
      
      if (result) {
        const newEntry: FuelEntry = {
          id: result.id,
          userId: result.userId,
          userName: result.userName,
          stockNumber: result.stockNumber,
          vin: result.vin,
          mileage: result.mileage,
          fuelAmount: result.fuelAmount,
          fuelCost: result.fuelCost,
          timestamp: new Date(result.timestamp),
          notes: result.notes,
          receiptPhoto: result.receiptPhoto,
          vinPhoto: result.vinPhoto,
          submittedAt: new Date(result.submittedAt)
        };

        setFuelEntries(prev => [newEntry, ...prev]);
        setShowFuelEntryForm(true); // Show form again for next entry
        toast.success('Fuel entry submitted successfully!');
        return newEntry;
      } else {
        throw new Error('Failed to submit entry');
      }
    } catch (error) {
      toast.error('Failed to submit fuel entry. Please try again.');
    }
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  const handleOpenAdmin = () => {
    if (currentUser?.role === 'admin') {
      setCurrentScreen('admin');
    }
  };

  if (isLoading || currentScreen === 'splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'login') {
    return (
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <LoginScreen 
          onLogin={handleLogin} 
          onSignUp={handleSignUp} 
        />
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'white',
            },
          }}
        />
      </div>
    );
  }

  if (currentScreen === 'admin' && currentUser?.role === 'admin') {
    return (
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <AdminPanel 
          users={users}
          fuelEntries={fuelEntries}
          onAddUser={handleSignUp}
          onBack={handleBackToMain}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'white',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <MainApp 
        user={currentUser}
        onLogout={handleLogout}
        onSubmitFuelEntry={handleSubmitFuelEntry}
        onOpenAdmin={handleOpenAdmin}
        fuelEntries={fuelEntries}
        isGuestMode={isGuestMode}
        accessToken={accessToken}
        startWithFuelEntry={showFuelEntryForm}
        onFuelEntryClose={() => setShowFuelEntryForm(false)}
      />
      <Toaster 
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}