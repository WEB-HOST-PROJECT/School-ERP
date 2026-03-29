import React, { useState, useEffect } from 'react';
import { GraduationCap, Landmark, Plus, Bus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/api';

const FeeSetup = () => {
    const [feeTypes, setFeeTypes] = useState([]);
    const [structures, setStructures] = useState([]);
    const [transportRoutes, setTransportRoutes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    const [newFeeType, setNewFeeType] = useState({ name: '', frequency: 'Monthly' });
    const [newStructure, setNewStructure] = useState({ class_id: '', fee_type_id: '', academic_year_id: '', amount: '' });
    const [newTransport, setNewTransport] = useState({ route_no: '', route_name: '', amount: '' });

    const fetchAllData = async () => {
        try {
            const [ftRes, fsRes, trRes, clRes, acRes] = await Promise.all([
                API.get('/fee/types'),
                API.get('/fee/structures'),
                API.get('/transport'),
                API.get('/classes/class'),
                API.get('/academics')
            ]);
            setFeeTypes(ftRes.data);
            setStructures(fsRes.data);
            setTransportRoutes(trRes.data);
            setClasses(clRes.data);
            setAcademicYears(acRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load setup data");
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddType = async (e) => {
        e.preventDefault();
        try {
            await API.post('/fee/types', { fee_type_name: newFeeType.name, frequency: newFeeType.frequency });
            toast.success("Fee Type added");
            setNewFeeType({ name: '', frequency: 'Monthly' });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.err || "Failed to add Fee Type");
        }
    };

    const handleDeleteFeeType = async (id) => {
        if (!window.confirm("Delete this fee type?")) return;
        try {
            await API.delete(`/fee/types/${id}`);
            toast.success("Fee type deleted");
            fetchAllData();
        } catch (error) { toast.error("Failed to delete fee type"); }
    };

    const handleAddStructure = async (e) => {
        e.preventDefault();
        try {
            await API.post('/fee/structures', newStructure);
            toast.success("Fee Structure mapped");
            setNewStructure({ ...newStructure, amount: '' });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.err || "Failed to map structure");
        }
    };

    const handleDeleteStructure = async (id) => {
        if (!window.confirm("Delete this fee structure?")) return;
        try {
            await API.delete(`/fee/structures/${id}`);
            toast.success("Fee structure deleted");
            fetchAllData();
        } catch (error) { toast.error("Failed to delete structure"); }
    };

    const handleAddTransport = async (e) => {
        e.preventDefault();
        try {
            await API.post('/transport', newTransport);
            toast.success("Transport Route added");
            setNewTransport({ route_no: '', route_name: '', amount: '' });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.err || "Failed to add route");
        }
    };

    const handleDeleteTransport = async (id) => {
        if (!window.confirm("Delete this transport route?")) return;
        try {
            await API.delete(`/transport/${id}`);
            toast.success("Route deleted");
            fetchAllData();
        } catch (error) {
            toast.error("Failed to delete route");
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="text-pink-500" /> Fee Setup Configuration
                </h1>
                <p className="text-gray-400 text-sm mt-1">Define fee types and map them to class structures.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-gray-800/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Landmark size={20} className="text-violet-400" /> Manage Fee Types
                    </h2>

                    <form onSubmit={handleAddType} className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required
                                type="text"
                                placeholder="Fee Name (e.g. Transport)"
                                value={newFeeType.name}
                                onChange={(e) => setNewFeeType({ ...newFeeType, name: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                            />
                            <select
                                required
                                value={newFeeType.frequency}
                                onChange={(e) => setNewFeeType({ ...newFeeType, frequency: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                                <option value="One-Time">One-Time</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-xl transition-all flex justify-center items-center gap-2">
                            <Plus size={18} /> Add Fee Type
                        </button>
                    </form>

                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {feeTypes.map(f => (
                            <li key={f.id} className="p-3 bg-white/5 border border-gray-800/50 rounded-xl text-white font-medium flex justify-between items-center group hover:border-violet-500/50 transition-colors">
                                <span>{f.fee_type_name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="bg-violet-500/10 text-violet-400 text-xs px-2 py-1 rounded-full">{f.frequency}</span>
                                    <button onClick={() => handleDeleteFeeType(f.id)} className="p-1.5 cursor-pointer text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-100 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-gray-800/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <GraduationCap size={20} className="text-pink-400" /> Structure Mapping
                    </h2>

                    <form onSubmit={handleAddStructure} className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                required
                                value={newStructure.academic_year_id}
                                onChange={(e) => setNewStructure({ ...newStructure, academic_year_id: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                            >
                                <option value="">Select Academic Year</option>
                                {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                            </select>
                            <select
                                required
                                value={newStructure.class_id}
                                onChange={(e) => setNewStructure({ ...newStructure, class_id: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-4 items-center">
                            <select
                                required
                                value={newStructure.fee_type_id}
                                onChange={(e) => setNewStructure({ ...newStructure, fee_type_id: e.target.value })}
                                className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                            >
                                <option value="">Select Fee Type</option>
                                {feeTypes.map(f => <option key={f.id} value={f.id}>{f.fee_type_name}</option>)}
                            </select>
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-2 text-gray-500">₹</span>
                                <input
                                    required
                                    type="number"
                                    placeholder="Amount"
                                    value={newStructure.amount}
                                    onChange={(e) => setNewStructure({ ...newStructure, amount: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-8 pr-4 py-2 text-white outline-none focus:border-pink-500 transition-colors"
                                />
                            </div>

                        </div>
                        <button type="submit" className="px-6 w-full cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 rounded-xl transition-all flex justify-center items-center gap-2">
                            <Plus size={18} /> Map
                        </button>
                    </form>

                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {structures.map(s => {
                            const className = classes.find(c => String(c.id) === String(s.class_id))?.class_name || 'Unknown Class';
                            const feeName = feeTypes.find(f => String(f.id) === String(s.fee_type_id))?.fee_type_name || 'Unknown Fee';
                            const yearName = academicYears.find(y => String(y.id) === String(s.academic_year_id))?.year_name || '';

                            return (
                                <li key={s.id} className="p-3 bg-white/5 border border-gray-800/50 rounded-xl text-white font-medium flex justify-between items-center group hover:border-pink-500/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm">{feeName} - {className}</span>
                                        <span className="text-gray-500 text-xs mt-0.5">{yearName}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-pink-400 font-bold">₹{s.amount}</span>
                                        <button onClick={() => handleDeleteStructure(s.id)} className="p-1.5 cursor-pointer text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                        {structures.length === 0 && <div className="text-center text-sm text-gray-500 py-4">No mapped fee structures</div>}
                    </ul>
                </div>

                {/* Transport Routes setup */}
                <div className="glass-card p-6 rounded-2xl border border-gray-800/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Bus size={20} className="text-emerald-400" /> Transport Routes
                    </h2>

                    <form onSubmit={handleAddTransport} className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required
                                type="text"
                                placeholder="Route No."
                                value={newTransport.route_no}
                                onChange={(e) => setNewTransport({ ...newTransport, route_no: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                            />
                            <input
                                required
                                type="text"
                                placeholder="Route Name"
                                value={newTransport.route_name}
                                onChange={(e) => setNewTransport({ ...newTransport, route_name: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-2 text-gray-500">₹</span>
                                <input
                                    required
                                    type="number"
                                    placeholder="Amount"
                                    value={newTransport.amount}
                                    onChange={(e) => setNewTransport({ ...newTransport, amount: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-8 pr-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <button type="submit" className="w-1/3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl transition-all flex justify-center items-center gap-2">
                                <Plus size={18} /> Add
                            </button>
                        </div>
                    </form>

                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {transportRoutes.map(route => (
                            <li key={route.id} className="p-3 bg-white/5 border border-gray-800/50 rounded-xl text-white font-medium flex justify-between items-center group hover:border-emerald-500/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm">Route No. - {route.route_no} ( {route.route_name} )</span>
                                    <span className="text-emerald-400 text-xs mt-0.5">₹{route.amount}</span>
                                </div>
                                <button onClick={() => handleDeleteTransport(route.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                        {transportRoutes.length === 0 && (
                            <div className="text-center text-sm text-gray-500 py-4">No transport routes configured</div>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FeeSetup;
