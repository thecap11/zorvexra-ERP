import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ViewModeSwitcher from './ViewModeSwitcher';
import { ProfileDropdown } from './ProfileDropdown';

export const Navbar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleHome = () => {
        if (user?.role === 'ADMIN') {
            navigate('/admin');
        } else if (user?.role === 'CR') {
            navigate('/cr');
        } else {
            navigate('/student');
        }
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-[#CBD5E1] shadow-sm transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-semibold text-[#0F172A]">Zorvexra ERP</h1>
                        <button
                            onClick={handleHome}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#475569] transition-all duration-200 hover:bg-[#F1F5F9] hover:text-[#0F172A] hover:shadow hover:scale-[1.03] active:scale-[0.97]"
                            title="Go to Dashboard"
                        >
                            <Home className="w-4 h-4 text-[#3A5AFE]" />
                            <span className="text-sm font-medium">Home</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <ViewModeSwitcher />
                        <ProfileDropdown />
                    </div>
                </div>
            </div>
        </nav>
    );
};
