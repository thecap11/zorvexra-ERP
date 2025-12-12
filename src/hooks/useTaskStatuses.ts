import { useState, useEffect } from 'react';
import { TaskStatus } from '../types';
import { TaskStatusRepository } from '../services/taskStatusRepository';

export const useTaskStatuses = (taskId: string) => {
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatuses = async () => {
        try {
            setIsLoading(true);
            const data = await TaskStatusRepository.getTaskStatusesByTask(taskId);
            setStatuses(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch task statuses');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchStatuses();
        }
    }, [taskId]);

    return { statuses, isLoading, error, refetch: fetchStatuses };
};

export const useStudentTaskStatuses = (studentId: string) => {
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatuses = async () => {
        try {
            setIsLoading(true);
            const data = await TaskStatusRepository.getTaskStatusesByStudent(studentId);
            setStatuses(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch task statuses');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) {
            fetchStatuses();
        }
    }, [studentId]);

    return { statuses, isLoading, error, refetch: fetchStatuses };
};
