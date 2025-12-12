import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    markedDates?: { date: string; status: 'full' | 'partial' | 'none' }[];
    getDateClassName?: (date: Date) => string;
}

export const Calendar: React.FC<CalendarProps> = ({
    selectedDate,
    onDateSelect,
    markedDates = [],
    getDateClassName,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const formatDateKey = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const getDateStatus = (date: Date) => {
        const dateKey = formatDateKey(date);
        const marked = markedDates.find(m => m.date === dateKey);
        return marked?.status;
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="aspect-square" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const status = getDateStatus(date);
            const today = isToday(date);
            const selected = isSelected(date);

            const customClass = getDateClassName ? getDateClassName(date) : '';

            days.push(
                <button
                    key={day}
                    onClick={() => onDateSelect(date)}
                    className={`
                        aspect-square p-2 rounded-lg transition-all relative
                        ${customClass}
                        ${selected ? 'ring-2 ring-primary-600 font-bold shadow-lg z-10' : ''}
                        ${today && !selected ? 'font-semibold' : ''}
                        ${!selected && !today ? 'hover:bg-slate-100' : ''}
                    `}
                >
                    <span className="text-sm">{day}</span>
                    {status && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${status === 'full'
                                    ? 'bg-green-500'
                                    : status === 'partial'
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                            />
                        </div>
                    )}
                </button>
            );
        }

        return days;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Previous month"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Next month"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-slate-600">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-600">All Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-slate-600">Partial</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-600">All Absent</span>
                </div>
            </div>
        </div>
    );
};
