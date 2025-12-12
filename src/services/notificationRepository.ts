import { Notification, CreateNotificationDTO } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * NotificationRepository - Handles notification data operations with Supabase
 */
export class NotificationRepository {
    /**
     * Create a new notification
     */
    static async createNotification(dto: CreateNotificationDTO): Promise<Notification | null> {
        const { data, error } = await supabase
            .from('notifications')
            .insert([
                {
                    class_id: dto.classId,
                    recipient_id: dto.recipientId,
                    title: dto.title,
                    message: dto.message,
                    created_by: dto.createdBy,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            return null;
        }

        return this.mapToNotification(data);
    }

    /**
     * Get unread notifications for a student
     * Includes both class-wide notifications and student-specific ones
     */
    static async getUnreadNotificationsForStudent(
        studentId: string,
        classId: string
    ): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('class_id', classId)
            .is('read_at', null)
            .or(`recipient_id.is.null,recipient_id.eq.${studentId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data.map(this.mapToNotification);
    }

    /**
     * Mark a notification as read
     */
    static async markNotificationAsRead(notificationId: string): Promise<boolean> {
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }

        return true;
    }

    /**
     * Mark all notifications as read for a student
     */
    static async markAllNotificationsAsRead(
        studentId: string,
        classId: string
    ): Promise<boolean> {
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('class_id', classId)
            .is('read_at', null)
            .or(`recipient_id.is.null,recipient_id.eq.${studentId}`);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }

        return true;
    }

    /**
     * Get latest 5 notifications for a user and delete older ones
     * This method fetches the 5 most recent notifications and automatically
     * deletes any older notifications for this user
     */
    static async getLatest5AndDeleteOlder(
        userId: string,
        classId: string
    ): Promise<Notification[]> {
        // Fetch all notifications for this user
        const { data: allNotifications, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('class_id', classId)
            .or(`recipient_id.is.null,recipient_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Error fetching notifications:', fetchError);
            return [];
        }

        if (!allNotifications || allNotifications.length === 0) {
            return [];
        }

        // Get the latest 5
        const latest5 = allNotifications.slice(0, 5);
        const latest5Ids = latest5.map((n) => n.id);

        // If there are more than 5, delete the older ones
        if (allNotifications.length > 5) {
            const { error: deleteError } = await supabase
                .from('notifications')
                .delete()
                .eq('class_id', classId)
                .or(`recipient_id.is.null,recipient_id.eq.${userId}`)
                .not('id', 'in', `(${latest5Ids.join(',')})`);

            if (deleteError) {
                console.error('Error deleting old notifications:', deleteError);
                // Don't fail the entire operation if delete fails
            }
        }

        return latest5.map(this.mapToNotification);
    }

    /**
     * Map database row to Notification object
     */
    private static mapToNotification(data: any): Notification {
        return {
            id: data.id,
            classId: data.class_id,
            recipientId: data.recipient_id,
            title: data.title,
            message: data.message,
            createdBy: data.created_by,
            createdAt: data.created_at,
            readAt: data.read_at,
        };
    }
}
