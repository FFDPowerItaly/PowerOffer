import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface PasswordChangeFormProps {
  user: UserType;
  onClose: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ user, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [changeStatus, setChangeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Almeno 8 caratteri');
    if (!/[A-Z]/.test(password)) errors.push('Almeno una lettera maiuscola');
    if (!/[a-z]/.test(password)) errors.push('Almeno una lettera minuscola');
    if (!/[0-9]/.test(password)) errors.push('Almeno un numero');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Almeno un carattere speciale');
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const isPasswordValid = passwordErrors.length === 0 && newPassword.length > 0;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Compila tutti i campi');
      setChangeStatus('error');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('La nuova password non rispetta i requisiti di sicurezza');
      setChangeStatus('error');
      return;
    }

    if (!doPasswordsMatch) {
      setErrorMessage('Le password non coincidono');
      setChangeStatus('error');
      return;
    }

    if (currentPassword.length < 6) {
      setErrorMessage('Password attuale non valida');
      setChangeStatus('error');
      return;
    }

    setIsChanging(true);
    setChangeStatus('idle');
    setErrorMessage('');

    try {
      // Simula cambio password
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Log dell'attività
      authService.logActivity(
        user.id,
        'update_user',
        'Password cambiata con successo',
        { 
          action: 'password_change',
          timestamp: new Date().toISOString()
        }
      );

      setChangeStatus('success');

      // Chiudi automaticamente dopo successo
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Errore cambio password:', error);
      setErrorMessage('Errore durante il cambio password. Riprova.');
      setChangeStatus('error');
    } finally {
      setIsChanging(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { strength: score, label: 'Debole', color: 'bg-red-500' };
    if (score <= 3) return { strength: score, label: 'Media', color: 'bg-yellow-500' };
    if (score <= 4) return { strength: score, label: 'Buona', color: 'bg-blue-500' };
    return { strength: score, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Cambia Password</h3>
        <p className="text-gray-600 mt-2">Aggiorna la tua password per mantenere l'account sicuro</p>
      </div>

      {/* Password Attuale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Attuale *
        </label>
        <div className="relative">
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setChangeStatus('idle');
              setErrorMessage('');
            }}
            className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Inserisci la password attuale"
            disabled={isChanging}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Nuova Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nuova Password *
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setChangeStatus('idle');
              setErrorMessage('');
            }}
            className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Inserisci la nuova password"
            disabled={isChanging}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {newPassword.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Sicurezza password:</span>
              <span className={`text-sm font-medium ${
                passwordStrength.strength <= 2 ? 'text-red-600' :
                passwordStrength.strength <= 3 ? 'text-yellow-600' :
                passwordStrength.strength <= 4 ? 'text-blue-600' : 'text-green-600'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Password Requirements */}
        {newPassword.length > 0 && (
          <div className="mt-3 space-y-1">
            {passwordErrors.map((error, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                <span>{error}</span>
              </div>
            ))}
            {isPasswordValid && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Password valida</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conferma Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conferma Nuova Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setChangeStatus('idle');
              setErrorMessage('');
            }}
            className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Conferma la nuova password"
            disabled={isChanging}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && (
          <div className="mt-2">
            {doPasswordsMatch ? (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Le password coincidono</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Le password non coincidono</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {changeStatus === 'success' && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Password cambiata con successo! Chiusura automatica...
          </span>
        </div>
      )}

      {changeStatus === 'error' && errorMessage && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            {errorMessage}
          </span>
        </div>
      )}

      {/* Suggerimenti Sicurezza */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Suggerimenti per una password sicura:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Usa almeno 8 caratteri</li>
          <li>• Combina lettere maiuscole e minuscole</li>
          <li>• Includi numeri e caratteri speciali (!@#$%^&*)</li>
          <li>• Non utilizzare informazioni personali</li>
          <li>• Non riutilizzare password di altri account</li>
        </ul>
      </div>

      {/* Pulsanti */}
      <div className="flex space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          disabled={isChanging}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annulla
        </button>
        <button
          onClick={handleChangePassword}
          disabled={!currentPassword || !isPasswordValid || !doPasswordsMatch || isChanging}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            currentPassword && isPasswordValid && doPasswordsMatch && !isChanging
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isChanging ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Cambiando...</span>
            </div>
          ) : (
            'Cambia Password'
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordChangeForm;