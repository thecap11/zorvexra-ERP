import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const variantColors = {
        danger: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-slide-in">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-6 border-l-4 ${variantColors[variant]}`}>
                    <p className="text-slate-700">{message}</p>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button variant="secondary" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
