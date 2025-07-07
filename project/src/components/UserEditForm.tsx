import React, { useState } from 'react';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface UserEditFormProps {
  user: UserType;
  onClose: () => void;
}

// Componente COMPLETAMENTE ISOLATO - nessuna dipendenza esterna
const UserEditForm: React.FC<UserEditFormProps> = ({ user, onClose }) => {
  // Stato locale completamente isolato - NESSUN useEffect
  const [fullName, setFullName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [department] = useState(user.department || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Handler diretti senza re-rendering
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Simula salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aggiorna i dati utente
      const updatedUser = { 
        ...user, 
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim()
      };
      
      // Salva nel localStorage
      localStorage.setItem('ffd_current_user', JSON.stringify(updatedUser));
      
      // Aggiorna l'oggetto utente originale
      Object.assign(user, updatedUser);
      
      // Log dell'attività
      authService.logActivity(
        user.id,
        'update_user',
        'Profilo utente aggiornato',
        { 
          updatedFields: ['fullName', 'email', 'phone'],
          oldValues: { fullName: user.fullName, email: user.email, phone: user.phone },
          newValues: { fullName, email, phone }
        }
      );
      
      setHasChanges(false);
      setSaveStatus('success');
      
      // Chiudi automaticamente dopo successo
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Errore salvataggio profilo:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Nome Completo */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-2">
          Nome Completo
        </label>
        <input
          type="text"
          value={fullName}
          onChange={handleFullNameChange}
          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
          placeholder="Inserisci il tuo nome completo"
          disabled={isSaving}
        />
      </div>
      
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
          placeholder="Inserisci la tua email"
          disabled={isSaving}
        />
      </div>
      
      {/* Telefono */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-2">
          Telefono
        </label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
          placeholder="Inserisci il tuo numero di telefono"
          disabled={isSaving}
        />
      </div>
      
      {/* Dipartimento (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-2">
          Dipartimento
        </label>
        <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed">
          {department || 'Non specificato'}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Il dipartimento può essere modificato solo dall'amministratore
        </p>
      </div>
      
      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Profilo aggiornato con successo!
          </span>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            Errore durante il salvataggio. Riprova.
          </span>
        </div>
      )}
      
      {/* Pulsante Salva */}
      <div className="pt-4 border-t border-blue-200">
        <button 
          onClick={handleSaveChanges}
          disabled={!hasChanges || isSaving}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            hasChanges && !isSaving
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Salvando...</span>
            </div>
          ) : hasChanges ? (
            'Salva Modifiche'
          ) : (
            'Nessuna Modifica'
          )}
        </button>
        
        {hasChanges && saveStatus === 'idle' && (
          <div className="mt-2 text-xs text-blue-600 text-center font-medium">
            Hai modifiche non salvate
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEditForm;