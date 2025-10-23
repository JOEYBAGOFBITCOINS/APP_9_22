import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AdminPanel } from './components/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner@2.0.3';
import { authService, User } from './services/authService';
import { fuelService, FuelEntry as BackendFuelEntry } from './services/fuelService';
import { toast } from 'sonner@2.0.3';
import { isDemoMode, skipAuth, autoLogin, defaultUserRole, debugMode } from './utils/supabase/safe-demo-config';
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

  // Load user's fuel entries from backend - DEFINED EARLY FOR USE IN USEEFFECT
  const loadUserFuelEntries = async (token: string) => {
    try {
      if (debugMode) {
        console.log('Loading user fuel entries...');
      }

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

      if (debugMode) {
        console.log(`Loaded ${convertedEntries.length} fuel entries`);
      }

      // Show success toast if entries were found
      if (convertedEntries.length > 0) {
        toast.success(`Loaded ${convertedEntries.length} fuel ${convertedEntries.length === 1 ? 'entry' : 'entries'}`);
      }
    } catch (error) {
      // Set empty array on error to prevent issues
      setFuelEntries([]);

      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to load fuel entries: ${errorMessage}`);

      if (debugMode) {
        console.error('Error loading fuel entries:', error);
      }
    }
  };

  // Initialize app and check for existing session
  useEffect(() => {
    enableCameraErrorSuppression();

    const initializeApp = async () => {
      if (skipAuth && autoLogin) {
        setTimeout(async () => {
          const mockUser: User = {
            id: `dev-${defaultUserRole}-user`,
            email: `${defaultUserRole}@napleton.com`,
            name: `Development ${defaultUserRole.charAt(0).toUpperCase() + defaultUserRole.slice(1)} User`,
            role: defaultUserRole as 'admin' | 'porter'
          };

          const mockToken = `dev-token-${defaultUserRole}`;

          setCurrentUser(mockUser);
          setAccessToken(mockToken);
          setIsGuestMode(false);
          setCurrentScreen('main');
          setShowFuelEntryForm(false);  // Changed to false - don't auto-show form
          setIsLoading(false);

          // Load fuel entries for auto-login user
          if (isDemoMode) {
            await loadUserFuelEntries(mockToken);
          }

          toast.success(`Welcome ${mockUser.name}!`);
        }, 10500);
        return;
      }

      setTimeout(() => {
        setCurrentScreen('login');
        setIsLoading(false);
      }, 10500);
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.signIn(email, password);

      if ('user' in result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setIsGuestMode(false);
        setCurrentScreen('main');
        setShowFuelEntryForm(false);  // Changed to false - don't auto-show form

        // Load user's fuel entries after successful login
        await loadUserFuelEntries(result.accessToken);

        toast.success(`Welcome back, ${result.user.name}!`);
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
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
      const result = await authService.signUp(email, password, name);

      if ('user' in result) {
        toast.success('Account created successfully! You can now sign in.');
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create account: ${errorMessage}`);
      return false;
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
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'admin' && currentUser?.role === 'admin') {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}