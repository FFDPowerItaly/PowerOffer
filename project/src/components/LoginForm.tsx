import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Zap, Mail } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface LoginFormProps {
  onLoginSuccess: (user: UserType) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Errore durante il login');
      }
    } catch (error) {
      setError('Errore di connessione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/95 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            {/* Logo con sfondo bianco */}
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <img 
                src="/LOGO FFD POWER copy copy copy.png"
                alt="FFD Power Italy" 
                className="h-20 w-auto"
                onError={(e) => {
                  console.error('Errore caricamento logo login:', e);
                  // Fallback: mostra testo se immagine non carica
                  e.currentTarget.outerHTML = '<div class="text-2xl font-bold text-gray-800 px-4 py-2 tracking-wider">FFD POWER</div>';
                }}
                onLoad={() => console.log('Logo login caricato con successo')}
              />
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">PowerOffer</h2>
            <Zap className="h-8 w-8 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-lg text-cyan-300 font-medium mb-4">Sistema Automatico Generazione Preventivi</p>
          <p className="text-lg text-cyan-300 font-medium mb-4">Sistema Automatico Generazione Offerte BESS</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/80 backdrop-blur-md rounded-xl shadow-xl border border-cyan-500/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/60 text-white backdrop-blur-sm transition-all"
                  placeholder="inserisci la tua email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-black/60 text-white backdrop-blur-sm transition-all"
                  placeholder="Inserisci password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Accesso in corso...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Accedi a PowerOffer</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <p>© 2024 FFD Power Italy S.r.l. - PowerOffer Sistema Gestione Preventivi BESS</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;