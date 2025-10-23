import React, { useState, useEffect } from 'react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { Input } from './ui/input';
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { napletonLogo } from '../media/logo';
import { toast } from 'sonner@2.0.3';


interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string, name: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔔 LoginScreen - handleSubmit called');
    console.log('📝 isSignUpMode:', isSignUpMode);
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);

    try {
      // Validate required fields
      if (!email.trim() || !password.trim()) {
        console.log('❌ Validation failed: missing email or password');
        toast.error('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      if (isSignUpMode) {
        console.log('✏️ Sign-up mode detected');
        if (!name.trim()) {
          console.log('❌ Validation failed: missing name');
          toast.error('Please enter your full name');
          setIsLoading(false);
          return;
        }
        console.log('⏳ Calling onSignUp...');
        const success = await onSignUp(email, password, name);
        console.log('📦 onSignUp result:', success);
        if (success) {
          console.log('✅ Signup successful, switching to login mode');
          setIsSignUpMode(false);
          setName('');
          setPassword('');
          toast.success('Account created! Please sign in.');
        } else {
          console.log('❌ Signup failed');
        }
      } else {
        console.log('🔑 Login mode detected');
        const result = await onLogin(email, password);
        
        if (result) {
          toast.success('✅ Login successful!');
        } else {
          toast.error('Login failed. Check credentials or try Quick Access button below.');
        }
      }
    } catch (error) {
      console.error('💥 Exception in handleSubmit:', error);
      toast.error(`Login error: ${error.message || 'Try Quick Access button below'}`);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-8">
            <ImageWithFallback 
              src={napletonLogo} 
              alt="Napleton Automotive Group" 
              className="h-32 w-auto rounded-xl shadow-2xl mx-auto" 
            />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 px-8 py-6 mb-6">
            <h1 className="text-white text-3xl tracking-wide font-light mb-2 text-center">
              Welcome to FuelTrakr
            </h1>
          </div>
          
          <p className="text-slate-300/90 text-lg">
            Sign in to start tracking fuel expenses
          </p>
        </div>



        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="space-y-4">
              {/* Name Field - Only for Signup */}
              {isSignUpMode && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <GlassmorphicButton
                type="submit"
                variant="primary"
                size="large"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    {isSignUpMode ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    {isSignUpMode ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </GlassmorphicButton>

            </div>
          </div>
        </form>

        {/* Quick Access Buttons */}
        <div className="mt-6 space-y-3">
          {/* Guest Mode Button */}
          <GlassmorphicButton
            type="button"
            variant="secondary"
            size="large"
            className="w-full"
            onClick={async () => {
              setIsLoading(true);
              const success = await onLogin('porter@napleton.com', 'porter123');
              if (!success) {
                // Try admin credentials as fallback
                await onLogin('admin@napleton.com', 'admin123');
              }
              setIsLoading(false);
            }}
          >
            <span className="flex items-center justify-center">
              🚀 Quick Access (Porter Mode)
            </span>
          </GlassmorphicButton>

          {/* Toggle between Login/Signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                console.log('🔄 Toggling signup mode from:', isSignUpMode, 'to:', !isSignUpMode);
                setIsSignUpMode(!isSignUpMode);
                toast.info(isSignUpMode ? 'Switched to login mode' : 'Switched to signup mode');
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              {isSignUpMode 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"
              }
            </button>
          </div>
        </div>


        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Secure fuel expense tracking platform
          </p>
        </div>
      </div>
    </div>
  );
};