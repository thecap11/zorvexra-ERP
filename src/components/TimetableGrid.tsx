import React, { useState, useEffect } from 'react';
import { TimetableEntry, Subject } from '../types';

interface TimetableGridProps {
    entries: TimetableEntry[];
    subjects: Subject[]; // Phase 4A - will be used for dropdown in next step
    editable: boolean;
    onSave?: (entries: TimetableEntry[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
    { start: '09:30 AM', end: '10:20 AM' },
    { start: '10:20 AM', end: '11:10 AM' },
    { start: '11:10 AM', end: '12:00 PM' },
    { start: '12:00 PM', end: '12:50 PM' },
    // Lunch Break
    { start: '01:20 PM', end: '02:10 PM' },
    { start: '02:10 PM', end: '03:00 PM' },
    { start: '03:00 PM', end: '03:50 PM' },
    { start: '03:50 PM', end: '04:40 PM' },
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({
    entries,
    subjects, // Phase 4B: Now used for dropdown
    editable,
    onSave,
}) => {
    const [localEntries, setLocalEntries] = useState<TimetableEntry[]>(entries);
    const [editingCell, setEditingCell] = useState<{ day: string; periodIndex: number } | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [editType, setEditType] = useState('');

    useEffect(() => {
        setLocalEntries(entries);
    }, [entries]);

    const getEntry = (day: string, periodIndex: number) => {
        return localEntries.find(e => e.day === day && e.periodIndex === periodIndex);
    };

    const handleCellClick = (day: string, periodIndex: number) => {
        if (!editable) return;
        const entry = getEntry(day, periodIndex);
        setEditingCell({ day, periodIndex });
        setSelectedSubjectId(entry?.subjectId || '');
        setEditType(entry?.type || '');
    };

    const handleSaveCell = () => {
        if (!editingCell) return;

        const newEntries = localEntries.filter(
            e => !(e.day === editingCell.day && e.periodIndex === editingCell.periodIndex)
        );

        // Find selected subject to get name and ID
        const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

        if (selectedSubject) {
            newEntries.push({
                day: editingCell.day,
                periodIndex: editingCell.periodIndex,
                subject: selectedSubject.name, // Save subject name for display
                type: editType,
                subjectId: selectedSubject.id, // Save subject ID
            });
        }

        setLocalEntries(newEntries);
        setEditingCell(null);
        if (onSave) onSave(newEntries);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveCell();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
                {/* Header Row */}
                <div className="grid grid-cols-[100px_repeat(4,1fr)_50px_repeat(4,1fr)] gap-1 mb-1">
                    <div className="bg-slate-100 p-2 font-bold text-center border rounded">Day</div>
                    {PERIODS.slice(0, 4).map((p, i) => (
                        <div key={i} className="bg-slate-100 p-2 text-center border rounded text-sm">
                            <div className="font-bold">{p.start}</div>
                            <div className="text-xs text-slate-500">to {p.end}</div>
                        </div>
                    ))}
                    <div className="bg-orange-100 p-2 text-center border rounded font-bold text-orange-800 flex items-center justify-center writing-vertical-lr">
                        LUNCH
                    </div>
                    {PERIODS.slice(4).map((p, i) => (
                        <div key={i + 4} className="bg-slate-100 p-2 text-center border rounded text-sm">
                            <div className="font-bold">{p.start}</div>
                            <div className="text-xs text-slate-500">to {p.end}</div>
                        </div>
                    ))}
                </div>

                {/* Days Rows */}
                {DAYS.map(day => (
                    <div key={day} className="grid grid-cols-[100px_repeat(4,1fr)_50px_repeat(4,1fr)] gap-1 mb-1">
                        <div className="bg-slate-50 p-2 font-bold flex items-center justify-center border rounded">
                            {day}
                        </div>

                        {/* Morning Periods */}
                        {[0, 1, 2, 3].map(periodIndex => {
                            const entry = getEntry(day, periodIndex);
                            const isEditing = editingCell?.day === day && editingCell?.periodIndex === periodIndex;

                            return (
                                <div
                                    key={periodIndex}
                                    onClick={() => handleCellClick(day, periodIndex)}
                                    className={`
                                        border rounded p-2 min-h-[80px] flex flex-col justify-center items-center text-center cursor-pointer transition-colors
                                        ${isEditing ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white hover:bg-slate-50'}
                                    `}
                                >
                                    {isEditing ? (
                                        <div className="w-full space-y-2" onClick={e => e.stopPropagation()}>
                                            <select
                                                autoFocus
                                                className="w-full text-sm border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={selectedSubjectId}
                                                onChange={e => setSelectedSubjectId(e.target.value)}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} {subject.type === 'PREFERRED_GROUP' ? '(Elective)' : '(Normal)'}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                className="w-full text-xs border rounded px-1"
                                                placeholder="Type (T/P)"
                                                value={editType}
                                                onChange={e => setEditType(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                            />
                                            <div className="flex gap-1 justify-center mt-1">
                                                <button
                                                    onClick={handleSaveCell}
                                                    className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingCell(null)}
                                                    className="text-xs bg-gray-300 text-slate-700 px-2 py-0.5 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="font-medium text-sm">{entry?.subject || '-'}</div>
                                            {entry?.type && (
                                                <div className="text-xs text-slate-500 mt-1">({entry.type})</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}

                        {/* Lunch Break */}
                        <div className="bg-orange-50 border rounded flex items-center justify-center">
                            <div className="w-1 h-1 bg-orange-200 rounded-full"></div>
                        </div>

                        {/* Afternoon Periods */}
                        {[4, 5, 6, 7].map(periodIndex => {
                            const entry = getEntry(day, periodIndex);
                            const isEditing = editingCell?.day === day && editingCell?.periodIndex === periodIndex;

                            return (
                                <div
                                    key={periodIndex}
                                    onClick={() => handleCellClick(day, periodIndex)}
                                    className={`
                                        border rounded p-2 min-h-[80px] flex flex-col justify-center items-center text-center cursor-pointer transition-colors
                                        ${isEditing ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white hover:bg-slate-50'}
                                    `}
                                >
                                    {isEditing ? (
                                        <div className="w-full space-y-2" onClick={e => e.stopPropagation()}>
                                            <select
                                                autoFocus
                                                className="w-full text-sm border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={selectedSubjectId}
                                                onChange={e => setSelectedSubjectId(e.target.value)}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} {subject.type === 'PREFERRED_GROUP' ? '(Elective)' : '(Normal)'}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                className="w-full text-xs border rounded px-1"
                                                placeholder="Type (T/P)"
                                                value={editType}
                                                onChange={e => setEditType(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                            />
                                            <div className="flex gap-1 justify-center mt-1">
                                                <button
                                                    onClick={handleSaveCell}
                                                    className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingCell(null)}
                                                    className="text-xs bg-gray-300 text-slate-700 px-2 py-0.5 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="font-medium text-sm">{entry?.subject || '-'}</div>
                                            {entry?.type && (
                                                <div className="text-xs text-slate-500 mt-1">({entry.type})</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
