import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
            {title && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};
