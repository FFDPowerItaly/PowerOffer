import React, { useState, useEffect } from 'react';
import { Edit, UserPlus, X, Save } from 'lucide-react';
import { User as UserType } from '../types';

interface UserFormModalProps {
  isEdit: boolean;
  user: UserType | null;
  onSave: (formData: any) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

// Componente COMPLETAMENTE ISOLATO per evitare re-rendering
const UserFormModal: React.FC<UserFormModalProps> = ({ isEdit, user, onSave, onClose, isLoading }) => {
  // Stato locale ISOLATO - inizializzato una sola volta
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'commerciale' as UserType['role'],
    department: '',
    isActive: true
  });

  // Inizializza form data SOLO al mount del componente
  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'commerciale',
        department: user.department || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'commerciale',
        department: '',
        isActive: true
      });
    }
  }, []); // NESSUNA DIPENDENZA - inizializza solo una volta

  // Handlers diretti senza callback per evitare re-rendering
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, fullName: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, role: e.target.value as UserType['role'] }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, department: e.target.value }));
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isActive: e.target.checked }));
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  const isFormValid = formData.fullName.trim() && formData.email.trim() && formData.department.trim();

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-[30001] w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white ${isEdit ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {isEdit ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEdit ? 'Modifica Utente' : 'Nuovo Utente'}
                </h2>
                <p className="text-sm opacity-90">
                  {isEdit ? 'Aggiorna le informazioni utente' : 'Crea un nuovo account utente'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={handleFullNameChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                placeholder="es. Mario Rossi"
                required
                autoComplete="off"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                placeholder="mario.rossi@ffdpower.it"
                required
                autoComplete="off"
                disabled={isLoading}
              />
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                placeholder="+39 123 456 7890"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>

            {/* Ruolo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruolo *
              </label>
              <select
                value={formData.role}
                onChange={handleRoleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                required
                disabled={isLoading}
              >
                <option value="commerciale">Commerciale</option>
                <option value="manager">Manager</option>
                <option value="admin">Amministratore</option>
              </select>
            </div>

            {/* Dipartimento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dipartimento *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                placeholder="es. Vendite Nord Italia"
                required
                autoComplete="off"
                disabled={isLoading}
              />
            </div>

            {/* Stato Account */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleActiveChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700">
                  Account attivo
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Gli utenti disattivati non possono accedere al sistema
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEdit ? 'Aggiorna' : 'Crea'} Utente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;