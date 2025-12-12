import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { GraduationCap, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login({ email, password });

        if (success) {
            // Navigation will be handled by the router based on user role
            navigate('/');
        } else {
            setError('Invalid email or password');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
                        <GraduationCap className="w-12 h-12 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Zorvexra ERP</h1>
                    <p className="text-blue-100">Manage your class efficiently</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-in">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </div>

                {/* Copyright Footer */}
                <div className="text-center mt-6 animate-fade-in">
                    <p className="text-blue-100 text-sm">
                        © {new Date().getFullYear()} Zorvexra ERP. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};
