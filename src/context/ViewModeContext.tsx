import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export type ViewMode = 'CR' | 'STUDENT';

interface ViewModeContextType {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    canSwitchView: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (!context) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
};

interface ViewModeProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = 'zorvexra_view_mode';

export const ViewModeProvider: React.FC<ViewModeProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Initialize from localStorage or default to 'CR' for CR users
    const [viewMode, setViewModeState] = useState<ViewMode>(() => {
        if (user?.role !== 'CR') return 'STUDENT';
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored === 'CR' || stored === 'STUDENT') ? stored : 'CR';
    });

    // Only CR users can switch views
    const canSwitchView = user?.role === 'CR';

    // Reset to appropriate mode when user changes
    useEffect(() => {
        if (!user) return;

        if (user.role === 'STUDENT') {
            setViewModeState('STUDENT');
        } else if (user.role === 'CR') {
            const stored = localStorage.getItem(STORAGE_KEY);
            setViewModeState((stored === 'CR' || stored === 'STUDENT') ? stored : 'CR');
        }
    }, [user]);

    const setViewMode = (mode: ViewMode) => {
        if (!canSwitchView && mode !== 'STUDENT') return;

        setViewModeState(mode);
        localStorage.setItem(STORAGE_KEY, mode);

        // Navigate to appropriate dashboard
        if (mode === 'CR') {
            navigate('/cr/dashboard');
        } else {
            navigate('/student/dashboard');
        }
    };

    return (
        <ViewModeContext.Provider value={{ viewMode, setViewMode, canSwitchView }}>
            {children}
        </ViewModeContext.Provider>
    );
};
