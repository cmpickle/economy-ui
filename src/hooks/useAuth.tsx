import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types/api';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_data');
      
      if (token && storedUser) {
        try {
          // Set the token in the API service
          apiService.setToken(token);
          
          // Parse and set the stored user data
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Optionally verify the token is still valid by making a test request
          // You could add a /auth/verify endpoint to your API for this
          try {
            // Try to fetch fresh user data to ensure token is still valid
            const response = await apiService.getUser(userData.id);
            if (response.data) {
              setUser(response.data);
              localStorage.setItem('user_data', JSON.stringify(response.data));
            }
          } catch (error) {
            // If token is invalid, clear stored data
            console.warn('Token validation failed, clearing stored auth data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            apiService.logout();
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      if (response.data) {
        const { access_token, refresh_token, user: userData } = response.data;
        
        // Set token in API service
        apiService.setToken(access_token);
        
        // Store tokens and user data in localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Set user in state
        setUser(userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear API service token
    apiService.logout();
    
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    // Clear user state
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateUser(user.id, data);
      if (response.data) {
        setUser(response.data);
        // Update stored user data
        localStorage.setItem('user_data', JSON.stringify(response.data));
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};