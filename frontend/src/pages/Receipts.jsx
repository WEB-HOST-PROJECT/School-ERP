import React, { useEffect, useState } from 'react';
import { Receipt, Search, Eye, Download, Printer, Filter, Calendar } from 'lucide-react';
import API from '../api/api';
import { downloadReceiptPdf } from '../api/receiptApi';
import ReceiptModal from '../components/ReceiptModal';
import toast from 'react-hot-toast';

const Receipts = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            // We can fetch all payments since they usually have receipts
            const res = await API.get('/payments');
            setReceipts(res.data);
        } catch (err) {
            toast.error("Failed to fetch receipts");
        } finally {
            setLoading(false);
        }
    };

    const handleViewReceipt = (receiptNo) => {
        setSelectedReceiptId(receiptNo);
        setIsModalOpen(true);
    };

    const handleDownload = async (pay) => {
        try {
            await downloadReceiptPdf(pay.receipt_no || pay.id, pay.receipt_no || `REC-${pay.id}`);
            toast.success("Downloading PDF...");
        } catch (err) {
            toast.error("Failed to download PDF");
        }
    };

    const filteredReceipts = receipts.filter(r => {
        const matchesSearch = 
            (r.receipt_no?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDate = dateFilter ? r.payment_date === dateFilter : true;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="h-full flex flex-col fade-in">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Receipt className="text-pink-500" /> Fee Receipts
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">View and manage all generated fee receipts.</p>
                </div>
            </header>

            <div className="flex-1 flex flex-col bg-gray-900/40 rounded-2xl border border-gray-800/50 backdrop-blur-xl overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-800/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Receipt No or Student Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-pink-500 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-gray-800/50 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-pink-500 transition-all"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => { setSearchQuery(''); setDateFilter(''); }}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm">Loading receipts...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-800/80 sticky top-0 backdrop-blur-md z-10">
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Receipt No</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Student Name</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Date</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Method</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Amount</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredReceipts.length > 0 ? filteredReceipts.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-pink-400">{r.receipt_no || `Pending-${r.id}`}</td>
                                        <td className="px-6 py-4 text-white font-medium">{r.student_name}</td>
                                        <td className="px-6 py-4 text-gray-400">{r.payment_date}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-bold uppercase text-gray-300">
                                                {r.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-400">₹{r.total_amount?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleViewReceipt(r.receipt_no || r.id)}
                                                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDownload(r)}
                                                    className="p-2 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 rounded-xl transition-all"
                                                    title="Download PDF"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-600">
                                                <Receipt size={48} />
                                                <p>No receipts found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ReceiptModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                receiptId={selectedReceiptId} 
            />
        </div>
    );
};

export default Receipts;
