import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, Settings, Activity, BarChart3, Clock, FileText, Award, Phone, Mail, Building, X, Lock, Key } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType, UserActivity } from '../types';
import UserEditForm from './UserEditForm';
import PasswordChangeForm from './PasswordChangeForm';

interface UserProfileProps {
  user: UserType;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (showProfile) {
      const userActivities = authService.getUserActivities(user.id, 20);
      const userStats = authService.getUserStats(user.id);
      setActivities(userActivities);
      setStats(userStats);
    }
  }, [showProfile, user.id]);

  // Calcola posizione dropdown quando si apre
  useEffect(() => {
    if (showProfile && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [showProfile]);

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  const handleOpenSettings = () => {
    setShowProfile(false);
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleOpenPasswordChange = () => {
    setShowSettings(false);
    setShowPasswordChange(true);
  };

  const handleClosePasswordChange = () => {
    setShowPasswordChange(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'commerciale': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Amministratore';
      case 'manager': return 'Manager';
      case 'commerciale': return 'Commerciale';
      default: return role;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogOut className="h-3 w-3 text-green-600 rotate-180" />;
      case 'logout': return <LogOut className="h-3 w-3 text-gray-600" />;
      case 'create_quote': return <FileText className="h-3 w-3 text-cyan-600" />;
      case 'update_quote': return <Settings className="h-3 w-3 text-orange-600" />;
      case 'send_quote': return <Mail className="h-3 w-3 text-purple-600" />;
      default: return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'login': return 'Accesso';
      case 'logout': return 'Uscita';
      case 'create_quote': return 'Preventivo Creato';
      case 'update_quote': return 'Preventivo Modificato';
      case 'send_quote': return 'Preventivo Inviato';
      default: return action;
    }
  };

  // Componente Modal Impostazioni
  const SettingsModal = () => (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleCloseSettings}
      />
      
      {/* Modal */}
      <div className="relative z-[20001] w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Impostazioni Profilo</h2>
                <p className="text-cyan-100">Gestisci il tuo account e le preferenze</p>
              </div>
            </div>
            <button
              onClick={handleCloseSettings}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Informazioni Personali */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-900">Informazioni Personali</h3>
              </div>
              
              <UserEditForm user={user} onClose={handleCloseSettings} />
            </div>

            {/* Sicurezza - Sezione Password */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-900">Sicurezza</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Key className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm font-medium text-red-700">Password</div>
                      <div className="text-xs text-gray-600">Ultima modifica: Mai</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleOpenPasswordChange}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Cambia Password
                  </button>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="text-xs text-gray-600">
                    <strong>Suggerimenti per una password sicura:</strong><br/>
                    • Almeno 8 caratteri<br/>
                    • Combina lettere, numeri e simboli<br/>
                    • Non utilizzare informazioni personali
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              PowerOffer v1.0 - FFD Power Italy S.r.l.
            </div>
            <button
              onClick={handleCloseSettings}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Modal Cambio Password
  const PasswordChangeModal = () => (
    <div className="fixed inset-0 z-[25000] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClosePasswordChange}
      />
      
      {/* Modal */}
      <div className="relative z-[25001] w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Sicurezza Account</h2>
                <p className="text-red-100 text-sm">Cambia la tua password</p>
              </div>
            </div>
            <button
              onClick={handleClosePasswordChange}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <PasswordChangeForm user={user} onClose={handleClosePasswordChange} />
        </div>
      </div>
    </div>
  );

  // Componente Dropdown che verrà renderizzato nel portale
  const DropdownContent = () => (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[10000]" 
        onClick={() => setShowProfile(false)}
      />
      
      {/* Dropdown */}
      <div 
        className="fixed z-[10001] w-96 bg-white rounded-lg shadow-2xl border border-gray-200"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user.avatar || user.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
              <p className="text-sm text-gray-600">{user.department}</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleColor(user.role)}`}>
                <Award className="h-3 w-3 mr-1" />
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              <span>FFD Power Italy</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiche Personali
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">{stats.totalQuotes}</div>
                <div className="text-xs text-gray-600">Preventivi Totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.quotesThisMonth}</div>
                <div className="text-xs text-gray-600">Questo Mese</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                €{stats.totalValue.toLocaleString('it-IT')}
              </div>
              <div className="text-xs text-gray-600">Valore Totale Generato</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4">
          <div className="space-y-2">
            <button
              onClick={handleOpenSettings}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Impostazioni Profilo</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnetti</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-500 text-center">
            Ultimo accesso: {user.lastLogin ? new Date(user.lastLogin).toLocaleString('it-IT') : 'Mai'}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        ref={buttonRef}
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center space-x-3 p-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 border border-cyan-500 hover:border-cyan-600 transition-all duration-300 shadow-lg"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {user.avatar || user.fullName.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">{user.fullName}</div>
          <div className="text-xs text-cyan-100">{user.department}</div>
        </div>
      </button>

      {/* Render dropdown in portal */}
      {showProfile && createPortal(<DropdownContent />, document.body)}

      {/* Render settings modal in portal */}
      {showSettings && createPortal(<SettingsModal />, document.body)}

      {/* Render password change modal in portal */}
      {showPasswordChange && createPortal(<PasswordChangeModal />, document.body)}
    </div>
  );
};

export default UserProfile;