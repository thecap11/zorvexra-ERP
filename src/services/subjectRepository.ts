import { Subject, SubjectOption, SubjectType, StudentSubjectPreference } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * SubjectRepository - Handles all subject-related data operations with Supabase
 * For the Course Structure / Subject List feature
 */
export class SubjectRepository {

    // ==================== SUBJECTS CRUD ====================

    /**
     * Get all subjects for a class
     */
    static async getSubjectsByClassId(classId: string): Promise<Subject[]> {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('class_id', classId)
            .order('type', { ascending: true }) // NORMAL first, then PREFERRED_GROUP
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching subjects:', error);
            return [];
        }

        return data ? data.map(this.mapSubjectFromDB) : [];
    }

    /**
     * Get a subject by ID with its options
     */
    static async getSubjectById(subjectId: string): Promise<Subject | undefined> {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', subjectId)
            .single();

        if (error) {
            console.error('Error fetching subject:', error);
            return undefined;
        }

        if (!data) return undefined;

        const subject = this.mapSubjectFromDB(data);

        // Load options if it's a PREFERRED_GROUP
        if (subject.type === 'PREFERRED_GROUP') {
            subject.options = await this.getOptionsBySubjectId(subject.id);
        }

        return subject;
    }

    /**
     * Create a new subject
     */
    static async createSubject(subject: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
        const dbSubject = this.mapSubjectToDB(subject);

        const { data, error } = await supabase
            .from('subjects')
            .insert([dbSubject])
            .select()
            .single();

        if (error) {
            console.error('Error creating subject:', error);
            throw new Error(error.message);
        }

        return this.mapSubjectFromDB(data);
    }

    /**
     * Update a subject
     */
    static async updateSubject(subjectId: string, updates: Partial<Subject>): Promise<Subject | undefined> {
        const dbUpdates = this.mapSubjectToDB(updates as any);

        const { data, error } = await supabase
            .from('subjects')
            .update(dbUpdates)
            .eq('id', subjectId)
            .select()
            .single();

        if (error) {
            console.error('Error updating subject:', error);
            return undefined;
        }

        return data ? this.mapSubjectFromDB(data) : undefined;
    }

    /**
     * Delete a subject (will cascade delete options and preferences)
     */
    static async deleteSubject(subjectId: string): Promise<boolean> {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', subjectId);

        if (error) {
            console.error('Error deleting subject:', error);
            return false;
        }

        return true;
    }

    // ==================== SUBJECT OPTIONS CRUD ====================

    /**
     * Get all options for a subject
     */
    static async getOptionsBySubjectId(subjectId: string): Promise<SubjectOption[]> {
        const { data, error } = await supabase
            .from('subject_options')
            .select('*')
            .eq('subject_id', subjectId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching subject options:', error);
            return [];
        }

        return data ? data.map(this.mapOptionFromDB) : [];
    }

    /**
     * Create a subject option
     */
    static async createOption(option: Omit<SubjectOption, 'id' | 'createdAt'>): Promise<SubjectOption> {
        const dbOption = this.mapOptionToDB(option);

        const { data, error } = await supabase
            .from('subject_options')
            .insert([dbOption])
            .select()
            .single();

        if (error) {
            console.error('Error creating subject option:', error);
            throw new Error(error.message);
        }

        return this.mapOptionFromDB(data);
    }

    /**
     * Delete a subject option
     */
    static async deleteOption(optionId: string): Promise<boolean> {
        const { error } = await supabase
            .from('subject_options')
            .delete()
            .eq('id', optionId);

        if (error) {
            console.error('Error deleting subject option:', error);
            return false;
        }

        return true;
    }

    /**
     * Update all options for a subject (delete old ones, create new ones)
     */
    static async updateSubjectOptions(subjectId: string, optionNames: string[]): Promise<SubjectOption[]> {
        // Delete existing options
        const { error: deleteError } = await supabase
            .from('subject_options')
            .delete()
            .eq('subject_id', subjectId);

        if (deleteError) {
            console.error('Error deleting old options:', deleteError);
            throw new Error(deleteError.message);
        }

        // Create new options
        const newOptions: SubjectOption[] = [];
        for (const name of optionNames) {
            const option = await this.createOption({ subjectId, name });
            newOptions.push(option);
        }

        return newOptions;
    }

    // ==================== STUDENT PREFERENCES ====================

    /**
     * Get all preferences for a student
     */
    static async getStudentPreferences(studentId: string): Promise<StudentSubjectPreference[]> {
        const { data, error } = await supabase
            .from('student_subject_preferences')
            .select('*')
            .eq('student_id', studentId);

        if (error) {
            console.error('Error fetching student preferences:', error);
            return [];
        }

        return data ? data.map(this.mapPreferenceFromDB) : [];
    }

    /**
     * Get student preferences for a subject
     */
    static async getPreferencesBySubjectId(subjectId: string): Promise<StudentSubjectPreference[]> {
        const { data, error } = await supabase
            .from('student_subject_preferences')
            .select('*')
            .eq('subject_id', subjectId);

        if (error) {
            console.error('Error fetching preferences:', error);
            return [];
        }

        return data ? data.map(this.mapPreferenceFromDB) : [];
    }

    /**
     * Set or update a student's preference for a subject
     */
    static async setStudentPreference(
        studentId: string,
        subjectId: string,
        optionId: string | null
    ): Promise<StudentSubjectPreference | undefined> {
        if (optionId === null) {
            // Delete the preference if setting to null
            const { error } = await supabase
                .from('student_subject_preferences')
                .delete()
                .eq('student_id', studentId)
                .eq('subject_id', subjectId);

            if (error) {
                console.error('Error deleting preference:', error);
            }
            return undefined;
        }

        // Check if preference already exists
        const { data: existing } = await supabase
            .from('student_subject_preferences')
            .select('*')
            .eq('student_id', studentId)
            .eq('subject_id', subjectId)
            .single();

        if (existing) {
            // Update existing preference
            const { data, error } = await supabase
                .from('student_subject_preferences')
                .update({ option_id: optionId })
                .eq('student_id', studentId)
                .eq('subject_id', subjectId)
                .select()
                .single();

            if (error) {
                console.error('Error updating preference:', error);
                return undefined;
            }

            return data ? this.mapPreferenceFromDB(data) : undefined;
        } else {
            // Create new preference
            const { data, error } = await supabase
                .from('student_subject_preferences')
                .insert([{
                    student_id: studentId,
                    subject_id: subjectId,
                    option_id: optionId
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating preference:', error);
                return undefined;
            }

            return data ? this.mapPreferenceFromDB(data) : undefined;
        }
    }

    /**
     * Get all preferences for a class (useful for batch loading)
     */
    static async getPreferencesForClass(classId: string): Promise<StudentSubjectPreference[]> {
        const { data, error } = await supabase
            .from('student_subject_preferences')
            .select(`
                *,
                users!inner(class_id)
            `)
            .eq('users.class_id', classId);

        if (error) {
            console.error('Error fetching class preferences:', error);
            return [];
        }

        return data ? data.map(this.mapPreferenceFromDB) : [];
    }

    /**
     * Check if a subject can be deleted (not used in preferences)
     */
    static async canDeleteSubject(subjectId: string): Promise<{ canDelete: boolean; reason?: string }> {
        const preferences = await this.getPreferencesBySubjectId(subjectId);

        if (preferences.length > 0) {
            return {
                canDelete: false,
                reason: `This subject has ${preferences.length} student preference(s) assigned. Please remove these first.`
            };
        }

        return { canDelete: true };
    }

    // ==================== MAPPING FUNCTIONS ====================

    private static mapSubjectFromDB(dbSubject: any): Subject {
        return {
            id: dbSubject.id,
            classId: dbSubject.class_id,
            name: dbSubject.name,
            type: dbSubject.type as SubjectType,
            createdAt: dbSubject.created_at,
        };
    }

    private static mapSubjectToDB(subject: any): any {
        const dbSubject: any = {
            name: subject.name,
            type: subject.type,
        };

        if (subject.id) dbSubject.id = subject.id;
        if (subject.classId) dbSubject.class_id = subject.classId;

        return dbSubject;
    }

    private static mapOptionFromDB(dbOption: any): SubjectOption {
        return {
            id: dbOption.id,
            subjectId: dbOption.subject_id,
            name: dbOption.name,
            createdAt: dbOption.created_at,
        };
    }

    private static mapOptionToDB(option: any): any {
        const dbOption: any = {
            name: option.name,
        };

        if (option.id) dbOption.id = option.id;
        if (option.subjectId) dbOption.subject_id = option.subjectId;

        return dbOption;
    }

    private static mapPreferenceFromDB(dbPref: any): StudentSubjectPreference {
        return {
            id: dbPref.id,
            studentId: dbPref.student_id,
            subjectId: dbPref.subject_id,
            optionId: dbPref.option_id,
            createdAt: dbPref.created_at,
        };
    }
}
