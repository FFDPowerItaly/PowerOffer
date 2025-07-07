import { Mail } from 'lucide-react';
import { User, UserActivity } from '../types';

// Demo users per il sistema
const demoUsers: User[] = [
  {
    id: '1',
    username: 'marco.rossi@ffdpower.it',
    email: 'marco.rossi@ffdpower.it',
    fullName: 'Marco Rossi',
    role: 'commerciale',
    department: 'Vendite Nord Italia',
    phone: '+39 02 1234567',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-12-20'),
    avatar: 'MR'
  },
  {
    id: '2',
    username: 'giulia.bianchi@ffdpower.it',
    email: 'giulia.bianchi@ffdpower.it',
    fullName: 'Giulia Bianchi',
    role: 'commerciale',
    department: 'Vendite Centro-Sud Italia',
    phone: '+39 06 7654321',
    isActive: true,
    createdAt: new Date('2024-02-10'),
    lastLogin: new Date('2024-12-19'),
    avatar: 'GB'
  },
  {
    id: '3',
    username: 'andrea.ferrari@ffdpower.it',
    email: 'andrea.ferrari@ffdpower.it',
    fullName: 'Andrea Ferrari',
    role: 'manager',
    department: 'Sales Management',
    phone: '+39 011 9876543',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-20'),
    avatar: 'AF'
  },
  {
    id: '4',
    username: 'admin@ffdpower.it',
    email: 'admin@ffdpower.it',
    fullName: 'Amministratore Sistema',
    role: 'admin',
    department: 'IT',
    phone: '+39 02 0000000',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-20'),
    avatar: 'AD'
  },
  {
    id: '5',
    username: 'luca.verdi@ffdpower.it',
    email: 'luca.verdi@ffdpower.it',
    fullName: 'Luca Verdi',
    role: 'commerciale',
    department: 'Vendite Utility Scale',
    phone: '+39 02 5555555',
    isActive: true,
    createdAt: new Date('2024-03-01'),
    lastLogin: new Date('2024-12-18'),
    avatar: 'LV'
  },
  {
    id: '6',
    username: 'sara.neri@ffdpower.it',
    email: 'sara.neri@ffdpower.it',
    fullName: 'Sara Neri',
    role: 'commerciale',
    department: 'Vendite Residenziale',
    phone: '+39 02 4444444',
    isActive: false, // Utente disabilitato
    createdAt: new Date('2024-04-15'),
    lastLogin: new Date('2024-11-30'),
    avatar: 'SN'
  }
];

class AuthService {
  private currentUser: User | null = null;
  private activities: UserActivity[] = [];
  private users: User[] = [...demoUsers];

  constructor() {
    // Carica utenti da localStorage se disponibili
    this.loadUsersFromStorage();
  }

