import { Task, TaskType } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * TaskRepository - Handles all task-related data operations with Supabase
 */
export class TaskRepository {
    static async createTask(taskInput: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
        const dbTask = this.mapToDB(taskInput as any);

        const { data, error } = await supabase
            .from('tasks')
            .insert([dbTask])
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            throw new Error(error.message);
        }

        return this.mapFromDB(data);
    }

    static async getTasksByClassId(classId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getTaskById(taskId: string): Promise<Task | undefined> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();

        if (error) {
            console.error('Error fetching task:', error);
            return undefined;
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    static async getTasksByType(classId: string, type: TaskType): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('class_id', classId)
            .eq('type', type)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks by type:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> {
        const dbUpdates = this.mapToDB(updates as any);

        const { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            return undefined;
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    static async deleteTask(taskId: string): Promise<boolean> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
            return false;
        }

        return true;
    }

    static async getAllTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all tasks:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    /**
     * Get attendance task for a specific date
     */
    static async getAttendanceTaskByDate(classId: string, date: string): Promise<Task | undefined> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('class_id', classId)
            .eq('type', 'ATTENDANCE')
            .eq('attendance_date', date)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching attendance task by date:', error);
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    /**
     * Create attendance task for a specific date
     */
    static async createAttendanceTaskForDate(
        classId: string,
        date: string,
        createdBy: string
    ): Promise<Task> {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const taskInput = {
            classId,
            title: `Attendance - ${formattedDate}`,
            description: 'Daily attendance',
            type: 'ATTENDANCE' as TaskType,
            createdBy,
            attendanceDate: date,
        };

        return this.createTask(taskInput);
    }

    /**
     * Get all attendance tasks for a class within a date range
     */
    static async getAttendanceTasksInRange(
        classId: string,
        startDate: string,
        endDate: string
    ): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('class_id', classId)
            .eq('type', 'ATTENDANCE')
            .gte('attendance_date', startDate)
            .lte('attendance_date', endDate)
            .order('attendance_date', { ascending: true });

        if (error) {
            console.error('Error fetching attendance tasks in range:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    /**
     * Get attendance task for a specific date and period
     */
    static async getAttendanceTaskByDateAndPeriod(
        classId: string,
        date: string,
        periodIndex: number
    ): Promise<Task | undefined> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('class_id', classId)
            .eq('type', 'ATTENDANCE')
            .eq('attendance_date', date)
            .eq('period_index', periodIndex)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching attendance task by date and period:', error);
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    /**
     * Create attendance task for a specific date and period
     */
    static async createAttendanceTaskForPeriod(
        classId: string,
        date: string,
        periodIndex: number,
        subject: string,
        createdBy: string
    ): Promise<Task> {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const taskInput = {
            classId,
            title: `Attendance - ${subject} (${formattedDate})`,
            description: `Attendance for ${subject}`,
            type: 'ATTENDANCE' as TaskType,
            createdBy,
            attendanceDate: date,
            periodIndex,
            subject,
        };

        return this.createTask(taskInput);
    }

    // Helper methods to convert between camelCase (app) and snake_case (DB)
    private static mapFromDB(dbTask: any): Task {
        const task: any = {
            id: dbTask.id,
            classId: dbTask.class_id,
            title: dbTask.title,
            description: dbTask.description,
            type: dbTask.type,
            createdBy: dbTask.created_by,
            createdAt: dbTask.created_at,
        };

        if (dbTask.start_date) task.startDate = dbTask.start_date;
        if (dbTask.due_date) task.dueDate = dbTask.due_date;
        if (dbTask.attendance_date) task.attendanceDate = dbTask.attendance_date;
        if (dbTask.period_index !== null && dbTask.period_index !== undefined) task.periodIndex = dbTask.period_index;
        if (dbTask.subject) task.subject = dbTask.subject;

        return task as Task;
    }

    private static mapToDB(task: any): any {
        const dbTask: any = {
            title: task.title,
            type: task.type,
        };

        if (task.id) dbTask.id = task.id;
        if (task.classId) dbTask.class_id = task.classId;
        if (task.description) dbTask.description = task.description;
        if (task.createdBy) dbTask.created_by = task.createdBy;
        if (task.startDate) dbTask.start_date = task.startDate;
        if (task.dueDate) dbTask.due_date = task.dueDate;
        if (task.attendanceDate) dbTask.attendance_date = task.attendanceDate;
        if (task.periodIndex !== null && task.periodIndex !== undefined) dbTask.period_index = task.periodIndex;
        if (task.subject) dbTask.subject = task.subject;

        return dbTask;
    }
}
