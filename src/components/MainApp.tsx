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

  // Modern professional pattern - no bottom tabs!
  const renderCurrentView = () => {
    if (showFuelForm) {
      return (
        <FuelEntryForm
          onSubmit={handleFuelEntrySubmit}
          onBack={handleBackFromForm}
        />
      );
    }
  };

  return (
    <div className="max-w-md mx-auto fixed inset-0 w-full h-full overflow-hidden">
      {/* Main Content */}
      <div className="w-full h-full">
        {renderCurrentView()}
      </div>

      {/* Top Right Actions */}
      <div className="fixed top-4 right-4 flex items-center space-x-2">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};