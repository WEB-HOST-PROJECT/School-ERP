import React, { useEffect, useState } from 'react'
import { Plus, Search, Receipt, CheckCircle, X, CreditCard, User, Zap } from 'lucide-react'
import API from '../api/api'
import toast from 'react-hot-toast'

const FeePayments = () => {
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [feeStructures, setFeeStructures] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);    // all records (advance tab)
    const [dueRecords, setDueRecords] = useState([]);   // due_date <= today, status != paid (demands tab)

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('records');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [payRemarks, setPayRemarks] = useState('');
    const [bulkStudentId, setBulkStudentId] = useState('');
    const [isBulkPaying, setIsBulkPaying] = useState(false);

    // Advance Payment state
    const [advStudentSearch, setAdvStudentSearch] = useState('');
    const [advSelectedStudent, setAdvSelectedStudent] = useState(null);
    const [advRecords, setAdvRecords] = useState([]);
    const [advSelectedIds, setAdvSelectedIds] = useState([]);
    const [advCustomAmount, setAdvCustomAmount] = useState('');
    const [advPayMethod, setAdvPayMethod] = useState('cash');
    const [advRemarks, setAdvRemarks] = useState('');
    const [isLoadingAdvRecords, setIsLoadingAdvRecords] = useState(false);
    const [isAdvPaying, setIsAdvPaying] = useState(false);

    // Smart Pay state
    const [isSmartPayOpen, setIsSmartPayOpen] = useState(false);
    const [smartAmount, setSmartAmount] = useState('');
    const [smartMethod, setSmartMethod] = useState('cash');
    const [smartRemarks, setSmartRemarks] = useState('');
    const [isSmartPaying, setIsSmartPaying] = useState(false);

    // Reporting state
    const [summary, setSummary] = useState({ total_expected: 0, total_collected: 0, total_pending: 0 });

    const [formData, setFormData] = useState({
        student_id: '',
        fee_structure_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        total_amount: '',
        payment_method: 'cash',
        remarks: ''
    });

    const fetchData = async () => {
        try {
            const [payRes, stuRes, fsRes, ftRes, clsRes, recordsRes, dueRes, summaryRes] = await Promise.all([
                API.get('/payments'),
                API.get('/students'),
                API.get('/fee/structures'),
                API.get('/fee/types'),
                API.get('/classes/class'),
                API.get('/student-fees/all'),
                API.get('/student-fees/due'),
                API.get('/fee-reports/summary')
            ]);
            setPayments(payRes.data);
            setStudents(stuRes.data);
            setFeeStructures(fsRes.data);
            setFeeTypes(ftRes.data);
            setClasses(clsRes.data);
            setFeeRecords(recordsRes.data);
            setDueRecords(dueRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            toast.error("Failed to load necessary data");
            console.error(err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Reset selections when filters change
    useEffect(() => { setSelectedIds([]); }, [bulkStudentId, searchQuery]);

    const handleGenerateMonthlyDemands = async () => {
        try {
            await API.post('/student-fees/generate-monthly');
            toast.success("Monthly fee demands generated!");
            fetchData();
        } catch (err) {
            toast.error("Failed to generate monthly demands");
        }
    };

    const fetchStudentRecords = async (student) => {
        setAdvSelectedStudent(student);
        setAdvSelectedIds([]);
        setAdvCustomAmount('');
        setIsLoadingAdvRecords(true);
        try {
            const res = await API.get(`/student-fees/${student.id}`);
            const sorted = [...res.data].sort((a, b) => {
                if (a.status === 'paid' && b.status !== 'paid') return 1;
                if (a.status !== 'paid' && b.status === 'paid') return -1;
                return a.month.localeCompare(b.month);
            });
            setAdvRecords(sorted);
        } catch {
            toast.error('Failed to load student fee records');
        } finally {
            setIsLoadingAdvRecords(false);
        }
    };

    const handleSmartPay = async () => {
        if (!advSelectedStudent) return toast.error('Select a student first');
        if (!smartAmount || parseFloat(smartAmount) <= 0) return toast.error('Enter a valid amount');
        setIsSmartPaying(true);
        try {
            const res = await API.post('/payments/smart-allocate', {
                student_id: advSelectedStudent.id,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: smartMethod,
                remarks: smartRemarks,
                total_amount: parseFloat(smartAmount)
            });
            toast.success(`⚡ ${res.data.message} | Receipt: ${res.data.receipt_no}`);
            setIsSmartPayOpen(false);
            setSmartAmount('');
            setSmartRemarks('');
            fetchStudentRecords(advSelectedStudent);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Smart allocation failed');
        } finally {
            setIsSmartPaying(false);
        }
    };

    const handlePayAdvance = async () => {
        if (!advSelectedStudent) return toast.error('Select a student first');
        if (advSelectedIds.length === 0) return toast.error('Select at least one fee record');
        setIsAdvPaying(true);
        try {
            const res = await API.post('/payments/advance', {
                student_id: advSelectedStudent.id,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: advPayMethod,
                remarks: advRemarks,
                fee_record_ids: advSelectedIds,
                custom_amount: advCustomAmount ? parseFloat(advCustomAmount) : undefined
            });
            toast.success(`✅ ${res.data.message} | ${res.data.receipt_no}`);
            fetchStudentRecords(advSelectedStudent);
            fetchData();
            setAdvSelectedIds([]);
            setAdvCustomAmount('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Advance payment failed');
        } finally {
            setIsAdvPaying(false);
        }
    };

    // -- Single Payment --
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            student_id: parseInt(formData.student_id),
            fee_structure_id: parseInt(formData.fee_structure_id),
            payment_date: formData.payment_date,
            total_amount: parseFloat(formData.total_amount),
            payment_method: formData.payment_method,
            remarks: formData.remarks,
            payment_details: [{
                fee_structure_id: parseInt(formData.fee_structure_id),
                amount: parseFloat(formData.total_amount)
            }]
        };
        try {
            await API.post('/payments', payload);
            toast.success("Payment recorded successfully!");
            setIsModalOpen(false);
            setFormData({ student_id: '', fee_structure_id: '', payment_date: new Date().toISOString().split('T')[0], total_amount: '', payment_method: 'cash', remarks: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to record payment");
        }
    };

    // -- Bulk Payment --
    const unpaidRecords = dueRecords;
    const filteredRecords = unpaidRecords.filter(r => {
        const matchStudent = bulkStudentId ? String(r.student_id) === String(bulkStudentId) : true;
        const matchSearch = r.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStudent && matchSearch;
    });

    const selectedRecords = filteredRecords.filter(r => selectedIds.includes(r.id));
    const totalDue = selectedRecords.reduce((sum, r) => sum + (parseFloat(r.amount) - parseFloat(r.paid_amount || 0)), 0);

    const isAllSelected = filteredRecords.length > 0 && filteredRecords.every(r => selectedIds.includes(r.id));

    const toggleSelectAll = () => {
        if (isAllSelected) setSelectedIds([]);
        else setSelectedIds(filteredRecords.map(r => r.id));
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handlePaySelected = async () => {
        if (selectedIds.length === 0) return toast.error("No records selected");
        // Must all belong to same student for one payment record
        const studentIds = [...new Set(selectedRecords.map(r => r.student_id))];
        if (studentIds.length > 1) return toast.error("Please filter by one student before paying");

        setIsBulkPaying(true);
        try {
            const res = await API.post('/payments/multiple', {
                student_id: studentIds[0],
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: paymentMethod,
                remarks: payRemarks,
                fee_record_ids: selectedIds
            });
            toast.success(`✅ ${res.data.message} | Receipt: ${res.data.receipt_no}`);
            setSelectedIds([]);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Bulk payment failed");
        } finally {
            setIsBulkPaying(false);
        }
    };

    const getStudentName = (id) => students.find(s => s.id === id)?.name || "Unknown Student";
    const getClassName = (id) => classes.find(c => c.id === id)?.class_name || "—";
    const getFeeTypeName = (id) => feeTypes.find(f => f.id === id)?.fee_type_name || "—";

    const filteredPayments = payments.filter(p =>
        p.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receipt_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col fade-in relative">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Receipt className="text-pink-500" /> Fee Payments
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage fee collections and track outstanding demands.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerateMonthlyDemands}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 rounded-xl transition-all font-medium text-sm"
                    >
                        Generate Demands
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 rounded-xl transition-all shadow-lg shadow-pink-500/20 text-white font-medium text-sm"
                    >
                        <Plus size={16} /> Record Payment
                    </button>
                </div>
            </header>

            {/* Quick Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-900/40 border border-emerald-500/25 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle className="text-emerald-500" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Collection</p>
                        <p className="text-2xl font-bold text-white">₹{summary.total_collected?.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-gray-900/40 border border-rose-500/25 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <CreditCard className="text-rose-500" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Pending</p>
                        <p className="text-2xl font-bold text-white">₹{summary.total_pending?.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-gray-900/40 border border-violet-500/25 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                        <Zap className="text-violet-500" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Estimated Revenue</p>
                        <p className="text-2xl font-bold text-white">₹{summary.total_expected?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-900/40 rounded-2xl border border-gray-800/50 backdrop-blur-xl overflow-hidden">
                {/* Tab bar + search */}
                <div className="p-4 border-b border-gray-800/50 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-2">
                        <button onClick={() => setViewMode('records')} className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-colors ${viewMode === 'records' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'}`}>
                            Monthly Fee Demands
                        </button>
                        <button onClick={() => setViewMode('payments')} className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-colors ${viewMode === 'payments' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'}`}>
                            Payment Receipts
                        </button>
                        <button onClick={() => { setViewMode('advance'); setAdvSelectedIds([]); }} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium text-sm transition-colors ${viewMode === 'advance' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'}`}>
                            <Zap size={13} /> Advance Payment
                        </button>
                    </div>

                    <div className="flex gap-2 items-center">
                        {viewMode === 'records' && (
                            <select
                                value={bulkStudentId}
                                onChange={e => setBulkStudentId(e.target.value)}
                                className="bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                            >
                                <option value="">All Students</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        )}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-800/50 border border-gray-700 rounded-full pl-9 pr-4 py-1.5 text-xs text-white outline-none focus:border-pink-500 focus:bg-gray-800 transition-all w-48 focus:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Monthly Fee Demands Tab */}
                {viewMode === 'records' ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Bulk action toolbar */}
                        {selectedIds.length > 0 && (
                            <div className="px-6 py-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-4 flex-wrap">
                                <span className="text-blue-400 font-medium text-sm">{selectedIds.length} record(s) selected — Total Due: <span className="text-white font-bold">₹{totalDue.toFixed(2)}</span></span>
                                <select
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-blue-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Remarks (optional)"
                                    value={payRemarks}
                                    onChange={e => setPayRemarks(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-blue-500 w-40"
                                />
                                <button
                                    onClick={handlePaySelected}
                                    disabled={isBulkPaying}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg text-white font-bold text-sm disabled:opacity-60 transition-all shadow-md shadow-emerald-500/20"
                                >
                                    <CreditCard size={14} />
                                    {isBulkPaying ? 'Processing...' : `Pay Selected (₹${totalDue.toFixed(2)})`}
                                </button>
                                <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white text-xs">
                                    Clear
                                </button>
                            </div>
                        )}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-800/80 sticky top-0 backdrop-blur-md z-10">
                                    <tr className="text-gray-400 border-b border-gray-700">
                                        <th className="px-4 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-4 py-4 font-medium">Student</th>
                                        <th className="px-4 py-4 font-medium">Fee Type</th>
                                        <th className="px-4 py-4 font-medium">Month</th>
                                        <th className="px-4 py-4 font-medium text-right">Amount</th>
                                        <th className="px-4 py-4 font-medium text-right">Paid</th>
                                        <th className="px-4 py-4 font-medium text-right">Due</th>
                                        <th className="px-4 py-4 font-medium">Due Date</th>
                                        <th className="px-4 py-4 font-medium text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filteredRecords.length > 0 ? filteredRecords.map((rec) => {
                                        const due = parseFloat(rec.amount) - parseFloat(rec.paid_amount || 0);
                                        const isSelected = selectedIds.includes(rec.id);
                                        return (
                                            <tr
                                                key={rec.id}
                                                onClick={() => toggleSelect(rec.id)}
                                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-500/10 hover:bg-blue-500/15' : 'hover:bg-white/5'}`}
                                            >
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(rec.id)}
                                                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-white font-medium">{rec.student_name || getStudentName(rec.student_id)}</td>
                                                <td className="px-4 py-3 text-gray-300">{rec.fee_type_name || '—'}</td>
                                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{rec.month}</td>
                                                <td className="px-4 py-3 text-right text-white">₹{parseFloat(rec.amount).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right text-emerald-400">₹{parseFloat(rec.paid_amount || 0).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-bold text-rose-400">₹{due.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{rec.due_date || '—'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${rec.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : rec.status === 'partial' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'}`}>
                                                        {rec.status || 'pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-16 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Receipt size={40} className="text-gray-700" />
                                                    <p>No pending fee demands found.</p>
                                                    <button onClick={handleGenerateMonthlyDemands} className="text-emerald-400 text-sm hover:underline">Generate monthly demands</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : viewMode === 'advance' ? (
                    /* ── Advance Payment Tab ── */
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left: Student List */}
                        <div className="w-72 flex-shrink-0 border-r border-gray-800/50 flex flex-col">
                            <div className="p-3 border-b border-gray-800/50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                                    <input
                                        type="text"
                                        placeholder="Search student..."
                                        value={advStudentSearch}
                                        onChange={e => setAdvStudentSearch(e.target.value)}
                                        className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-violet-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {students
                                    .filter(s => s.name.toLowerCase().includes(advStudentSearch.toLowerCase()) || String(s.id).includes(advStudentSearch))
                                    .map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => fetchStudentRecords(s)}
                                            className={`w-full text-left px-4 py-3 border-b border-gray-800/30 flex items-center gap-3 transition-colors ${
                                                advSelectedStudent?.id === s.id
                                                    ? 'bg-violet-500/15 border-l-2 border-l-violet-500'
                                                    : 'hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                <User size={14} className="text-violet-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{s.name}</p>
                                                <p className="text-xs text-gray-500">#{s.id} · {s.pen_no || 'N/A'}</p>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Right: Fee Records */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {!advSelectedStudent ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3">
                                    <User size={40} />
                                    <p className="text-sm">Select a student to view fee records</p>
                                </div>
                            ) : isLoadingAdvRecords ? (
                                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Loading records...</div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="px-5 py-3 border-b border-gray-800/50 flex items-center justify-between gap-4 flex-wrap">
                                        <div>
                                            <p className="text-white font-semibold">{advSelectedStudent.name}</p>
                                            <p className="text-xs text-gray-500">
                                                Pending: <span className="text-rose-400 font-medium">₹{advRecords.filter(r => r.status !== 'paid').reduce((s, r) => s + Math.max(0, parseFloat(r.amount) - parseFloat(r.paid_amount || 0)), 0).toFixed(2)}</span>
                                                &nbsp;·&nbsp;
                                                Total advance paid: <span className="text-emerald-400 font-medium">₹{advRecords.reduce((s, r) => s + parseFloat(r.paid_amount || 0), 0).toFixed(2)}</span>
                                            </p>
                                        </div>
                                        {advSelectedIds.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder={`Max: ₹${advRecords.filter(r => advSelectedIds.includes(r.id) && r.status !== 'paid').reduce((s, r) => s + Math.max(0, parseFloat(r.amount) - parseFloat(r.paid_amount || 0)), 0).toFixed(2)}`}
                                                    value={advCustomAmount}
                                                    onChange={e => setAdvCustomAmount(e.target.value)}
                                                    className="bg-gray-800 border border-violet-500/40 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-violet-400 w-44"
                                                />
                                                <select
                                                    value={advPayMethod}
                                                    onChange={e => setAdvPayMethod(e.target.value)}
                                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="upi">UPI</option>
                                                    <option value="card">Card</option>
                                                    <option value="bank_transfer">Bank Transfer</option>
                                                    <option value="cheque">Cheque</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Remarks"
                                                    value={advRemarks}
                                                    onChange={e => setAdvRemarks(e.target.value)}
                                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500 w-32"
                                                />
                                                <button
                                                    onClick={() => setIsSmartPayOpen(true)}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 text-violet-400 rounded-lg text-sm font-bold transition-all shadow-md shadow-violet-500/10"
                                                >
                                                    <Zap size={13} fill="currentColor" /> Smart Pay
                                                </button>
                                                <button
                                                    onClick={handlePayAdvance}
                                                    disabled={isAdvPaying}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-lg text-white font-bold text-sm disabled:opacity-60 transition-all shadow-md shadow-violet-500/20"
                                                >
                                                    {isAdvPaying ? 'Processing...' : `Pay Selection (${advSelectedIds.length})`}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fee Records Table */}
                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-800/80 sticky top-0 backdrop-blur-md">
                                                <tr className="text-gray-400 border-b border-gray-700 text-xs uppercase tracking-wide">
                                                    <th className="px-4 py-3 w-10">
                                                        <input type="checkbox"
                                                            className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                                                            checked={advRecords.filter(r => r.status !== 'paid').length > 0 && advRecords.filter(r => r.status !== 'paid').every(r => advSelectedIds.includes(r.id))}
                                                            onChange={() => {
                                                                const unpaid = advRecords.filter(r => r.status !== 'paid').map(r => r.id);
                                                                const allSel = unpaid.every(id => advSelectedIds.includes(id));
                                                                setAdvSelectedIds(allSel ? [] : unpaid);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3">Fee Type</th>
                                                    <th className="px-4 py-3">Month</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                    <th className="px-4 py-3 text-right">Paid</th>
                                                    <th className="px-4 py-3 text-right">Due</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/40">
                                                {advRecords.length > 0 ? advRecords.map(rec => {
                                                    const due = Math.max(0, parseFloat(rec.amount) - parseFloat(rec.paid_amount || 0));
                                                    const isSelected = advSelectedIds.includes(rec.id);
                                                    const isFuture = rec.month > new Date().toISOString().slice(0, 7);
                                                    const isPaid = rec.status === 'paid';
                                                    return (
                                                        <tr
                                                            key={rec.id}
                                                            onClick={() => { if (!isPaid) setAdvSelectedIds(prev => prev.includes(rec.id) ? prev.filter(x => x !== rec.id) : [...prev, rec.id]); }}
                                                            className={`transition-colors ${
                                                                isPaid ? 'opacity-50 cursor-not-allowed' :
                                                                isSelected ? 'bg-violet-500/10 cursor-pointer hover:bg-violet-500/15' :
                                                                'cursor-pointer hover:bg-white/5'
                                                            }`}
                                                        >
                                                            <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                                                                <input type="checkbox" disabled={isPaid}
                                                                    checked={isSelected}
                                                                    onChange={() => { if (!isPaid) setAdvSelectedIds(prev => prev.includes(rec.id) ? prev.filter(x => x !== rec.id) : [...prev, rec.id]); }}
                                                                    className="w-4 h-4 rounded accent-violet-500 cursor-pointer disabled:cursor-not-allowed"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2.5 text-gray-300 text-xs">{rec.fee_type_name || '—'}</td>
                                                            <td className="px-4 py-2.5">
                                                                <span className={`font-mono text-xs px-2 py-0.5 rounded ${isFuture ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-gray-400'}`}>
                                                                    {rec.month} {isFuture && '↑'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right text-white text-xs">₹{parseFloat(rec.amount).toLocaleString()}</td>
                                                            <td className="px-4 py-2.5 text-right text-emerald-400 text-xs">₹{parseFloat(rec.paid_amount || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-2.5 text-right font-bold text-xs text-rose-400">₹{due.toFixed(2)}</td>
                                                            <td className="px-4 py-2.5 text-center">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                                                                    rec.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                                                                    rec.status === 'partial' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                                                                    'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                                                }`}>
                                                                    {rec.status || 'pending'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                }) : (
                                                    <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-600 text-sm">No fee records found for this student.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Payment Receipts Tab */
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-800/80 sticky top-0 backdrop-blur-md z-10">
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="px-6 py-4 font-medium">Receipt No</th>
                                    <th className="px-6 py-4 font-medium">Student</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Method</th>
                                    <th className="px-6 py-4 font-medium text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredPayments.length > 0 ? filteredPayments.map((pay) => (
                                    <tr key={pay.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-3 font-medium text-pink-400">{pay.receipt_no || `Pending-${pay.id}`}</td>
                                        <td className="px-6 py-3 text-white">{pay.student_name || getStudentName(pay.student_id)}</td>
                                        <td className="px-6 py-3 text-gray-400">{pay.payment_date}</td>
                                        <td className="px-6 py-3">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 border border-gray-700 uppercase">{pay.payment_method || 'Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold text-emerald-400">₹{pay.total_amount?.toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No payments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Smart Pay Modal */}
            {isSmartPayOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                                        <Zap size={20} className="text-violet-500" fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Smart Allocate</h3>
                                        <p className="text-xs text-gray-500">Auto-distribute payment across dues (FIFO)</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsSmartPayOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Student</label>
                                    <div className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-white font-medium flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                                            <User size={12} className="text-violet-400" />
                                        </div>
                                        {advSelectedStudent?.name || "Select a student first"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={smartAmount}
                                            onChange={e => setSmartAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-violet-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Method</label>
                                        <select
                                            value={smartMethod}
                                            onChange={e => setSmartMethod(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-violet-500 transition-all appearance-none"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="online">Online</option>
                                            <option value="check">Check</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Remarks</label>
                                    <textarea
                                        value={smartRemarks}
                                        onChange={e => setSmartRemarks(e.target.value)}
                                        placeholder="Add notes..."
                                        rows={2}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-violet-500 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSmartPay}
                                disabled={isSmartPaying || !smartAmount}
                                className="w-full mt-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSmartPaying ? "Processing Allocation..." : "⚡ Confirm Smart Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Payment Modal */}
            {isModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col" style={{animation: 'slideIn 0.3s ease-out'}}>
                        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CheckCircle className="text-emerald-500" size={20} /> Record Single Payment
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <form id="payment-form" onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Select Student</label>
                                    <select required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none transition-all">
                                        <option value="">-- Choose Student --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Fee Category</label>
                                    <select required value={formData.fee_structure_id} onChange={e => setFormData({...formData, fee_structure_id: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none transition-all">
                                        <option value="">-- Choose Fee Structure --</option>
                                        {feeStructures.map(fs => <option key={fs.id} value={fs.id}>{getClassName(fs.class_id)} — {getFeeTypeName(fs.fee_type_id)} (₹{fs.amount})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-300">Amount (₹)</label>
                                        <input type="number" required min="1" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none" placeholder="5000" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-300">Date</label>
                                        <input type="date" required value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Payment Method</label>
                                    <select required value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none">
                                        <option value="cash">Cash</option>
                                        <option value="upi">UPI</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Remarks</label>
                                    <textarea rows="3" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none resize-none" placeholder="Optional notes..." />
                                </div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-gray-800 bg-gray-900/90">
                            <button type="submit" form="payment-form" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all shadow-lg text-white font-bold">
                                <CheckCircle size={18} /> Confirm Payment
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default FeePayments;
