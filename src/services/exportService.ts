import { utils, writeFile } from 'xlsx';
import { TaskRepository } from './taskRepository';
import { TaskStatusRepository } from './taskStatusRepository';
import { UserRepository } from './userRepository';
import { TimetableRepository } from './timetableRepository';
import { TimetableEntry, TaskStatus } from '../types';

export class ExportService {
    static async generateWeeklyAttendanceExport(
        classId: string,
        weekNumber: number,
        month: number, // 0-11
        year: number
    ): Promise<void> {
        try {
            console.log('Starting export with params:', { classId, weekNumber, month, year });

            // 1. Calculate Date Range
            let startDay = (weekNumber - 1) * 7 + 1;
            let endDay = weekNumber * 7;

            const daysInMonth = new Date(year, month + 1, 0).getDate();
            if (weekNumber === 4) endDay = daysInMonth;

            const startDate = new Date(year, month, startDay);
            const endDate = new Date(year, month, endDay);

            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            console.log('Date range:', startDateStr, 'to', endDateStr);

            // 2. Fetch Data
            const students = await UserRepository.getStudentsByClassId(classId);
            console.log('Students found:', students.length);

            if (students.length === 0) {
                throw new Error('No students found for this class');
            }

            students.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));

            const timetable = await TimetableRepository.getTimetable(classId);
            console.log('Timetable entries:', timetable.length);

            const tasks = await TaskRepository.getAttendanceTasksInRange(classId, startDateStr, endDateStr);
            console.log('Attendance tasks found:', tasks.length);

            // 3. OPTIMIZATION: Fetch ALL task statuses upfront in one batch
            const allStatuses: Map<string, TaskStatus[]> = new Map();
            for (const task of tasks) {
                const statuses = await TaskStatusRepository.getTaskStatusesByTask(task.id);
                allStatuses.set(task.id, statuses);
            }
            console.log('Pre-fetched statuses for', allStatuses.size, 'tasks');

            // 4. Prepare Data for Sheet
            const sheetData: (string | number | null)[][] = [];

            // 5. Generate Data Blocks Per Date
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const currentDateStr = d.toISOString().split('T')[0];
                const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

                const dayEntries = timetable.filter((t: TimetableEntry) => t.day === dayName);

                // Row A: Date
                sheetData.push([`Date: ${currentDateStr}`]);

                // Row B: Headers (No Date Column)
                const headers = ['Roll No', 'Student Name'];
                for (let p = 0; p < 9; p++) {
                    const entry = dayEntries.find((e: TimetableEntry) => e.periodIndex === p);
                    headers.push(entry ? entry.subject : '-');
                }
                sheetData.push(headers);

                // Rows C+: Student Data
                for (const student of students) {
                    const row: (string | number | null)[] = [
                        student.rollNo || '',
                        student.name
                    ];

                    for (let p = 0; p < 9; p++) {
                        const entry = dayEntries.find((e: TimetableEntry) => e.periodIndex === p);

                        if (!entry) {
                            row.push('-');
                            continue;
                        }

                        const task = tasks.find(t =>
                            (t.attendanceDate === currentDateStr || t.createdAt.startsWith(currentDateStr)) &&
                            t.periodIndex === p
                        );

                        if (!task) {
                            row.push('');
                        } else {
                            // Use pre-fetched statuses instead of DB call
                            const statuses = allStatuses.get(task.id) || [];
                            const studentStatus = statuses.find(s => s.studentId === student.id);

                            if (studentStatus?.status === 'PRESENT') row.push('P');
                            else if (studentStatus?.status === 'ABSENT') row.push('A');
                            else row.push('');
                        }
                    }
                    sheetData.push(row);
                }

                // Spacer between dates
                sheetData.push([]);
            }

            console.log('Sheet data rows:', sheetData.length);

            // 6. Create Workbook and Download
            const wb = utils.book_new();
            const ws = utils.aoa_to_sheet(sheetData);

            const wscols = [
                { wch: 12 }, // Roll No
                { wch: 20 }, // Name
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, // Periods
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
            ws['!cols'] = wscols;

            utils.book_append_sheet(wb, ws, `Week_${weekNumber}_Attendance`);

            const filename = `Week_${weekNumber}_Attendance.xlsx`;
            console.log('Writing file:', filename);

            writeFile(wb, filename);
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export error details:', error);
            throw error; // Re-throw to be caught by the caller
        }
    }
}
