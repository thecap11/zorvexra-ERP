import React, { useState, useRef, useEffect } from 'react';
import { Settings, Lock, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PersonalDetailsModal } from './PersonalDetailsModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { NotificationsHistoryModal } from './NotificationsHistoryModal';

export const ProfileDropdown: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showPersonalDetails, setShowPersonalDetails] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
            >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-700">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setShowPersonalDetails(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Personal Details
                    </button>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setShowChangePassword(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                        <Lock className="w-4 h-4 text-slate-400" />
                        Change Password
                    </button>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setShowNotifications(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                        <Bell className="w-4 h-4 text-slate-400" />
                        Notifications
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}

            {showPersonalDetails && (
                <PersonalDetailsModal
                    isOpen={showPersonalDetails}
                    onClose={() => setShowPersonalDetails(false)}
                />
            )}

            {showChangePassword && (
                <ChangePasswordModal
                    isOpen={showChangePassword}
                    onClose={() => setShowChangePassword(false)}
                />
            )}

            {showNotifications && (
                <NotificationsHistoryModal
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                />
            )}
        </div>
    );
};
