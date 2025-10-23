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
    if (isDemoMode) {
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

      this.demoEntries.unshift(newEntry);

      return Promise.resolve(newEntry);
    }

    try {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Submit fuel entry error: ${errorMessage}`);
    }
  }

  async getUserFuelEntries(token: string): Promise<FuelEntry[]> {
    if (isDemoMode) {
      return Promise.resolve([...this.demoEntries]);
    }

    try {
      const response = await fetch(`${this.baseUrl}/fuel-entries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch fuel entries (${response.status})`);
        } catch {
          // If JSON parsing fails, use status text
          throw new Error(`Failed to fetch fuel entries: ${response.statusText} (${response.status})`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      // Re-throw the error so it can be handled by the caller
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while fetching fuel entries');
    }
  }

  async uploadPhoto(
    photo: File,
    token: string
  ): Promise<{ url: string; path: string } | { error: string }> {
    try {
      if (isDemoMode) {
        return {
          url: 'https://via.placeholder.com/300x200?text=Demo+Receipt',
          path: 'demo/receipt.jpg'
        };
      }

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
    } catch (error: unknown) {
      return { error: 'Network error while uploading photo' };
    }
  }
}

export const fuelService = new FuelService();