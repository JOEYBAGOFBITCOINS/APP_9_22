import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Car, Receipt, Save, X, Plus } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { CameraCapture } from './CameraCapture';
import { VehicleIdentification } from './VehicleIdentification';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { FuelEntry } from '../App';
import { VehicleInfo } from '../services/vinService';

interface FuelEntryFormProps {
  onSubmit: (entry: Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'>) => void;
  onBack: () => void;
}

export const FuelEntryForm: React.FC<FuelEntryFormProps> = ({
  onSubmit,
  onBack
}) => {
  const [formData, setFormData] = useState({
    stockNumber: '',
    mileage: '',
    fuelAmount: '',
    fuelCost: '',
    notes: ''
  });
  
  const [receiptPhoto, setReceiptPhoto] = useState<string>('');
  const [vinPhoto, setVinPhoto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<Omit<FuelEntry, 'id' | 'userId' | 'userName' | 'submittedAt'> | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'receipt' | 'vin'>('receipt');
  const [currentStep, setCurrentStep] = useState<'vehicle' | 'details'>('vehicle');
  const [vehicleData, setVehicleData] = useState<{
    stockNumber?: string;
    vin?: string;
    vinPhoto?: string;
    vehicleInfo?: VehicleInfo;
  }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoCapture = (type: 'receipt' | 'vin') => {
    setCameraMode(type);
    setShowCamera(true);
  };

  const handleCameraCapture = (photoDataUrl: string) => {
    if (cameraMode === 'receipt') {
      setReceiptPhoto(photoDataUrl);
      toast.success('Receipt photo captured successfully');
    } else {
      setVinPhoto(photoDataUrl);
      toast.success('VIN photo captured successfully');
    }
    setShowCamera(false);
  };

  const removePhoto = (type: 'receipt' | 'vin') => {
    if (type === 'receipt') {
      setReceiptPhoto('');
    } else {
      setVinPhoto('');
    }
    toast.info(`${type === 'receipt' ? 'Receipt' : 'VIN'} photo removed`);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.stockNumber.trim() && !vinPhoto) {
      errors.push('Stock Number or VIN photo is required');
    }

    const mileage = Number(formData.mileage);
    if (!formData.mileage || isNaN(mileage) || mileage <= 0 || mileage > 1000000) {
      errors.push('Valid mileage is required (1-1,000,000)');
    }

    const fuelAmount = Number(formData.fuelAmount);
    if (!formData.fuelAmount || isNaN(fuelAmount) || fuelAmount <= 0 || fuelAmount > 1000) {
      errors.push('Valid fuel amount is required (0.01-1,000 gallons)');
    }

    const fuelCost = Number(formData.fuelCost);
    if (!formData.fuelCost || isNaN(fuelCost) || fuelCost <= 0 || fuelCost > 10000) {
      errors.push('Valid fuel cost is required ($0.01-$10,000)');
    }

    if (formData.notes && formData.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    // Simulate submission delay
    setTimeout(() => {
      const entryData = {
        stockNumber: vehicleData.stockNumber || formData.stockNumber || undefined,
        vin: vehicleData.vin || undefined,
        vehicleInfo: vehicleData.vehicleInfo || undefined,
        mileage: Number(formData.mileage),
        fuelAmount: Number(formData.fuelAmount),
        fuelCost: Number(formData.fuelCost),
        timestamp: new Date(),
        notes: formData.notes || undefined,
        receiptPhoto,
        vinPhoto: vehicleData.vinPhoto || vinPhoto || undefined
      };

      setSubmittedEntry(entryData);
      setIsSubmitting(false);
      setShowConfirmation(true);
    }, 2000);
  };

  const handleVehicleIdentified = (data: {
    stockNumber?: string;
    vin?: string;
    vinPhoto?: string;
    vehicleInfo?: VehicleInfo;
  }) => {
    setVehicleData(data);
    setFormData(prev => ({
      ...prev,
      stockNumber: data.stockNumber || ''
    }));
    setVinPhoto(data.vinPhoto || '');
    setCurrentStep('details');
  };

  const handleBackToVehicle = () => {
    setCurrentStep('vehicle');
  };

  const handleConfirmSubmission = () => {
    if (submittedEntry) {
      onSubmit(submittedEntry);
    }
  };

  if (showConfirmation && submittedEntry) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col overflow-y-auto px-6 py-8 overscroll-behavior-contain">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-white text-2xl mb-2">Entry Complete</h2>
          <p className="text-slate-300/80">
            Review your fuel entry submission
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <h3 className="text-white text-lg mb-4">Entry Summary</h3>
          
          <div className="space-y-3">
            {submittedEntry.stockNumber && (
              <div className="flex justify-between">
                <span className="text-slate-300">Stock Number:</span>
                <span className="text-white font-mono">{submittedEntry.stockNumber}</span>
              </div>
            )}
            
            {submittedEntry.vin && (
              <div className="flex justify-between">
                <span className="text-slate-300">VIN:</span>
                <span className="text-white font-mono text-sm">
                  {submittedEntry.vin === 'VIN_FROM_PHOTO' ? 'Captured from photo' : submittedEntry.vin}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-slate-300">Mileage:</span>
              <span className="text-white">{submittedEntry.mileage.toLocaleString()} miles</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Fuel Amount:</span>
              <span className="text-white">{submittedEntry.fuelAmount} gallons</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Cost:</span>
              <span className="text-white font-medium">${submittedEntry.fuelCost.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Date & Time:</span>
              <span className="text-white text-sm">{submittedEntry.timestamp.toLocaleString()}</span>
            </div>
            
            {submittedEntry.notes && (
              <div>
                <span className="text-slate-300">Notes:</span>
                <p className="text-white text-sm mt-1">{submittedEntry.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Photos Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <h3 className="text-white text-lg mb-4">Attached Photos</h3>
          <div className="grid grid-cols-2 gap-4">
            {submittedEntry.receiptPhoto && (
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Receipt className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-slate-300 text-sm">Receipt Photo</p>
                <p className="text-green-400 text-xs">✓ Attached</p>
              </div>
            )}
            {submittedEntry.vinPhoto && (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Car className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-slate-300 text-sm">VIN Photo</p>
                <p className="text-green-400 text-xs">✓ Attached</p>
              </div>
            )}
            {!submittedEntry.receiptPhoto && !submittedEntry.vinPhoto && (
              <div className="col-span-2 text-center py-4">
                <p className="text-slate-400 text-sm">No photos attached</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-4">
          <GlassmorphicButton
            variant="primary"
            size="large"
            onClick={handleConfirmSubmission}
            className="w-full"
          >
            <Save className="w-5 h-5 mr-2" />
            Confirm & Submit
          </GlassmorphicButton>
          
          <GlassmorphicButton
            variant="secondary"
            onClick={() => setShowConfirmation(false)}
            className="w-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Edit
          </GlassmorphicButton>
        </div>
      </div>
    );
  }

  // Render Vehicle Identification step
  if (currentStep === 'vehicle') {
    return (
      <VehicleIdentification
        onVehicleIdentified={handleVehicleIdentified}
        onBack={onBack}
        initialData={vehicleData}
      />
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-6 border-b border-white/10">
        <button
          onClick={handleBackToVehicle}
          className="flex items-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-white text-lg font-medium">Fuel Details</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 overscroll-behavior-contain">
        {/* Vehicle Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Vehicle Identified
          </h3>
          
          <div className="space-y-3">
            {vehicleData.stockNumber && (
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Stock Number:</span>
                <span className="text-white font-medium">{vehicleData.stockNumber}</span>
              </div>
            )}
            
            {vehicleData.vin && (
              <div className="flex justify-between items-center">
                <span className="text-slate-300">VIN:</span>
                <span className="text-white font-mono text-sm">{vehicleData.vin}</span>
              </div>
            )}
            
            {vehicleData.vehicleInfo && vehicleData.vehicleInfo.valid && (
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Vehicle:</span>
                <span className="text-white font-medium">
                  {vehicleData.vehicleInfo.year} {vehicleData.vehicleInfo.make} {vehicleData.vehicleInfo.model}
                </span>
              </div>
            )}
            
            {vehicleData.vinPhoto && (
              <div className="flex items-center text-green-400 text-sm">
                <Camera className="w-4 h-4 mr-2" />
                VIN scanned
              </div>
            )}
          </div>
        </div>

        {/* Fuel Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4">Fuel Information</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="mileage-input" className="text-white text-sm font-medium mb-2 block">
                Mileage
              </label>
              <Input
                id="mileage-input"
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
                placeholder="Current mileage"
                className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                inputMode="numeric"
                min="1"
                max="1000000"
                required
                aria-label="Vehicle mileage"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fuel-amount-input" className="text-white text-sm font-medium mb-2 block">
                  Fuel Amount (Gallons)
                </label>
                <Input
                  id="fuel-amount-input"
                  type="number"
                  step="0.01"
                  value={formData.fuelAmount}
                  onChange={(e) => handleInputChange('fuelAmount', e.target.value)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  inputMode="decimal"
                  min="0.01"
                  max="1000"
                  required
                  aria-label="Fuel amount in gallons"
                />
              </div>

              <div>
                <label htmlFor="fuel-cost-input" className="text-white text-sm font-medium mb-2 block">
                  Total Cost ($)
                </label>
                <Input
                  id="fuel-cost-input"
                  type="number"
                  step="0.01"
                  value={formData.fuelCost}
                  onChange={(e) => handleInputChange('fuelCost', e.target.value)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  inputMode="decimal"
                  min="0.01"
                  max="10000"
                  required
                  aria-label="Total fuel cost in dollars"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photo Capture */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4">Photo Documentation</h3>
          
          <div className="space-y-4">
            {/* Receipt Photo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-sm font-medium">
                  Receipt Photo
                </label>
              </div>
              
              {receiptPhoto ? (
                <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Receipt className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Receipt Photo</p>
                        <p className="text-slate-400 text-xs">Captured successfully</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePhoto('receipt')}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <GlassmorphicButton
                  variant="secondary"
                  onClick={() => handlePhotoCapture('receipt')}
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Receipt Photo
                </GlassmorphicButton>
              )}
            </div>


          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="notes-input" className="text-white text-sm font-medium mb-2 block">
                Notes (Optional)
              </label>
              <Textarea
                id="notes-input"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes..."
                className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 min-h-[60px]"
                rows={2}
                maxLength={500}
                aria-label="Additional notes about the fuel entry"
              />
              {formData.notes && (
                <p className="text-slate-400 text-xs mt-1">
                  {formData.notes.length}/500 characters
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-6 border-t border-white/10">
        <GlassmorphicButton
          variant="primary"
          size="large"
          onClick={handleSubmit}
          className="w-full"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Submitting...
            </div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Submit Fuel Entry
            </>
          )}
        </GlassmorphicButton>
      </div>

      {/* Camera Component */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        title={cameraMode === 'receipt' ? 'Capture Receipt Photo' : 'Capture VIN Photo'}
        subtitle={cameraMode === 'receipt' ? 'Take a clear photo of your fuel receipt' : 'Take a clear photo of the vehicle VIN'}
      />
    </div>
  );
};