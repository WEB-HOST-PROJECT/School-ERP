import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, CheckCircle, XCircle, Building2, ListTree, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/api';

const Academics = () => {
    const [years, setYears] = useState([]);
    const [formData, setFormData] = useState({ year_name: '', start_date: '', end_date: '' });

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [newClass, setNewClass] = useState('');
    const [newSection, setNewSection] = useState({ class_id: '', section_name: '' });

    const fetchData = async () => {
        try {
            const [yearsRes, classesRes, sectionsRes] = await Promise.all([
                API.get('/academics'),
                API.get('/classes/class'),
                API.get('/classes/sections')
            ]);
            setYears(yearsRes.data);
            setClasses(classesRes.data);
            setSections(sectionsRes.data);
        } catch (error) {
            console.error("Failed to map data", error);
            toast.error("Failed to load academic data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/academics', formData);
            toast.success('Academic year added successfully!');
            setFormData({ year_name: '', start_date: '', end_date: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.err || "Failed to add academic year");
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        try {
            await API.post('/classes/class', { class_name: newClass });
            toast.success("Class added!");
            setNewClass('');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.err || "Failed to add class");
        }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            await API.post('/classes/sections', newSection);
            toast.success("Section added!");
            setNewSection({ class_id: '', section_name: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.err || "Failed to add section");
        }
    };

    const handleDeleteYear = async (id) => {
        if (!window.confirm("Delete this academic year?")) return;
        try {
            await API.delete(`/academics/${id}`);
            toast.success("Year deleted");
            fetchData();
        } catch (error) { toast.error("Delete failed"); }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm("Delete this class?")) return;
        try {
            await API.delete(`/classes/class/${id}`);
            toast.success("Class deleted");
            fetchData();
        } catch (error) { toast.error("Delete failed"); }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm("Delete this section?")) return;
        try {
            await API.delete(`/classes/sections/${id}`);
            toast.success("Section deleted");
            fetchData();
        } catch (error) { toast.error("Delete failed"); }
    };

    return (
        <div className="space-y-6 fade-in">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarDays className="text-pink-500" /> Academic Years
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage school terms and academic sessions.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-gray-800/50 h-fit">
                    <h2 className="text-lg font-semibold text-white mb-4">Add New Year</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Year Name (e.g. 2025-2026)</label>
                            <input
                                required
                                type="text"
                                value={formData.year_name}
                                onChange={e => setFormData({ ...formData, year_name: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-4 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-medium py-2 rounded-xl transition-all flex justify-center items-center gap-2">
                            <Plus size={18} /> Add Academic Year
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-800/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Existing Academic Years</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-sm text-gray-400">
                                    <th className="pb-3 font-medium">Year Name</th>
                                    <th className="pb-3 font-medium">Start Date</th>
                                    <th className="pb-3 font-medium">End Date</th>
                                    <th className="pb-3 font-medium text-center">Status</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {years.map((y) => (
                                    <tr key={y.id} className="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition-colors">
                                        <td className="py-4 font-medium text-white">{y.year_name}</td>
                                        <td className="py-4 text-gray-300">{y.start_date}</td>
                                        <td className="py-4 text-gray-300">{y.end_date}</td>
                                        <td className="py-4 text-center">
                                            {y.is_active ?
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium"><CheckCircle size={14} /> Active</span> :
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-medium"><XCircle size={14} /> Inactive</span>
                                            }
                                        </td>
                                        <td className="py-4 text-right">
                                            <button onClick={() => handleDeleteYear(y.id)} className="p-1.5 cursor-pointer text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {years.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">No academic years configured.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="glass-card p-6 rounded-2xl border border-gray-800/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-violet-400" /> Manage Classes
                    </h2>

                    <form onSubmit={handleAddClass} className="flex gap-2 mb-6">
                        <input
                            required
                            type="text"
                            placeholder="e.g. Class 11"
                            value={newClass}
                            onChange={(e) => setNewClass(e.target.value)}
                            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                        />
                        <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-4 rounded-xl transition-colors flex items-center justify-center">
                            <Plus size={20} />
                        </button>
                    </form>

                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {classes.map(c => (
                            <li key={c.id} className="p-3 bg-white/5 border border-gray-800/50 rounded-xl text-white font-medium flex justify-between items-center group hover:border-violet-500/50 transition-colors">
                                <span>{c.class_name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="bg-violet-500/10 text-violet-400 text-xs px-2 py-1 rounded-full">{sections.filter(s => String(s.class_id) === String(c.id)).length} sections</span>
                                    <button onClick={() => handleDeleteClass(c.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-gray-800/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <ListTree size={20} className="text-pink-400" /> Manage Sections
                    </h2>

                    <form onSubmit={handleAddSection} className="flex gap-2 mb-6">
                        <select
                            required
                            value={newSection.class_id}
                            onChange={(e) => setNewSection({ ...newSection, class_id: e.target.value })}
                            className="w-1/3 bg-gray-900/50 border border-gray-700 rounded-xl px-2 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                        </select>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Science Branch"
                            value={newSection.section_name}
                            onChange={(e) => setNewSection({ ...newSection, section_name: e.target.value })}
                            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                        />
                        <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-4 rounded-xl transition-colors flex items-center justify-center">
                            <Plus size={20} />
                        </button>
                    </form>

                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {sections.map(s => {
                            const parentClass = classes.find(c => String(c.id) === String(s.class_id));
                            return (
                                <li key={s.id} className="p-3 bg-white/5 border border-gray-800/50 rounded-xl text-white font-medium flex justify-between items-center group hover:border-pink-500/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span>{s.section_name}</span>
                                        <span className="text-gray-500 text-sm">in {parentClass ? parentClass.class_name : 'Unknown Class'}</span>
                                    </div>
                                    <button onClick={() => handleDeleteSection(s.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Academics;
