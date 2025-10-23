import React, { useState, useEffect } from 'react';
import { LogOut, Settings, Plus, Home, List, ChevronRight } from 'lucide-react';
import { FuelEntryForm } from './FuelEntryForm';
import { User } from '../services/authService';
import { FuelEntry } from '../App';
import { FuelEntryList } from './FuelEntryList';
import { Statistics } from './Statistics';
import { toast } from 'sonner@2.0.3';

interface MainAppProps {
  user: User | null;
  onLogout: () => void;
  onSubmitFuelEntry: (entry: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => FuelEntry | undefined;
  onOpenAdmin: () => void;
  fuelEntries: FuelEntry[];
  isGuestMode?: boolean;
  accessToken?: string | null;
  startWithFuelEntry?: boolean;
  onFuelEntryClose?: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({
  user,
  onLogout,
  onSubmitFuelEntry,
  onOpenAdmin,
  fuelEntries,
  isGuestMode = false,
  accessToken = null,
  startWithFuelEntry = false,
  onFuelEntryClose
}) => {
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'entries'>('home');

  // Start with fuel entry form if requested
  useEffect(() => {
    if (startWithFuelEntry) {
      setShowFuelForm(true);
      setActiveTab('add');
    }
  }, [startWithFuelEntry]);

  const handleStartNewEntry = () => {
    setShowFuelForm(true);
    setActiveTab('add');
  };

  const handleFuelEntrySubmit = (entryData: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => {
    const submittedEntry = onSubmitFuelEntry(entryData);
    if (submittedEntry) {
      setShowFuelForm(false);
      setActiveTab('home');
      
      // Reset to show fuel form again for next entry
      setTimeout(() => {
        setShowFuelForm(true);
        setActiveTab('add');
      }, 2000);
      
      toast.success('Fuel entry submitted successfully!', {
        description: `$${entryData.fuelCost.toFixed(2)} • ${entryData.fuelAmount} gallons`,
        duration: 4000,
      });
    }
  };

  const handleBackFromForm = () => {
    setShowFuelForm(false);
    setActiveTab('home');
    if (onFuelEntryClose) {
      onFuelEntryClose();
    }
  };

  if (!user) {
    return null;
  }

  // Render current view based on state
  const renderCurrentView = () => {
    if (showFuelForm) {
      return (
        <FuelEntryForm
          onSubmit={handleFuelEntrySubmit}
          onBack={handleBackFromForm}
        />
      );
    }

    // When form is closed, show home or entries based on activeTab
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">FuelTrakr</h1>
              <p className="text-sm text-slate-300">
                {user?.role === 'admin' ? 'Administrator' : 'Porter'} • {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {user?.role === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  title="Admin Panel"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
              )}
              <button
                onClick={onLogout}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/20 px-4 py-2">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'home'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('entries')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'entries'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              All Entries
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'home' && (
            <Statistics entries={fuelEntries} />
          )}
          {activeTab === 'entries' && (
            <FuelEntryList entries={fuelEntries} />
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={handleStartNewEntry}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
          title="Add Fuel Entry"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto fixed inset-0 w-full h-full overflow-hidden">
      {renderCurrentView()}
    </div>
  );
};