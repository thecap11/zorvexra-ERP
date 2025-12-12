/**
 * Storage utility for localStorage operations
 * This provides a simple abstraction that can be replaced with Supabase later
 */

const STORAGE_KEYS = {
    USERS: 'classerp_users',
    CLASSES: 'classerp_classes',
    TASKS: 'classerp_tasks',
    TASK_STATUSES: 'classerp_task_statuses',
    AUTH_TOKEN: 'classerp_auth_token',
} as const;

export class Storage {
    static get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage:`, error);
            return null;
        }
    }

    static set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage:`, error);
        }
    }

    static remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage:`, error);
        }
    }

    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error(`Error clearing localStorage:`, error);
        }
    }
}

export { STORAGE_KEYS };
