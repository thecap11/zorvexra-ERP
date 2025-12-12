import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Storage, STORAGE_KEYS } from './services/storage'
import { User } from './types'

// Debug utilities for development
declare global {
    interface Window {
        debugUsers: () => void;
        clearData: () => void;
    }
}

// Only add debug utilities in development
if (typeof window !== 'undefined') {
    window.debugUsers = () => {
        const users = Storage.get<User[]>(STORAGE_KEYS.USERS) || [];
        console.log('=== ALL USERS IN SYSTEM ===');
        console.table(users.map((u: User) => ({
            Name: u.name,
            Email: u.email,
            Password: u.password,
            Role: u.role,
            RollNo: u.rollNo || 'N/A'
        })));
        console.log('Total users:', users.length);
        console.log('\nTo clear all data and reset: localStorage.clear() then refresh');
    };

    window.clearData = () => {
        localStorage.clear();
        console.log('✅ All data cleared! Refresh the page to reload seed data.');
    };

    console.log('🔧 Debug utilities available:');
    console.log('  - debugUsers() - View all users and their credentials');
    console.log('  - clearData() - Clear all localStorage data');
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
