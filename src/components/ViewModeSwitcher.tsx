import React from 'react';
import { useViewMode } from '../context/ViewModeContext';

const ViewModeSwitcher: React.FC = () => {
    const { viewMode, setViewMode, canSwitchView } = useViewMode();

    // Only show for CR users
    if (!canSwitchView) return null;

    return (
        <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
            <button
                onClick={() => setViewMode('CR')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'CR'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
            >
                CR View
            </button>
            <button
                onClick={() => setViewMode('STUDENT')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'STUDENT'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
            >
                Student View
            </button>
        </div>
    );
};

export default ViewModeSwitcher;
