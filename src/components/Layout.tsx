import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-slate-600">
                        © {new Date().getFullYear()} Zorvexra ERP. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};
