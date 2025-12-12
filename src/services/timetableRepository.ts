import { TimetableSlot, TimetableEntry } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * TimetableRepository - Handles timetable data operations with Supabase
 */
export class TimetableRepository {
    static async getTimetableByClassId(classId: string): Promise<TimetableSlot[][]> {
        const { data, error } = await supabase
            .from('timetable_slots')
            .select('*')
            .eq('class_id', classId)
            .order('period_index', { ascending: true });

        if (error) {
            console.error('Error fetching timetable:', error);
            return this.getEmptyTimetable();
        }

        if (!data || data.length === 0) {
            return this.getEmptyTimetable();
        }

        // Convert flat rows to 2D array [day][period]
        return this.convertToTimetableGrid(data);
    }

    /**
     * Get timetable for a specific day
     */
    static async getTimetableForDay(classId: string, dayName: string): Promise<TimetableEntry[]> {
        // Map day names to database day codes
        const dayMap: Record<string, string> = {
            'Sunday': 'SUN',
            'Monday': 'MON',
            'Tuesday': 'TUE',
            'Wednesday': 'WED',
            'Thursday': 'THU',
            'Friday': 'FRI',
            'Saturday': 'SAT'
        };

        const dayCode = dayMap[dayName];
        if (!dayCode) return [];

        const { data, error } = await supabase
            .from('timetable_slots')
            .select('*')
            .eq('class_id', classId)
            .eq('day_of_week', dayCode)
            .order('period_index', { ascending: true });

        if (error) {
            console.error('Error fetching timetable for day:', error);
            return [];
        }

        // Convert to TimetableEntry format
        return (data || []).map(slot => ({
            day: dayName,
            periodIndex: slot.period_index - 1, // Convert to 0-indexed
            subject: slot.subject_name,
            type: slot.subject_type,
        }));
    }

    /**
     * Get all timetable entries as a flat list (for export)
     */
    static async getTimetable(classId: string): Promise<TimetableEntry[]> {
        const dayCodeToName: Record<string, string> = {
            'SUN': 'Sunday',
            'MON': 'Monday',
            'TUE': 'Tuesday',
            'WED': 'Wednesday',
            'THU': 'Thursday',
            'FRI': 'Friday',
            'SAT': 'Saturday'
        };

        const { data, error } = await supabase
            .from('timetable_slots')
            .select('*')
            .eq('class_id', classId)
            .order('period_index', { ascending: true });

        if (error) {
            console.error('Error fetching timetable:', error);
            return [];
        }

        // Convert to TimetableEntry format
        return (data || []).map(slot => ({
            day: dayCodeToName[slot.day_of_week] || slot.day_of_week,
            periodIndex: slot.period_index - 1, // Convert to 0-indexed
            subject: slot.subject_name,
            type: slot.subject_type,
        }));
    }

    static async saveTimetableForClass(classId: string, timetable: TimetableSlot[][]): Promise<void> {
        // Delete existing timetable slots for this class
        await supabase
            .from('timetable_slots')
            .delete()
            .eq('class_id', classId);

        // Flatten 2D array to flat rows
        const flatSlots = this.flattenTimetableGrid(classId, timetable);

        if (flatSlots.length === 0) return;

        // Insert new slots
        const { error } = await supabase
            .from('timetable_slots')
            .insert(flatSlots);

        if (error) {
            console.error('Error saving timetable:', error);
            throw new Error(error.message);
        }
    }

    // Helper: Convert DB rows to 2D grid
    private static convertToTimetableGrid(slots: any[]): TimetableSlot[][] {
        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const grid: TimetableSlot[][] = [];

        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
            const daySlots: TimetableSlot[] = [];
            const day = days[dayIndex];

            for (let periodIndex = 1; periodIndex <= 9; periodIndex++) {
                const slot = slots.find(s =>
                    s.day_of_week === day && s.period_index === periodIndex
                );

                if (slot) {
                    daySlots.push({
                        dayOfWeek: slot.day_of_week,
                        periodIndex: slot.period_index,
                        timeStart: slot.time_start,
                        timeEnd: slot.time_end,
                        subjectName: slot.subject_name,
                        subjectType: slot.subject_type,
                    });
                } else {
                    // Empty slot
                    daySlots.push({
                        dayOfWeek: day,
                        periodIndex,
                        timeStart: this.getDefaultTime(periodIndex, 'start'),
                        timeEnd: this.getDefaultTime(periodIndex, 'end'),
                        subjectName: '',
                        subjectType: '',
                    });
                }
            }

            grid.push(daySlots);
        }

        return grid;
    }

    // Helper: Flatten 2D grid to DB rows
    private static flattenTimetableGrid(classId: string, timetable: TimetableSlot[][]): any[] {
        const flatSlots: any[] = [];

        timetable.forEach((daySlots, dayIndex) => {
            const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const day = days[dayIndex];

            daySlots.forEach(slot => {
                // Only save slots with subject names
                if (slot.subjectName && slot.subjectName.trim() !== '') {
                    flatSlots.push({
                        class_id: classId,
                        day_of_week: day,
                        period_index: slot.periodIndex,
                        time_start: slot.timeStart,
                        time_end: slot.timeEnd,
                        subject_name: slot.subjectName,
                        subject_type: slot.subjectType,
                    });
                }
            });
        });

        return flatSlots;
    }

    // Helper: Get default time for a period
    private static getDefaultTime(periodIndex: number, type: 'start' | 'end'): string {
        const times = [
            { start: '09:00', end: '09:50' },
            { start: '10:00', end: '10:50' },
            { start: '11:00', end: '11:50' },
            { start: '12:00', end: '12:50' },
            { start: '13:00', end: '13:50' },
            { start: '14:00', end: '14:50' },
            { start: '15:00', end: '15:50' },
            { start: '16:00', end: '16:50' },
            { start: '17:00', end: '17:50' },
        ];

        const time = times[periodIndex - 1] || times[0];
        return type === 'start' ? time.start : time.end;
    }

    // Helper: Get empty timetable grid
    private static getEmptyTimetable(): TimetableSlot[][] {
        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const grid: TimetableSlot[][] = [];

        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
            const daySlots: TimetableSlot[] = [];
            const day = days[dayIndex];

            for (let periodIndex = 1; periodIndex <= 9; periodIndex++) {
                daySlots.push({
                    dayOfWeek: day,
                    periodIndex,
                    timeStart: this.getDefaultTime(periodIndex, 'start'),
                    timeEnd: this.getDefaultTime(periodIndex, 'end'),
                    subjectName: '',
                    subjectType: '',
                });
            }

            grid.push(daySlots);
        }

        return grid;
    }
}
