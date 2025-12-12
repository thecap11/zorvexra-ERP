import React from 'react';

interface BadgeProps {
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
    const variantClasses = {
        success: 'bg-green-100 text-green-700',
        danger: 'bg-red-100 text-red-700',
        warning: 'bg-orange-100 text-orange-700',
        info: 'bg-blue-100 text-blue-700',
        default: 'bg-slate-100 text-slate-700',
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]
                } ${className}`}
        >
            {children}
        </span>
    );
};
