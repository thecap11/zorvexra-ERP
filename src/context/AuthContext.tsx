import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials } from '../types';
import { UserRepository } from '../services/userRepository';
import { Storage, STORAGE_KEYS } from '../services/storage';

interface AuthContextType {
    user: AuthUser | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = Storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                try {
                    const userData = await UserRepository.getUserById(token);
                    if (userData) {
                        console.log('Session restored for user:', userData.name, 'classId:', userData.classId);
                        setUser({
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                            role: userData.role,
                            rollNo: userData.rollNo,
                            classId: userData.classId,
                            preferredLanguage: userData.preferredLanguage,
                        });
                    }
                } catch (error) {
                    console.error('Error checking auth:', error);
                    Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            console.log('Login attempt for:', credentials.email);
            const userData = await UserRepository.getUserByEmail(credentials.email);

            console.log('User data found:', userData ? 'Yes' : 'No');
            if (userData) {
                console.log('User role:', userData.role);
                console.log('Password match:', userData.password === credentials.password);
            }

            if (!userData) {
                console.log('Login failed: User not found');
                return false;
            }

            // Simple password check (password field from Supabase, not hashed in prototype)
            if (userData.password !== credentials.password) {
                console.log('Login failed: Password mismatch');
                return false;
            }

            const authUser: AuthUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                rollNo: userData.rollNo,
                classId: userData.classId,
                preferredLanguage: userData.preferredLanguage,
            };

            console.log('Login successful for:', authUser.name, 'Role:', authUser.role);
            setUser(authUser);
            Storage.set(STORAGE_KEYS.AUTH_TOKEN, userData.id);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
