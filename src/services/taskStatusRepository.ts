import { TaskStatus, TaskStatusValue, TaskType } from '../types';
import { supabase } from '../lib/supabaseClient';
import { UserRepository } from './userRepository';

/**
 * TaskStatusRepository - Handles all task status-related data operations with Supabase
 */
export class TaskStatusRepository {
    static async initializeTaskStatusesForTask(
        taskId: string,
        classId: string,
        type: TaskType
    ): Promise<TaskStatus[]> {
        console.log('Initializing task statuses for task:', taskId);

        // IMPORTANT: Check if statuses already exist to prevent duplicates/resets
        const existing = await this.getTaskStatusesByTask(taskId);
        if (existing.length > 0) {
            console.log(`Task statuses already initialized (${existing.length} statuses found), returning existing`);
            return existing;
        }

        console.log('No existing statuses found, creating new ones...');

        // For attendance tasks, include CRs; for assignments, only students
        const users = type === 'ATTENDANCE'
            ? await UserRepository.getStudentsAndCRsForAttendance(classId)
            : await UserRepository.getStudentsByClassId(classId);

        const defaultStatus = type === 'ASSIGNMENT' ? 'NOT_COMPLETED' : 'ABSENT';

        const statusesToInsert = users.map(user => ({
            task_id: taskId,
            student_id: user.id,
            status: defaultStatus,
        }));

        console.log(`Creating ${statusesToInsert.length} new task statuses...`);

        const { data, error } = await supabase
            .from('task_statuses')
            .insert(statusesToInsert)
            .select();

        if (error) {
            console.error('Error initializing task statuses:', error);
            throw new Error(error.message);
        }

        console.log('Task statuses created successfully');
        return data ? data.map(this.mapFromDB) : [];
    }

