import React, { useState, useEffect } from 'react';
import { UserPlus, Filter, Download, Plus, X, Trash2, Search, CalendarDays, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/api';

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [transportRoutes, setTransportRoutes] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterYear, setFilterYear] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;


    const initialFormState = {
        student_id: '',
        class_id: '',
        section_id: '',
        roll_no: '',
        academic_year_id: '',
        transport: 'no',
        transport_id: '',
        admission_type: 'fresh'
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            const [enRes, stRes, clRes, secRes, acRes, trRes] = await Promise.all([
                API.get('/enrollments'),
                API.get('/students'),
                API.get('/classes/class'),
                API.get('/classes/sections'),
                API.get('/academics'),
                API.get('/transport')
            ]);
            setEnrollments(enRes.data);
            setStudents(stRes.data);
            setClasses(clRes.data);
            setSections(secRes.data);
            setAcademicYears(acRes.data);
            setTransportRoutes(trRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load enrollment data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
    };

    // Auto-update roll number based on selected Class, Section and Year
    useEffect(() => {
        if (formData.class_id && formData.section_id && formData.academic_year_id && isModalOpen) {
            const related = enrollments.filter(e =>
                String(e.class_id) === String(formData.class_id) &&
                String(e.section_id) === String(formData.section_id) &&
                String(e.academic_year_id) === String(formData.academic_year_id)
            );

            if (related.length > 0) {
                const maxRoll = Math.max(...related.map(e => parseInt(e.roll_no) || 0));
                setFormData(prev => ({ ...prev, roll_no: maxRoll + 1 }));
            } else {
                setFormData(prev => ({ ...prev, roll_no: 1 }));
            }
        }
    }, [formData.class_id, formData.section_id, formData.academic_year_id, enrollments, isModalOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/enrollments', formData);
            toast.success("Student Enrolled successfully!");
            fetchData();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.err || "Failed to enroll student");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this enrollment?")) return;
        try {
            await API.delete(`/enrollments/${id}`);
            toast.success("Enrollment removed");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete enrollment");
        }
    };

    const filteredEnrollments = enrollments.filter(en => {
        const studentName = students.find(s => String(s.id) === String(en.student_id))?.name || '';
        const matchesName = studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass ? String(en.class_id) === String(filterClass) : true;
        const matchesYear = filterYear ? String(en.academic_year_id) === String(filterYear) : true;
        return matchesName && matchesClass && matchesYear;
    });

    const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEnrollments = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);

    // Reset pagination cleanly when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterClass, filterYear]);


    return (
        <div className="space-y-6 fade-in h-full flex flex-col relative">
            <header className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="text-cyan-500" /> Enrollments
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage academic year enrollments and class assignments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors text-sm font-medium text-gray-300">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors text-sm font-medium text-gray-300">
                        <Download size={16} /> Export
                    </button>
                    <button onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all text-sm font-medium text-white shadow-lg shadow-cyan-500/20 cursor-pointer">
                        <Plus size={16} /> New Enrollment
                    </button>
                </div>
            </header>

            <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800/50 p-4 rounded-2xl flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                
                <select 
                    value={filterClass} 
                    onChange={e => setFilterClass(e.target.value)}
                    className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors text-sm"
                >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>

                <select 
                    value={filterYear} 
                    onChange={e => setFilterYear(e.target.value)}
                    className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors text-sm"
                >
                    <option value="">All Years</option>
                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                </select>
            </div>

            <div className="flex-1 glass-card rounded-2xl border border-gray-800/50 overflow-hidden flex flex-col">
                {filteredEnrollments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="bg-cyan-500/10 p-4 rounded-full mb-4">
                            <UserPlus size={48} className="text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No active enrollments found</h3>
                        <p className="text-gray-400 max-w-md mb-6">There are no students enrolled matching your criteria. Click the button below to start the enrollment wizard.</p>
                        <button onClick={handleOpenModal} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                            Start Enrollment Wizard
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-900/20">
                                    <th className="p-4 font-medium text-gray-400 text-sm">Student Name</th>
                                    <th className="p-4 font-medium text-gray-400 text-sm">Roll No</th>
                                    <th className="p-4 font-medium text-gray-400 text-sm">Class & Section</th>
                                    <th className="p-4 font-medium text-gray-400 text-sm">Academic Year</th>
                                    <th className="p-4 font-medium text-gray-400 text-sm">Type</th>
                                    <th className="p-4 font-medium text-gray-400 text-sm text-center">Transport</th>
                                    <th className="p-4 font-medium text-gray-400 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEnrollments.map(en => {
                                    const stu = students.find(s => String(s.id) === String(en.student_id));
                                    const cls = classes.find(c => String(c.id) === String(en.class_id));
                                    const sec = sections.find(s => String(s.id) === String(en.section_id));
                                    const year = academicYears.find(y => String(y.id) === String(en.academic_year_id));
                                    const route = transportRoutes.find(t => String(t.id) === String(en.transport_id));

                                    return (
                                        <tr key={en.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-white font-medium">{stu?.name || 'Unknown'}</td>
                                            <td className="p-4 text-gray-300">{en.roll_no}</td>
                                            <td className="p-4">
                                                <span className="text-white">{cls?.class_name + " - " + sec?.section_name || 'N/A'}</span>
                                            </td>
                                            <td className="p-4 text-cyan-400 text-sm font-medium">{year?.year_name || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${en.admission_type === 'fresh' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {en.admission_type || 'Fresh'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${en.transport === 'yes' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                                    {en.transport === 'yes' ? (route?.route_name || 'YES') : 'NO'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDelete(en.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-800/50 bg-gray-900/20">
                        <span className="text-sm text-gray-400">
                            Showing <span className="text-white font-medium">{indexOfFirstItem + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredEnrollments.length)}</span> of <span className="text-white font-medium">{filteredEnrollments.length}</span> entries
                        </span>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition-colors"
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-1 hidden sm:flex">
                                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
                    <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-800">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                <UserPlus className="text-cyan-400" /> New Enrollment
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="enrollment-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Student Selector */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-300">Select Student</label>
                                        <select
                                            required
                                            value={formData.student_id}
                                            onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                                        >
                                            <option value="">-- Choose Student --</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.pen_no})</option>)}
                                        </select>
                                    </div>

                                    {/* Academic Year */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Academic Year</label>
                                        <select
                                            required
                                            value={formData.academic_year_id}
                                            onChange={e => setFormData({ ...formData, academic_year_id: e.target.value })}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                                        >
                                            <option value="">-- Choose Year --</option>
                                            {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                                        </select>
                                    </div>

                                    {/* Class */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Class</label>
                                        <select
                                            required
                                            value={formData.class_id}
                                            onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                                        >
                                            <option value="">-- Choose Class --</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                        </select>
                                    </div>

                                    {/* Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Section</label>
                                        <select
                                            required
                                            value={formData.section_id}
                                            onChange={e => setFormData({ ...formData, section_id: e.target.value })}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                                        >
                                            <option value="">-- Choose Section --</option>
                                            {sections.filter(s => String(s.class_id) === String(formData.class_id)).map(s => (
                                                <option key={s.id} value={s.id}>{s.section_name}</option>
                                            ))}
                                        </select>
                                        {!formData.class_id && <p className="text-xs text-rose-400 mt-1">Select a class first</p>}
                                    </div>

                                    {/* Roll No */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Roll Number</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="Auto-calculates..."
                                            value={formData.roll_no}
                                            onChange={e => setFormData({ ...formData, roll_no: e.target.value })}
                                            className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-xl px-4 py-2 text-emerald-400 font-medium outline-none focus:border-cyan-500 transition-colors"
                                        />
                                    </div>

                                    {/* Admission Type */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Admission Type</label>
                                        <select
                                            value={formData.admission_type}
                                            onChange={e => setFormData({ ...formData, admission_type: e.target.value })}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                                        >
                                            <option value="fresh">Fresh Admission</option>
                                            <option value="promoted">Promoted</option>
                                        </select>
                                    </div>

                                    {/* Transport */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Transport Required?</label>
                                        <select
                                            value={formData.transport}
                                            onChange={e => setFormData({ ...formData, transport: e.target.value })}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                                        >
                                            <option value="no">No</option>
                                            <option value="yes">Yes</option>
                                        </select>
                                    </div>

                                    {/* Transport Route Mapping (Conditional) */}
                                    {formData.transport === 'yes' && (
                                        <div className="space-y-2 fade-in">
                                            <label className="text-sm font-medium text-amber-400">Select Route</label>
                                            <select
                                                required
                                                value={formData.transport_id}
                                                onChange={e => setFormData({ ...formData, transport_id: e.target.value })}
                                                className="w-full bg-gray-900/50 border border-amber-500/50 rounded-xl px-4 py-2 text-white outline-none focus:border-amber-400 transition-colors"
                                            >
                                                <option value="">-- Choose Route --</option>
                                                {transportRoutes.map(tr => <option key={tr.id} value={tr.id}>{tr.route_name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50 rounded-b-2xl">
                            <button onClick={handleCloseModal} type="button" className="px-5 py-2 hover:bg-white/5 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors font-medium text-gray-300">
                                Cancel
                            </button>
                            <button form="enrollment-form" type="submit" className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
                                Complete Enrollment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enrollments;