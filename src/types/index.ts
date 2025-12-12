// User and Authentication Types
export type UserRole = 'ADMIN' | 'CR' | 'STUDENT';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    rollNo?: string;
    classId: string;
    preferredLanguage?: 'GERMAN' | 'FRENCH' | null;
    programmingPreference?: 'C' | 'JAVA' | null;
}

// Class types
export interface Class {
    id: string;
    name: string;
    section?: string;
}

// Subject Types (Preferred Subjects System)
export type SubjectType = 'NORMAL' | 'PREFERRED_GROUP';

export interface Subject {
    id: string;
    classId: string;
    name: string;
    type: SubjectType;
    createdAt: string;
    options?: SubjectOption[]; // Populated for PREFERRED_GROUP type
}

export interface SubjectOption {
    id: string;
    subjectId: string;
    name: string;
    createdAt: string;
}

export interface StudentSubjectPreference {
    id: string;
    studentId: string;
    subjectId: string;
    optionId: string;
    createdAt: string;
    // Populated fields
    subject?: Subject;
    option?: SubjectOption;
}

// Task types
export type TaskType = "ASSIGNMENT" | "ATTENDANCE";

export interface Task {
    id: string;
    classId: string;
    title: string;
    description?: string;
    type: TaskType;
    startDate?: string;
    dueDate?: string;
    createdBy: string;
    createdAt: string;
    // Optional fields for period-based attendance
    periodIndex?: number;
    subject?: string;
    attendanceDate?: string; // YYYY-MM-DD
}

// Timetable types
export interface TimetableEntry {
    day: string; // 'Monday', 'Tuesday', etc.
    periodIndex: number; // 0-8
    subject: string;
    type: string; // 'T', 'P', 'Lab', etc.
    subjectId?: string; // Links to subjects table (Phase 4)
}

export interface TimetableSlot {
    id?: string;
    classId?: string;
    dayOfWeek: string; // 'MON', 'TUE', etc.
    periodIndex: number; // 1-9
    timeStart: string; // '10:00'
    timeEnd: string; // '10:50'
    subjectName: string;
    subjectType?: string;
    subjectId?: string; // Links to subjects table (Phase 4)
}

// TaskStatus types
export type TaskStatusValue =
    | "NOT_ASSIGNED"
    | "NOT_COMPLETED"
    | "COMPLETED"
    | "PRESENT"
    | "ABSENT"
    | "OTHER";

export interface TaskStatus {
    id: string;
    taskId: string;
    studentId: string;
    status: TaskStatusValue;
    submittedAt?: string;
    remarks?: string;
}

// Auth types
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    rollNo?: string;
    classId: string;
    preferredLanguage?: 'GERMAN' | 'FRENCH' | null;
    programmingPreference?: 'C' | 'JAVA' | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// Notification types
export interface Notification {
    id: string;
    classId: string;
    recipientId: string | null; // null = whole class
    title: string;
    message: string;
    createdBy: string;
    createdAt: string;
    readAt: string | null;
}

export interface CreateNotificationDTO {
    classId: string;
    recipientId: string | null;
    title: string;
    message: string;
    createdBy: string;
}

// CR Message types (Student → CR communication)
export type CRMessageStatus = 'UNREAD' | 'READ' | 'RESOLVED';

export interface CRMessage {
    id: string;
    classId: string;
    fromStudentId: string;
    toCrId: string;
    subject: string;
    message: string;
    status: CRMessageStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCRMessageDTO {
    classId: string;
    fromStudentId: string;
    toCrId: string;
    subject: string;
    message: string;
}
