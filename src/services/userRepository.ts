import { User } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * UserRepository - Handles all user-related data operations with Supabase
 */
export class UserRepository {
    static async getUserByEmail(email: string): Promise<User | undefined> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error) {
            console.error('Error fetching user by email:', error);
            return undefined;
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    static async getUserById(userId: string): Promise<User | undefined> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user by ID:', error);
            return undefined;
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    static async createUser(user: User): Promise<User> {
        const dbUser = this.mapToDB(user);

        const { data, error } = await supabase
            .from('users')
            .insert([dbUser])
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            throw new Error(error.message);
        }

        return this.mapFromDB(data);
    }

    static async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
        const dbUpdates = this.mapToDB(updates as any);

        const { data, error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return undefined;
        }

        return data ? this.mapFromDB(data) : undefined;
    }

    static async getAllUsers(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching all users:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getStudentsByClassId(classId: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('class_id', classId)
            .eq('role', 'STUDENT')
            .order('roll_no', { ascending: true, nullsFirst: false });

        if (error) {
            console.error('Error fetching students:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getStudentsAndCRsForAttendance(classId: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('class_id', classId)
            .in('role', ['STUDENT', 'CR'])
            .order('roll_no', { ascending: true, nullsFirst: false });

        if (error) {
            console.error('Error fetching students and CRs for attendance:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getUsersByClassId(classId: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('class_id', classId)
            .order('role', { ascending: false }); // CRs first, then students

        if (error) {
            console.error('Error fetching users by class:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    static async getCRsByClassId(classId: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('class_id', classId)
            .eq('role', 'CR');

        if (error) {
            console.error('Error fetching CRs:', error);
            return [];
        }

        return data ? data.map(this.mapFromDB) : [];
    }

    /**
     * Delete a user by ID
     */
    static async deleteUser(userId: string): Promise<boolean> {
        const { error } = await supabase.from('users').delete().eq('id', userId);

        if (error) {
            console.error('Error deleting user:', error);
            return false;
        }

        return true;
    }

    /**
     * Change a user's password (admin function)
     */
    static async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
        const { error } = await supabase
            .from('users')
            .update({ password: newPassword })
            .eq('id', userId);

        if (error) {
            console.error('Error changing user password:', error);
            return false;
        }

        return true;
    }

    static async changeUserRole(userId: string, newRole: 'CR' | 'STUDENT'): Promise<User | undefined> {
        // Protect primary CR from being demoted
        if (userId === 'cr-primary' && newRole === 'STUDENT') {
            throw new Error('Cannot demote the primary CR account');
        }

        return this.updateUser(userId, { role: newRole });
    }

    static async isEmailUnique(email: string, excludeUserId?: string): Promise<boolean> {
        let query = supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase());

        if (excludeUserId) {
            query = query.neq('id', excludeUserId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error checking email uniqueness:', error);
            return false;
        }

        return !data || data.length === 0;
    }

    static async isRollNoUnique(classId: string, rollNo: string, excludeUserId?: string): Promise<boolean> {
        let query = supabase
            .from('users')
            .select('id')
            .eq('class_id', classId)
            .eq('roll_no', rollNo);

        if (excludeUserId) {
            query = query.neq('id', excludeUserId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error checking roll number uniqueness:', error);
            return false;
        }

        return !data || data.length === 0;
    }

    static async createStudent(studentData: Omit<User, 'id'>): Promise<User> {
        // Validate email uniqueness
        const emailUnique = await this.isEmailUnique(studentData.email);
        if (!emailUnique) {
            throw new Error('Email already exists');
        }

        // Validate roll number uniqueness
        if (studentData.rollNo) {
            const rollNoUnique = await this.isRollNoUnique(studentData.classId, studentData.rollNo);
            if (!rollNoUnique) {
                throw new Error('Roll number already exists in this class');
            }
        }

        // Supabase will generate UUID automatically
        return this.createUser(studentData as User);
    }

    static isPrimaryCR(userId: string): boolean {
        return userId === 'cr-primary';
    }

    /**
     * Update user's preferred language
     */
    static async updatePreferredLanguage(
        userId: string,
        language: 'GERMAN' | 'FRENCH' | null
    ): Promise<User | undefined> {
        return this.updateUser(userId, { preferredLanguage: language });
    }

    /**
     * Get students and CRs filtered by language for attendance
     * If subject is a language period, only return students with matching preference
     * Can also accept direct language values: 'GERMAN' or 'FRENCH'
     */
    static async getStudentsAndCRsForAttendanceFiltered(
        classId: string,
        subjectOrLanguage: string
    ): Promise<User[]> {
        const allUsers = await this.getStudentsAndCRsForAttendance(classId);

        // Check if we received a direct language value
        const upperValue = subjectOrLanguage.toUpperCase();
        if (upperValue === 'GERMAN' || upperValue === 'FRENCH') {
            // Direct language value passed - filter directly
            return allUsers.filter(user => user.preferredLanguage === upperValue);
        }

        // Otherwise, detect from subject name
        const subjectLower = subjectOrLanguage.toLowerCase();
        const isGerman = subjectLower.includes('german');
        const isFrench = subjectLower.includes('french');
        const isLanguage = subjectLower.includes('language') || isGerman || isFrench;

        if (!isLanguage) {
            // Not a language period, return all users
            return allUsers;
        }

        // Determine which language this period is for
        let targetLanguage: 'GERMAN' | 'FRENCH' | null = null;
        if (isGerman) targetLanguage = 'GERMAN';
        else if (isFrench) targetLanguage = 'FRENCH';

        // If we can't determine the language from subject, return all (tabs will handle filtering)
        if (!targetLanguage) {
            return allUsers;
        }

        // Filter students by their language preference
        return allUsers.filter(user => user.preferredLanguage === targetLanguage);
    }

    // Helper methods to convert between camelCase (app) and snake_case (DB)
    private static mapFromDB(dbUser: any): User {
        return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            password: dbUser.password,
            role: dbUser.role,
            rollNo: dbUser.roll_no,
            classId: dbUser.class_id,
            preferredLanguage: dbUser.preferred_language,
        };
    }

    private static mapToDB(user: any): any {
        const dbUser: any = {
            name: user.name,
            email: user.email,
            role: user.role,
        };

        if (user.id) dbUser.id = user.id;
        if (user.password) dbUser.password = user.password;
        if (user.rollNo !== undefined) dbUser.roll_no = user.rollNo;
        if (user.classId) dbUser.class_id = user.classId;
        if (user.preferredLanguage !== undefined) dbUser.preferred_language = user.preferredLanguage;

        return dbUser;
    }
}