    static async getTaskStatusesByTask(taskId: string): Promise<TaskStatus[]> {
        const { data, error } = await supabase
            .from('task_statuses')
            .select('*')
            .eq('task_id', taskId);

        if (error) {
            console.error('Error fetching task statuses:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getTaskStatusesByStudent(studentId: string): Promise<TaskStatus[]> {
        const { data, error } = await supabase
            .from('task_statuses')
            .select('*')
            .eq('student_id', studentId);

        if (error) {
            console.error('Error fetching student statuses:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getTaskStatus(taskId: string, studentId: string): Promise<TaskStatus | undefined> {
        const { data, error } = await supabase
            .from('task_statuses')
            .select('*')
            .eq('task_id', taskId)
            .eq('student_id', studentId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching task status:', error);
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    static async updateTaskStatus(
        statusId: string,
        updates: Partial<TaskStatus>
    ): Promise<TaskStatus | undefined> {
        const dbUpdates = this.mapToDB(updates as any);

        const { data, error } = await supabase
            .from('task_statuses')
            .update(dbUpdates)
            .eq('id', statusId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task status:', error);
            return undefined;
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    static async updateTaskStatusByTaskAndStudent(
        taskId: string,
        studentId: string,
        status: TaskStatusValue,
        submittedAt?: string
    ): Promise<TaskStatus | undefined> {
        console.log('Updating task status:', { taskId, studentId, status });

        const updates: any = {
            status,
            submitted_at: submittedAt || (status === 'COMPLETED' || status === 'OTHER' ? new Date().toISOString() : null),
        };

        // First try to update existing record
        const { data, error } = await supabase
            .from('task_statuses')
            .update(updates)
            .eq('task_id', taskId)
            .eq('student_id', studentId)
            .select()
            .single();

        if (error) {
            console.log('Update failed, error:', error.code, error.message);

            // If no row found (PGRST116), try to insert instead
            if (error.code === 'PGRST116') {
                console.log('No existing status found, creating new one...');
                const { data: insertData, error: insertError } = await supabase
                    .from('task_statuses')
                    .insert({
                        task_id: taskId,
                        student_id: studentId,
                        status: status,
                        submitted_at: updates.submitted_at,
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error inserting task status:', insertError);
                    return undefined;
                }

                console.log('Created new status:', insertData);
                return insertData ? this.mapFromDB(insertData) : undefined;
            }

            console.error('Error updating task status:', error);
            return undefined;
        }

        console.log('Updated status successfully:', data);
        return data ? this.mapFromDB(data) : undefined;
    }

    static async updateTaskStatusWithRemarks(
        taskId: string,
        studentId: string,
        status: TaskStatusValue,
        remarks?: string
    ): Promise<TaskStatus | undefined> {
        console.log('Updating task status with remarks:', { taskId, studentId, status, remarks });

        const updates: any = {
            status,
            remarks: remarks || null,
            submitted_at: status === 'COMPLETED' || status === 'OTHER' ? new Date().toISOString() : null,
        };

        const { data, error } = await supabase
            .from('task_statuses')
            .update(updates)
            .eq('task_id', taskId)
            .eq('student_id', studentId)
            .select()
            .single();

        if (error) {
            console.log('Update with remarks failed, error:', error.code, error.message);

            // If no row found (PGRST116), try to insert instead
            if (error.code === 'PGRST116') {
                console.log('No existing status found, creating new one with remarks...');
                const { data: insertData, error: insertError } = await supabase
                    .from('task_statuses')
                    .insert({
                        task_id: taskId,
                        student_id: studentId,
                        status: status,
                        remarks: remarks || null,
                        submitted_at: updates.submitted_at,
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error inserting task status with remarks:', insertError);
                    return undefined;
                }

                console.log('Created new status with remarks:', insertData);
                return insertData ? this.mapFromDB(insertData) : undefined;
            }

            console.error('Error updating task status with remarks:', error);
            return undefined;
        }

        console.log('Updated status with remarks successfully:', data);
        return data ? this.mapFromDB(data) : undefined;
    }

    static async bulkUpdateTaskStatuses(
        taskId: string,
        status: TaskStatusValue
    ): Promise<TaskStatus[]> {
        const { data, error } = await supabase
            .from('task_statuses')
            .update({ status })
            .eq('task_id', taskId)
            .select();

        if (error) {
            console.error('Error bulk updating task statuses:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getAllTaskStatuses(): Promise<TaskStatus[]> {
        const { data, error } = await supabase
            .from('task_statuses')
            .select('*');

        if (error) {
            console.error('Error fetching all task statuses:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    /**
     * Delete all task statuses for a specific student
     * Used when removing a student from the system
     */
    static async deleteStatusesByStudentId(studentId: string): Promise<number> {
        const { data, error } = await supabase
            .from('task_statuses')
            .delete()
            .eq('student_id', studentId)
            .select();

        if (error) {
            console.error('Error deleting statuses by student:', error);
            return 0;
        }

        return data ? data.length : 0;
    }

    /**
     * Initialize task statuses for a new student across all existing tasks in their class
     * Used when adding a new student to the system
     */
    static async initializeStatusesForNewStudent(
        studentId: string,
        classId: string
    ): Promise<TaskStatus[]> {
        const { TaskRepository } = await import('./taskRepository');
        const tasks = await TaskRepository.getTasksByClassId(classId);

        const statusesToInsert = tasks.map(task => ({
            task_id: task.id,
            student_id: studentId,
            status: task.type === 'ASSIGNMENT' ? 'NOT_COMPLETED' : 'ABSENT',
        }));

        if (statusesToInsert.length === 0) {
            return [];
        }

        const { data, error } = await supabase
            .from('task_statuses')
            .insert(statusesToInsert)
            .select();

        if (error) {
            console.error('Error initializing statuses for new student:', error);
            throw new Error(error.message);
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    // Helper methods to convert between camelCase (app) and snake_case (DB)
    private static mapFromDB(dbStatus: any): TaskStatus {
        return {
            id: dbStatus.id,
            taskId: dbStatus.task_id,
            studentId: dbStatus.student_id,
            status: dbStatus.status,
            remarks: dbStatus.remarks,
            submittedAt: dbStatus.submitted_at,
        };
    }

    private static mapToDB(status: any): any {
        const dbStatus: any = {};

        if (status.id) dbStatus.id = status.id;
        if (status.taskId) dbStatus.task_id = status.taskId;
        if (status.studentId) dbStatus.student_id = status.studentId;
        if (status.status) dbStatus.status = status.status;
        if (status.remarks !== undefined) dbStatus.remarks = status.remarks;
        if (status.submittedAt !== undefined) dbStatus.submitted_at = status.submittedAt;

        return dbStatus;
    }
}
