import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { ClassRepository } from '../services/classRepository';
import { School, Users, GraduationCap, ArrowRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalCRs: 0,
        totalStudents: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const data = await ClassRepository.getGlobalStats();
        setStats(data);
        setIsLoading(false);
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-purple-100 text-lg">
                        Manage classes, assign CRs, and oversee the entire system
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Total Classes</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {isLoading ? '...' : stats.totalClasses}
                                </p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <School className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Total CRs</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {isLoading ? '...' : stats.totalCRs}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Users className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Total Students</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {isLoading ? '...' : stats.totalStudents}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <GraduationCap className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card title="Quick Actions" subtitle="Common administrative tasks">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/admin/classes')}
                            className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                    <School className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-slate-900 mb-1">Manage Classes</h3>
                                    <p className="text-sm text-slate-600">
                                        Create, edit, and delete classes
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </button>

                        <button
                            onClick={() => navigate('/admin/assign-crs')}
                            className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-slate-900 mb-1">Assign CRs</h3>
                                    <p className="text-sm text-slate-600">
                                        Create and assign CRs to classes
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
                        </button>
                    </div>
                </Card>

                {/* System Info */}
                <Card title="System Overview">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Classes Created</span>
                            <span className="font-semibold text-slate-900">
                                {stats.totalClasses}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Class Representatives</span>
                            <span className="font-semibold text-slate-900">{stats.totalCRs}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Students Enrolled</span>
                            <span className="font-semibold text-slate-900">
                                {stats.totalStudents}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Average Students per Class</span>
                            <span className="font-semibold text-slate-900">
                                {stats.totalClasses > 0
                                    ? Math.round(stats.totalStudents / stats.totalClasses)
                                    : 0}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};
