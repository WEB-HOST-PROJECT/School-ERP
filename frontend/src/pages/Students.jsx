import React from 'react'
import { Link, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { Users, UserPlus, List } from 'lucide-react'
import StudentManagement from './Students/StudentManagement'
import AddStudent from './Students/AddStudent'
import EditStudent from './Students/EditStudent'

const Students = () => {
    const location = useLocation();

    return (
        <div className="space-y-6 fade-in h-full flex flex-col">
            <header className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="text-blue-500" /> Student Directory
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage admissions, view student records, and more.</p>
                </div>
                <div className="flex gap-3 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                    <Link
                        to="/students/view-students"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${location.pathname.includes('view-students') || location.pathname === '/students' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <List size={16} /> View All
                    </Link>
                    <Link
                        to="/students/add-student"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${location.pathname.includes('add-student') ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <UserPlus size={16} /> Add New
                    </Link>
                </div>
            </header>

            <div className="flex-1 glass-card rounded-2xl border border-gray-800/50 overflow-hidden relative">
                <Routes>
                    <Route path="/" element={<Navigate to="view-students" replace />} />
                    <Route path="add-student" element={<AddStudent />} />
                    <Route path="edit-student/:id" element={<EditStudent />} />
                    <Route path="view-students" element={<StudentManagement />} />
                </Routes>
            </div>
        </div>
    )
}

export default Students