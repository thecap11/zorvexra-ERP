import { supabase } from '../lib/supabaseClient';

export interface Class {
    id: string;
    name: string;
    section: string | null;
}

export interface ClassWithStats extends Class {
    cr1Id: string | null;
    cr1Name: string | null;
    cr1Email: string | null;
    cr2Id: string | null;
    cr2Name: string | null;
    cr2Email: string | null;
    studentCount: number;
}

export interface CreateClassDTO {
    name: string;
    section: string | null;
}

/**
 * ClassRepository - Handles class management operations for Admin
 */
export class ClassRepository {
    /**
     * Get all classes with CR and student count information
     */
    static async getAllClassesWithStats(): Promise<ClassWithStats[]> {
        const { data: classes, error: classError } = await supabase
            .from('classes')
            .select('*')
            .order('name');

        if (classError) {
            console.error('Error fetching classes:', classError);
            return [];
        }

        // For each class, get CR info and student count
        const classesWithStats = await Promise.all(
            classes.map(async (cls) => {
                // Get CRs for this class (up to 2)
                const { data: crs } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .eq('class_id', cls.id)
                    .eq('role', 'CR')
                    .limit(2);

                // Get student count
                const { count } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', cls.id)
                    .eq('role', 'STUDENT');

                return {
                    id: cls.id,
                    name: cls.name,
                    section: cls.section,
                    cr1Id: crs && crs[0] ? crs[0].id : null,
                    cr1Name: crs && crs[0] ? crs[0].name : null,
                    cr1Email: crs && crs[0] ? crs[0].email : null,
                    cr2Id: crs && crs[1] ? crs[1].id : null,
                    cr2Name: crs && crs[1] ? crs[1].name : null,
                    cr2Email: crs && crs[1] ? crs[1].email : null,
                    studentCount: count || 0,
                };
            })
        );

        return classesWithStats;
    }

    /**
     * Get a single class by ID
     */
    static async getClassById(classId: string): Promise<Class | null> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single();

        if (error) {
            console.error('Error fetching class:', error);
            return null;
        }

        return data;
    }

    /**
     * Create a new class
     */
    static async createClass(dto: CreateClassDTO): Promise<Class | null> {
        const { data, error } = await supabase
            .from('classes')
            .insert([
                {
                    name: dto.name,
                    section: dto.section,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating class:', error);
            return null;
        }

        return data;
    }

    /**
     * Update an existing class
     */
    static async updateClass(classId: string, dto: CreateClassDTO): Promise<boolean> {
        const { error } = await supabase
            .from('classes')
            .update({
                name: dto.name,
                section: dto.section,
            })
            .eq('id', classId);

        if (error) {
            console.error('Error updating class:', error);
            return false;
        }

        return true;
    }

    /**
     * Delete a class (cascades to users, tasks, etc.)
     */
    static async deleteClass(classId: string): Promise<boolean> {
        const { error } = await supabase.from('classes').delete().eq('id', classId);

        if (error) {
            console.error('Error deleting class:', error);
            return false;
        }

        return true;
    }

    /**
     * Get statistics across all classes
     */
    static async getGlobalStats(): Promise<{
        totalClasses: number;
        totalCRs: number;
        totalStudents: number;
    }> {
        const { count: classCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true });

        const { count: crCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'CR');

        const { count: studentCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'STUDENT');

        return {
            totalClasses: classCount || 0,
            totalCRs: crCount || 0,
            totalStudents: studentCount || 0,
        };
    }

    /**
     * Assign a CR to a class by updating the user's class_id
     */
    static async assignCRToClass(userId: string, classId: string): Promise<boolean> {
        const { error } = await supabase
            .from('users')
            .update({ class_id: classId })
            .eq('id', userId);

        if (error) {
            console.error('Error assigning CR to class:', error);
            return false;
        }

        return true;
    }

    /**
     * Remove a CR from a class by setting their class_id to NULL
     */
    static async removeCRFromClass(userId: string): Promise<boolean> {
        const { error } = await supabase
            .from('users')
            .update({ class_id: null })
            .eq('id', userId);

        if (error) {
            console.error('Error removing CR from class:', error);
            return false;
        }

        return true;
    }

    /**
     * Create a new CR user for a specific class
     */
    static async createCRForClass(
        name: string,
        email: string,
        password: string,
        classId: string
    ): Promise<boolean> {
        const { error } = await supabase.from('users').insert([
            {
                name,
                email,
                password,
                role: 'CR',
                class_id: classId,
                roll_no: null,
            },
        ]);

        if (error) {
            console.error('Error creating CR:', error);
            return false;
        }

        return true;
    }

    /**
     * Get all CRs without an assigned class
     */
    static async getUnassignedCRs(): Promise<Array<{ id: string; name: string; email: string }>> {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('role', 'CR')
            .is('class_id', null);

        if (error) {
            console.error('Error fetching unassigned CRs:', error);
            return [];
        }

        return data || [];
    }
}
