import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: 'gold' | 'purple' | 'green' | 'blue';
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    icon: Icon,
    color,
    className = ''
}) => {
    const colorStyles = {
        gold: { bg: 'bg-yellow-50', text: 'text-[#FACC15]' },
        purple: { bg: 'bg-purple-50', text: 'text-[#A78BFA]' },
        green: { bg: 'bg-green-50', text: 'text-[#22C55E]' },
        blue: { bg: 'bg-blue-50', text: 'text-[#3A5AFE]' },
    };

    const { bg, text } = colorStyles[color] || colorStyles.blue;

    return (
        <div className={`
            bg-gradient-to-br from-white to-[#F8FAFC] 
            rounded-2xl 
            border border-[#94A3B8] 
            shadow-sm 
            p-6 
            hover:border-[#3A5AFE] 
            hover:shadow-lg 
            transition-all duration-200 
            ${className}
        `}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-[#64748B] font-medium">{label}</p>
                    <p className="text-4xl font-bold text-[#0F172A] mt-2">{value}</p>
                </div>
                <div className={`${bg} p-4 rounded-xl`}>
                    <Icon className={`w-8 h-8 ${text}`} />
                </div>
            </div>
        </div>
    );
};
