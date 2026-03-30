import React, { useEffect, useState } from 'react'
import { Search, Eye, Pencil, Trash2, X } from 'lucide-react'
import API from '../../api/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const StudentManagement = () => {
    const [students, setStudents] = useState([])
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate();

    // Modal states
    const [viewStudent, setViewStudent] = useState(null)

    const fetchStudents = () => {
        API.get("/students")
            .then((res) => setStudents(res.data))
            .catch((err) => setError(err))
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to permanently delete student: ${name}?`)) {
            try {
                await API.delete(`/students/${id}`)
                toast.success('Student deleted successfully')
                setStudents(students.filter(s => s.id !== id))
            } catch (err) {
                console.error(err)
                toast.error('Failed to delete student')
            }
        }
    }

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id?.toString().includes(searchQuery)
    )

    return (
        <div className="h-full flex flex-col p-6 fade-in relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">All Students</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or SR no..."
                        className="bg-gray-900/50 border border-gray-700/50 rounded-full pl-9 pr-4 py-1.5 text-sm text-white outline-none focus:border-blue-500 transition-colors w-64 focus:w-80"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-gray-800/50">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
                        <tr className="text-gray-400 border-b border-gray-700/50">
                            <th className="px-6 py-4 font-medium">SR No.</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">DOB</th>
                            <th className="px-6 py-4 font-medium flex items-center gap-2">Parents Info</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id} onClick={() => setViewStudent(student)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-6 py-3 text-gray-400">#{student.id}</td>
                                    <td className="px-6 py-3 font-medium text-white">{student.name}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            student.status === 'inactive' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                            student.status === 'suspended' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            student.status === 'graduated' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                            {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-400">{student.dob || '-'}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-gray-300">{student.father_name}</span>
                                            <span className="text-xs text-gray-500">M: {student.mother_name || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right w-1/10">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); setViewStudent(student); }} title="View Details" className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); navigate('/students/edit-student/' + student.id); }} title="Edit Student" className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(student.id, student.name); }} title="Delete Student" className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    {error ? 'Failed to load students' : `No students found matching "${searchQuery}".`}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Slide-over Panel */}
            {viewStudent && (
                <div className="absolute top-0 right-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-20 flex flex-col slide-in-right">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Eye className="text-blue-500" size={18} /> Student Details
                        </h3>
                        <button onClick={() => setViewStudent(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <div className="text-center pb-4 border-b border-gray-800">
                            <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                                {viewStudent.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-white">{viewStudent.name}</h2>
                            <span className="text-sm px-3 py-1 bg-white/5 text-gray-400 rounded-full inline-block mt-2">
                                SR #{viewStudent.id}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Personal</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                    <div className="text-gray-400">Status</div>
                                    <div>
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                            viewStudent.status === 'inactive' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                            viewStudent.status === 'suspended' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            viewStudent.status === 'graduated' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                            {viewStudent.status ? viewStudent.status.charAt(0).toUpperCase() + viewStudent.status.slice(1) : 'Active'}
                                        </span>
                                    </div>
                                    <div className="text-gray-400">Gender</div><div className="text-white capitalize">{viewStudent.gender || '-'}</div>
                                    <div className="text-gray-400">DOB</div><div className="text-white">{viewStudent.dob || '-'}</div>
                                    <div className="text-gray-400">Category</div><div className="text-white capitalize">{viewStudent.category || '-'}</div>
                                    <div className="text-gray-400">Contact</div><div className="text-white">{viewStudent.contact_no || '-'}</div>
                                    <div className="text-gray-400">Email</div><div className="text-white lowercase">{viewStudent.email || '-'}</div>
                                    <div className="text-gray-400">Aadhar</div><div className="text-white">{viewStudent.aadhar_no || '-'}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-pink-500 font-semibold mb-2">Parents</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                    <div className="text-gray-400">Father</div><div className="text-white">{viewStudent.father_name || '-'}</div>
                                    <div className="text-gray-400">Mother</div><div className="text-white">{viewStudent.mother_name || '-'}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-violet-500 font-semibold mb-2">Institutional</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                    <div className="text-gray-400">PEN No</div><div className="text-white">{viewStudent.pen_no || '-'}</div>
                                    <div className="text-gray-400">House</div><div className="text-white capitalize">{viewStudent.house_name || '-'}</div>
                                    <div className="text-gray-400">Cert.</div><div className="text-white">{viewStudent.certificate || '-'}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-emerald-500 font-semibold mb-2">Address</h4>
                                <div className="text-sm text-white bg-white/5 p-3 rounded-xl border border-gray-800">
                                    {viewStudent.address || 'No address provided'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Route uses separate page instead of modal */}

            <style jsx>{`
                .slide-in-right { animation: slideIn 0.3s ease-out forwards; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
            `}</style>
        </div>
    )
}

export default StudentManagement