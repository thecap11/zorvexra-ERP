import { User, Class, Task, TaskStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed data for initial application state
 * This creates sample users, classes, tasks, and task statuses
 */

// Generate unique IDs
const classId = 'class-1';
const crId = 'cr_primary'; // Primary CR - cannot be deleted or demoted

// Sample class
export const seedClasses: Class[] = [
    {
        id: classId,
        name: 'Computer Science 2nd Year',
        section: 'A',
    },
];

// Sample users (1 Primary CR + 8 students)
export const seedUsers: User[] = [
    {
        id: crId,
        name: 'Primary CR',
        email: 'cr@class.com',
        password: 'password123', // In production, this would be hashed
        role: 'CR',
        classId: classId,
    },
    {
        id: 'user-student-1',
        name: 'Alice Johnson',
        email: 'alice@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS001',
        classId: classId,
    },
    {
        id: 'user-student-2',
        name: 'Bob Smith',
        email: 'bob@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS002',
        classId: classId,
    },
    {
        id: 'user-student-3',
        name: 'Carol Williams',
        email: 'carol@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS003',
        classId: classId,
    },
    {
        id: 'user-student-4',
        name: 'David Brown',
        email: 'david@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS004',
        classId: classId,
    },
    {
        id: 'user-student-5',
        name: 'Emma Davis',
        email: 'emma@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS005',
        classId: classId,
    },
    {
        id: 'user-student-6',
        name: 'Frank Miller',
        email: 'frank@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS006',
        classId: classId,
    },
    {
        id: 'user-student-7',
        name: 'Grace Wilson',
        email: 'grace@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS007',
        classId: classId,
    },
    {
        id: 'user-student-8',
        name: 'Henry Moore',
        email: 'henry@student.com',
        password: 'password123',
        role: 'STUDENT',
        rollNo: '21CS008',
        classId: classId,
    },
];

// Sample tasks
const task1Id = 'task-1';
const task2Id = 'task-2';
const task3Id = 'task-3';

export const seedTasks: Task[] = [
    {
        id: task1Id,
        classId: classId,
        title: 'Data Structures Assignment',
        description: 'Complete the binary tree implementation and submit the code',
        type: 'ASSIGNMENT',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        createdBy: crId,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: task2Id,
        classId: classId,
        title: 'Attendance - December 2, 2025',
        description: 'Morning session attendance',
        type: 'ATTENDANCE',
        createdBy: crId,
        createdAt: new Date().toISOString(),
    },
    {
        id: task3Id,
        classId: classId,
        title: 'Algorithm Analysis Project',
        description: 'Analyze time complexity of sorting algorithms',
        type: 'ASSIGNMENT',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        createdBy: crId,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
];

// Sample task statuses
export const seedTaskStatuses: TaskStatus[] = [];

// Generate task statuses for all students for each task
const students = seedUsers.filter(u => u.role === 'STUDENT');

seedTasks.forEach(task => {
    students.forEach(student => {
        if (task.type === 'ASSIGNMENT') {
            // For assignments, some are completed, some are not
            const isCompleted = Math.random() > 0.5;
            seedTaskStatuses.push({
                id: uuidv4(),
                taskId: task.id,
                studentId: student.id,
                status: isCompleted ? 'COMPLETED' : 'NOT_COMPLETED',
                submittedAt: isCompleted ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            });
        } else if (task.type === 'ATTENDANCE') {
            // For attendance, most are present
            const isPresent = Math.random() > 0.2;
            seedTaskStatuses.push({
                id: uuidv4(),
                taskId: task.id,
                studentId: student.id,
                status: isPresent ? 'PRESENT' : 'ABSENT',
            });
        }
    });
});
