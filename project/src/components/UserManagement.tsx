import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, Eye, EyeOff, Shield, CheckCircle, AlertCircle, X, Save, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';
import UserFormModal from './UserFormModal';

interface UserManagementProps {
  currentUser: UserType;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state per creazione/modifica utente
  const [formData, setFormData] = useState({});

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = authService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtro ricerca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro ruolo
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtro stato
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowCreateModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: UserType) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleToggleStatus = async (user: UserType) => {
    setActionLoading(`toggle_${user.id}`);
    try {
      const success = authService.toggleUserStatus(user.id, !user.isActive);
      if (success) {
        await loadUsers();
      }
    } catch (error) {
      console.error('Errore cambio stato:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveUser = async (formData: any) => {
    setActionLoading('save');
    try {
      let success = false;

      if (selectedUser) {
        // Modifica utente esistente
        success = authService.updateUser(selectedUser.id, formData);
      } else {
        // Crea nuovo utente
        const newUser = authService.createUser({
          username: formData.email,
          ...formData
        });
        success = !!newUser;
      }

      if (success) {
        await loadUsers();
        setShowEditModal(false);
        setShowCreateModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Errore salvataggio utente:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setActionLoading('delete');
    try {
      const success = authService.deleteUser(selectedUser.id);
      if (success) {
        await loadUsers();
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Errore eliminazione utente:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'commerciale': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getUserStats = (userId: string) => {
    return authService.getUserStats(userId);
  };

  // Modal conferma eliminazione
  const DeleteConfirmModal = React.memo(() => (
    <div className="fixed inset-0 z-[35000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
      
      <div className="relative z-[35001] w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Elimina Utente</h3>
              <p className="text-sm text-gray-600">Questa azione non può essere annullata</p>
            </div>
          </div>

          {selectedUser && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-sm">
                <div className="font-medium text-red-900">
                  {selectedUser.fullName}
                </div>
                <div className="text-red-700">
                  {selectedUser.email}
                </div>
                <div className="text-red-600 mt-1">
                  {getRoleLabel(selectedUser.role)} - {selectedUser.department}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={actionLoading === 'delete'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {actionLoading === 'delete' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Elimina</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  ));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
          <p className="text-gray-600 mt-2">Amministra utenti e configurazioni sistema</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nuovo Utente</span>
        </button>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-600">Utenti Totali</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Attivi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => !u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Disattivati</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin' || u.role === 'manager').length}
              </div>
              <div className="text-sm text-gray-600">Admin/Manager</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome, email o dipartimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tutti i ruoli</option>
                <option value="admin">Amministratori</option>
                <option value="manager">Manager</option>
                <option value="commerciale">Commerciali</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Solo attivi</option>
              <option value="inactive">Solo disattivati</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabella Utenti */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-800 text-xl font-medium">
              {users.length === 0 ? 'Nessun utente trovato' : 'Nessun utente corrisponde ai filtri'}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {users.length === 0 
                ? 'Inizia creando il primo utente' 
                : 'Prova a modificare i filtri di ricerca'
              }
            </p>
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Dipartimento
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Ultimo Accesso
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const stats = getUserStats(user.id);
                  const isCurrentUser = user.id === currentUser.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                            {user.avatar || user.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 flex items-center flex-wrap">
                              {user.fullName}
                              {isCurrentUser && (
                                <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  Tu
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 truncate max-w-48">{user.email}</div>
                            <div className="text-xs text-gray-500 lg:hidden">{user.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <div className="text-sm text-gray-900 truncate max-w-32">
                          {user.department}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => !isCurrentUser && handleToggleStatus(user)}
                            disabled={isCurrentUser || actionLoading === `toggle_${user.id}`}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all ${
                              user.isActive
                                ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                            } ${isCurrentUser ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          >
                            {actionLoading === `toggle_${user.id}` ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                            ) : user.isActive ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            <span className="ml-1 hidden sm:inline">
                              {user.isActive ? 'Attivo' : 'Disattivato'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('it-IT') : 'Mai'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stats.totalQuotes} preventivi creati
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Visualizza Dettagli */}
                          <button
                            onClick={() => {
                              const stats = getUserStats(user.id);
                              const activities = authService.getUserActivities(user.id, 10);
                              alert(`👤 ${user.fullName}\n\n📊 STATISTICHE:\n• Preventivi: ${stats.totalQuotes}\n• Questo mese: ${stats.quotesThisMonth}\n• Valore: €${stats.totalValue.toLocaleString('it-IT')}\n\n📅 ACCOUNT:\n• Creato: ${user.createdAt.toLocaleDateString('it-IT')}\n• Ultimo accesso: ${user.lastLogin ? user.lastLogin.toLocaleDateString('it-IT') : 'Mai'}\n• Stato: ${user.isActive ? 'Attivo' : 'Disattivato'}\n\n📧 CONTATTI:\n• ${user.email}\n• ${user.phone}\n• ${user.department}`);
                            }}
                            className="text-gray-600 hover:text-gray-700 transition-colors p-1.5 hover:bg-gray-50 rounded"
                            title="Visualizza dettagli utente"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Modifica Utente */}
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 hover:bg-blue-50 rounded"
                            title="Modifica utente"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          {/* Blocca/Sblocca Utente */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoading === `toggle_${user.id}`}
                              className={`transition-colors p-1.5 rounded ${
                                user.isActive 
                                  ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title={user.isActive ? 'Blocca utente' : 'Sblocca utente'}
                            >
                              {actionLoading === `toggle_${user.id}` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : user.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          
                          {/* Elimina Utente */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded"
                              title="Elimina utente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Reset Password */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => {
                                if (confirm(`Vuoi resettare la password per ${user.fullName}?\n\nVerrà generata una password temporanea che l'utente dovrà cambiare al primo accesso.`)) {
                                  // Simula reset password
                                  const tempPassword = 'TempPass' + Math.floor(Math.random() * 1000);
                                  authService.logActivity(
                                    currentUser.id,
                                    'update_user',
                                    `Password resettata per ${user.fullName}`,
                                    { targetUserId: user.id, action: 'password_reset' }
                                  );
                                  alert(`🔑 PASSWORD RESETTATA!\n\n👤 Utente: ${user.fullName}\n🔐 Password temporanea: ${tempPassword}\n\n⚠️ IMPORTANTE:\n• Comunica la password all'utente in modo sicuro\n• L'utente dovrà cambiarla al primo accesso\n• La password temporanea scade in 24 ore`);
                                }
                              }}
                              className="text-purple-600 hover:text-purple-700 transition-colors p-1.5 hover:bg-purple-50 rounded"
                              title="Reset password"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserFormModal
          isEdit={false}
          user={null}
          onSave={handleSaveUser}
          onClose={() => setShowCreateModal(false)}
          isLoading={actionLoading === 'save'}
        />
      )}
      {showEditModal && selectedUser && (
        <UserFormModal
          isEdit={true}
          user={selectedUser}
          onSave={handleSaveUser}
          onClose={() => setShowEditModal(false)}
          isLoading={actionLoading === 'save'}
        />
      )}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </div>
  );
};

export default UserManagement;