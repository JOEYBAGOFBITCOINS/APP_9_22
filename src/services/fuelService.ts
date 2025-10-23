import { projectId, publicAnonKey } from '../utils/supabase/info';
import { isDemoMode } from '../utils/supabase/safe-demo-config';

// Backend interface that matches what App.tsx expects
export interface FuelEntry {
  id: string;
  userId: string;
  userName: string;
  stockNumber?: string;
  vin?: string;
  mileage: number;
  fuelAmount: number;
  fuelCost: number;
  timestamp: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  receiptPhoto?: string; // Made optional for testing
  vinPhoto?: string;
  submittedAt: string;
}

export interface CreateFuelEntryData {
  stockNumber?: string;
  vin?: string;
  mileage: number;
  fuelAmount: number;
  fuelCost: number;
  timestamp: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  receiptPhoto?: string; // Made optional for testing
  vinPhoto?: string;
}

class FuelService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7`;
  private demoEntries: FuelEntry[] = [
    {
      id: 'demo-entry-1',
      userId: 'demo-porter',
      userName: 'Porter User',
      stockNumber: 'STK123',
      mileage: 45000,
      fuelAmount: 12.5,
      fuelCost: 42.50,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      notes: 'Regular maintenance fill-up',
      location: {
        latitude: 41.8781,
        longitude: -87.6298,
        address: 'Chicago, IL'
      },
      receiptPhoto: '',
      submittedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'demo-entry-2',
      userId: 'demo-porter',
      userName: 'Porter User',
      stockNumber: 'STK456',
      mileage: 32000,
      fuelAmount: 8.2,
      fuelCost: 28.15,
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      notes: 'Quick top-off',
      location: {
        latitude: 41.8881,
        longitude: -87.6198,
        address: 'Chicago, IL'
      },
      receiptPhoto: '',
      submittedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  async submitFuelEntry(
    entryData: CreateFuelEntryData, 
    token: string
  ): Promise<FuelEntry | null> {
    // DEMO MODE - Return immediately with mock entry
    if (isDemoMode) {
      console.log('🎭 Demo mode: Creating mock fuel entry immediately');
      
      const newEntry: FuelEntry = {
        id: `demo-${Date.now()}`,
        userId: 'demo-porter',
        userName: 'Porter User',
        stockNumber: entryData.stockNumber,
        vin: entryData.vin,
        mileage: entryData.mileage,
        fuelAmount: entryData.fuelAmount,
        fuelCost: entryData.fuelCost,
        timestamp: entryData.timestamp,
        notes: entryData.notes,
        location: entryData.location,
        receiptPhoto: entryData.receiptPhoto || '',
        vinPhoto: entryData.vinPhoto,
        submittedAt: new Date().toISOString()
      };

      // Add to demo entries
      this.demoEntries.unshift(newEntry);
      
      return Promise.resolve(newEntry);
    }

    try {
      // PRODUCTION MODE - Use real backend
      const response = await fetch(`${this.baseUrl}/fuel-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entryData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create fuel entry');
      }

      return data;
    } catch (error) {
      console.error('Submit fuel entry error:', error);
      throw error;
    }
  }

  async getUserFuelEntries(token: string): Promise<FuelEntry[]> {
    // DEMO MODE - Return immediately with mock entries
    if (isDemoMode) {
      console.log('🎭 Demo mode: Returning mock fuel entries immediately');
      return Promise.resolve([...this.demoEntries]);
    }

    try {
      // PRODUCTION MODE - Use real backend
      const response = await fetch(`${this.baseUrl}/fuel-entries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch fuel entries');
      }

      return data;
    } catch (error) {
      console.error('Get fuel entries error:', error);
      return [];
    }
  }

  async uploadPhoto(
    photo: File, 
    token: string
  ): Promise<{ url: string; path: string } | { error: string }> {
    try {
      // DEMO MODE - Return mock URL
      if (isDemoMode) {
        console.log('🎭 Demo mode: Mock photo upload');
        return { 
          url: 'https://via.placeholder.com/300x200?text=Demo+Receipt', 
          path: 'demo/receipt.jpg' 
        };
      }

      // PRODUCTION MODE - Use real backend
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await fetch(`${this.baseUrl}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to upload photo' };
      }

      return { url: data.url, path: data.path };
    } catch (error) {
      console.error('Upload photo error:', error);
      return { error: 'Network error while uploading photo' };
    }
  }
}

export const fuelService = new FuelService();