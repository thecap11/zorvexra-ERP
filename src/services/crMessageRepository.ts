import { CRMessage, CreateCRMessageDTO, CRMessageStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * CRMessageRepository - Handles CR message data operations with Supabase
 * Student → CR communication
 */
export class CRMessageRepository {
    /**
     * Create a new message to CR
     */
    static async createMessage(dto: CreateCRMessageDTO): Promise<CRMessage | null> {
        const { data, error } = await supabase
            .from('cr_messages')
            .insert([
                {
                    class_id: dto.classId,
                    from_student_id: dto.fromStudentId,
                    to_cr_id: dto.toCrId,
                    subject: dto.subject,
                    message: dto.message,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating CR message:', error);
            return null;
        }

        return this.mapToCRMessage(data);
    }

    /**
     * Get all messages for a CR
     */
    static async getMessagesForCR(crId: string): Promise<CRMessage[]> {
        const { data, error } = await supabase
            .from('cr_messages')
            .select('*')
            .eq('to_cr_id', crId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching CR messages:', error);
            return [];
        }

        return data.map(this.mapToCRMessage);
    }

    /**
     * Update message status
     */
    static async updateStatus(messageId: string, status: CRMessageStatus): Promise<boolean> {
        const { error } = await supabase
            .from('cr_messages')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', messageId);

        if (error) {
            console.error('Error updating message status:', error);
            return false;
        }

        return true;
    }

    /**
     * Get unread message count for CR
     */
    static async getUnreadCount(crId: string): Promise<number> {
        const { count, error } = await supabase
            .from('cr_messages')
            .select('*', { count: 'exact', head: true })
            .eq('to_cr_id', crId)
            .eq('status', 'UNREAD');

        if (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }

        return count || 0;
    }

    /**
     * Get messages from a specific student
     */
    static async getMessagesFromStudent(studentId: string): Promise<CRMessage[]> {
        const { data, error } = await supabase
            .from('cr_messages')
            .select('*')
            .eq('from_student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching student messages:', error);
            return [];
        }

        return data.map(this.mapToCRMessage);
    }

    /**
     * Map database row to CRMessage object
     */
    private static mapToCRMessage(data: any): CRMessage {
        return {
            id: data.id,
            classId: data.class_id,
            fromStudentId: data.from_student_id,
            toCrId: data.to_cr_id,
            subject: data.subject,
            message: data.message,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
}