  // Carica utenti da localStorage
  private loadUsersFromStorage(): void {
    try {
      const stored = localStorage.getItem('ffd_users');
      if (stored) {
        const users = JSON.parse(stored);
        // Converti le date da string a Date objects
        this.users = users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        }));
      }
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
      this.users = [...demoUsers];
    }
  }

  // Salva utenti in localStorage
  private saveUsersToStorage(): void {
    try {
      localStorage.setItem('ffd_users', JSON.stringify(this.users));
    } catch (error) {
      console.error('Errore salvataggio utenti:', error);
    }
  }

  // Simula login
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simula delay di rete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Cerca per email invece che per username
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'Email non trovata' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account disabilitato. Contatta l\'amministratore.' };
    }

    // Per demo, accetta qualsiasi password non vuota
    if (!password || password.length < 6) {
      return { success: false, error: 'Password deve essere di almeno 6 caratteri' };
    }

    // Aggiorna ultimo login
    user.lastLogin = new Date();
    this.currentUser = user;

    // Aggiorna nell'array e salva
    const userIndex = this.users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      this.users[userIndex] = user;
      this.saveUsersToStorage();
    }

    // Registra attività
    this.logActivity(user.id, 'login', `Login effettuato da ${user.fullName}`);

    // Salva in localStorage
    localStorage.setItem('ffd_current_user', JSON.stringify(user));
    localStorage.setItem('ffd_auth_token', `token_${user.id}_${Date.now()}`);

    return { success: true, user };
  }

  // Logout
  async logout(): Promise<void> {
    if (this.currentUser) {
      this.logActivity(this.currentUser.id, 'logout', `Logout effettuato da ${this.currentUser.fullName}`);
    }

    this.currentUser = null;
    localStorage.removeItem('ffd_current_user');
    localStorage.removeItem('ffd_auth_token');
  }

  // Verifica se utente è autenticato
  isAuthenticated(): boolean {
    return this.currentUser !== null || this.loadUserFromStorage() !== null;
  }

  // Ottieni utente corrente
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    return this.loadUserFromStorage();
  }

  // Carica utente da localStorage
  private loadUserFromStorage(): User | null {
    try {
      const userData = localStorage.getItem('ffd_current_user');
      const token = localStorage.getItem('ffd_auth_token');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        
        // Verifica che l'utente sia ancora attivo
        const currentUserData = this.users.find(u => u.id === user.id);
        if (currentUserData && currentUserData.isActive) {
          this.currentUser = currentUserData;
          return currentUserData;
        } else {
          // Utente disabilitato, rimuovi sessione
          this.logout();
          return null;
        }
      }
    } catch (error) {
      console.error('Errore caricamento utente:', error);
    }
    return null;
  }

  // Ottieni tutti gli utenti (solo per admin/manager)
  getAllUsers(): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
      return [];
    }
    return this.users;
  }

  // Ottieni utente per ID
  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // Abilita/Disabilita utente (solo admin)
  toggleUserStatus(userId: string, isActive: boolean): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return false;
    }

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    // Non permettere di disabilitare se stesso
    if (userId === currentUser.id) {
      return false;
    }

    this.users[userIndex].isActive = isActive;
    this.saveUsersToStorage();

    // Log attività
    this.logActivity(
      currentUser.id,
      'update_user',
      `Utente ${this.users[userIndex].fullName} ${isActive ? 'abilitato' : 'disabilitato'}`,
      { targetUserId: userId, action: isActive ? 'enable' : 'disable' }
    );

    return true;
  }

  // Aggiorna dati utente (solo admin)
  updateUser(userId: string, updates: Partial<User>): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return false;
    }

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    // Non permettere di modificare il proprio ruolo
    if (userId === currentUser.id && updates.role && updates.role !== currentUser.role) {
      return false;
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsersToStorage();

    // Log attività
    this.logActivity(
      currentUser.id,
      'update_user',
      `Dati utente ${this.users[userIndex].fullName} aggiornati`,
      { targetUserId: userId, updates }
    );

    return true;
  }

  // Crea nuovo utente (solo admin)
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return null;
    }

    // Verifica che username non esista già
    if (this.users.some(u => u.email === userData.email)) {
      return null;
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.users.push(newUser);
    this.saveUsersToStorage();

    // Log attività
    this.logActivity(
      currentUser.id,
      'create_user',
      `Nuovo utente creato: ${newUser.fullName}`,
      { newUserId: newUser.id }
    );

    return newUser;
  }

  // Elimina utente (solo admin)
  deleteUser(userId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return false;
    }

    // Non permettere di eliminare se stesso
    if (userId === currentUser.id) {
      return false;
    }

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    this.saveUsersToStorage();

    // Log attività
    this.logActivity(
      currentUser.id,
      'delete_user',
      `Utente eliminato: ${deletedUser.fullName}`,
      { deletedUserId: userId }
    );

    return true;
  }

  // Registra attività utente
  logActivity(userId: string, action: UserActivity['action'], description: string, metadata?: any): void {
    const activity: UserActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      description,
      timestamp: new Date(),
      metadata
    };

    this.activities.push(activity);

    // Mantieni solo le ultime 1000 attività
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);
    }

    // Salva in localStorage
    localStorage.setItem('ffd_user_activities', JSON.stringify(this.activities));
  }

  // Ottieni attività utente
  getUserActivities(userId?: string, limit: number = 50): UserActivity[] {
    // Carica attività da localStorage
    try {
      const stored = localStorage.getItem('ffd_user_activities');
      if (stored) {
        this.activities = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Errore caricamento attività:', error);
    }

    let filtered = this.activities;
    
    if (userId) {
      filtered = filtered.filter(a => a.userId === userId);
    }

    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Ottieni statistiche utente
  getUserStats(userId: string): {
    totalQuotes: number;
    quotesThisMonth: number;
    totalValue: number;
    lastActivity: Date | null;
  } {
    const activities = this.getUserActivities(userId);
    const quoteActivities = activities.filter(a => a.action === 'create_quote');
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const quotesThisMonth = quoteActivities.filter(a => new Date(a.timestamp) >= thisMonth);

    return {
      totalQuotes: quoteActivities.length,
      quotesThisMonth: quotesThisMonth.length,
      totalValue: quoteActivities.reduce((sum, a) => sum + (a.metadata?.totalAmount || 0), 0),
      lastActivity: activities.length > 0 ? new Date(activities[0].timestamp) : null
    };
  }

  // Verifica permessi
  hasPermission(action: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.isActive) return false;

    switch (action) {
      case 'view_all_quotes':
        return user.role === 'admin' || user.role === 'manager';
      case 'manage_users':
        return user.role === 'admin';
      case 'view_analytics':
        return user.role === 'admin' || user.role === 'manager';
      case 'create_quote':
      case 'edit_own_quotes':
        return true; // Tutti gli utenti autenticati
      default:
        return false;
    }
  }

  // Ottieni statistiche sistema utenti
  getUsersStats(): {
    total: number;
    active: number;
    inactive: number;
    byRole: { [key: string]: number };
    byDepartment: { [key: string]: number };
  } {
    const stats = {
      total: this.users.length,
      active: this.users.filter(u => u.isActive).length,
      inactive: this.users.filter(u => !u.isActive).length,
      byRole: {} as { [key: string]: number },
      byDepartment: {} as { [key: string]: number }
    };

    this.users.forEach(user => {
      // Statistiche per ruolo
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      
      // Statistiche per dipartimento
      stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
    });

    return stats;
  }
}

export const authService = new AuthService();
export default authService;