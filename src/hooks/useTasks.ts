import { useState, useEffect } from 'react';
import { Task } from '../types';
import { TaskRepository } from '../services/taskRepository';

export const useTasksForClass = (classId: string) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const data = await TaskRepository.getTasksByClassId(classId);
            setTasks(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch tasks');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (classId) {
            fetchTasks();
        }
    }, [classId]);

    return { tasks, isLoading, error, refetch: fetchTasks };
};
