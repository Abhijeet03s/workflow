import { UserRole } from './types'

export interface AuthUser {
  email: string
  name: string
  role: UserRole
}

// Hardcoded credentials
const CREDENTIALS = {
  manager: {
    email: 'manager@company.com',
    password: 'manager123',
    name: 'John Manager',
    role: 'manager' as UserRole
  },
  cct: [
    { email: 'priya@company.com', password: 'cct123', name: 'Priya Sharma', role: 'cct' as UserRole },
    { email: 'amit@company.com', password: 'cct123', name: 'Amit Mehta', role: 'cct' as UserRole },
    { email: 'sarah@company.com', password: 'cct123', name: 'Sarah Johnson', role: 'cct' as UserRole },
    { email: 'vikram@company.com', password: 'cct123', name: 'Vikram Patel', role: 'cct' as UserRole },
    { email: 'karan@company.com', password: 'cct123', name: 'Karan Singh', role: 'cct' as UserRole },
    { email: 'deepak@company.com', password: 'cct123', name: 'Deepak Kumar', role: 'cct' as UserRole },
    { email: 'neha@company.com', password: 'cct123', name: 'Neha Verma', role: 'cct' as UserRole },
    { email: 'maya@company.com', password: 'cct123', name: 'Maya Reddy', role: 'cct' as UserRole },
    { email: 'rajesh@company.com', password: 'cct123', name: 'Rajesh Nair', role: 'cct' as UserRole },
    { email: 'alex@company.com', password: 'cct123', name: 'Alex Thompson', role: 'cct' as UserRole },
    { email: 'rohit@company.com', password: 'cct123', name: 'Rohit Sharma', role: 'cct' as UserRole },
    { email: 'ananya@company.com', password: 'cct123', name: 'Ananya Gupta', role: 'cct' as UserRole }
  ],
  // Client credentials will be dynamic based on created clients
  clientPassword: 'client123'
}

class Auth {
  private readonly SESSION_KEY = 'workflow-session'

  // Login methods
  loginManager(email: string, password: string): boolean {
    if (email === CREDENTIALS.manager.email && password === CREDENTIALS.manager.password) {
      this.setSession({
        email: CREDENTIALS.manager.email,
        name: CREDENTIALS.manager.name,
        role: CREDENTIALS.manager.role
      })
      return true
    }
    return false
  }

  loginCCT(email: string, password: string): boolean {
    const cctUser = CREDENTIALS.cct.find(u => u.email === email && u.password === password)
    if (cctUser) {
      this.setSession({
        email: cctUser.email,
        name: cctUser.name,
        role: cctUser.role
      })
      return true
    }
    return false
  }

  loginClient(email: string, password: string): boolean {
    // Check against dynamic client data
    if (typeof window === 'undefined') return false

    const { dataStore } = require('./data-store')
    const client = dataStore.getClientByEmail(email)

    if (client && password === CREDENTIALS.clientPassword) {
      this.setSession({
        email: client.email,
        name: client.ownerName,
        role: 'client' as UserRole
      })
      return true
    }
    return false
  }

  // Generic login that determines role
  login(email: string, password: string): { success: boolean; role?: UserRole } {
    // Try manager
    if (this.loginManager(email, password)) {
      return { success: true, role: 'manager' }
    }

    // Try CCT
    if (this.loginCCT(email, password)) {
      return { success: true, role: 'cct' }
    }

    // Try client
    if (this.loginClient(email, password)) {
      return { success: true, role: 'client' }
    }

    return { success: false }
  }

  // Session management
  private setSession(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user))
      localStorage.setItem('userRole', user.role)
      localStorage.setItem('currentUser', user.email)
    }
  }

  getSession(): AuthUser | null {
    if (typeof window === 'undefined') return null

    const sessionData = localStorage.getItem(this.SESSION_KEY)
    if (!sessionData) return null

    try {
      return JSON.parse(sessionData)
    } catch {
      return null
    }
  }

  getCurrentUser(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('currentUser')
  }

  getUserRole(): UserRole | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('userRole') as UserRole | null
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  hasRole(role: UserRole): boolean {
    const session = this.getSession()
    return session?.role === role
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
      localStorage.removeItem('userRole')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentClient')
    }
  }

  // Get client-specific data for client portal
  getCurrentClient() {
    if (!this.hasRole('client')) return null

    const session = this.getSession()
    if (!session) return null

    const { dataStore } = require('./data-store')
    return dataStore.getClientByEmail(session.email)
  }
}

export const auth = new Auth()