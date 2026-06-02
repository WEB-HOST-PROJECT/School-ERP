import React, { useEffect, useState } from 'react';
import { X, Printer, Download, Mail, CheckCircle, School, User, Calendar, CreditCard, Hash } from 'lucide-react';
import { getReceiptById, downloadReceiptPdf } from '../api/receiptApi';
import toast from 'react-hot-toast';

const ReceiptModal = ({ receiptId, isOpen, onClose }) => {
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && receiptId) {
            fetchReceipt();
        }
    }, [isOpen, receiptId]);

    const fetchReceipt = async () => {
        setLoading(true);
        try {
            const res = await getReceiptById(receiptId);
            setReceiptData(res.data);
        } catch (err) {
            toast.error("Failed to load receipt details");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            await downloadReceiptPdf(receiptData.receipt.id, receiptData.receipt.receipt_no);
            toast.success("PDF Downloaded");
        } catch (err) {
            toast.error("Failed to download PDF");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
            <div className="bg-white text-gray-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:rounded-none">
                {/* Modal Header - Hidden during print */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={20} /> Payment Receipt
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Print">
                            <Printer size={18} />
                        </button>
                        <button onClick={handleDownload} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Download PDF">
                            <Download size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Receipt Content */}
                <div className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-0" id="printable-receipt">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Loading Receipt...</p>
                        </div>
                    ) : receiptData ? (
                        <div className="receipt-container">
                            {/* School Header */}
                            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-100 pb-6">
                                <div>
                                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                        <School className="text-pink-500" /> {receiptData.school.name}
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1">{receiptData.school.address}</p>
                                    <p className="text-gray-500 text-xs">Phone: {receiptData.school.phone} | Email: {receiptData.school.email}</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">Paid</div>
                                    <p className="text-sm font-bold text-gray-900">{receiptData.receipt.receipt_no}</p>
                                    <p className="text-xs text-gray-500">{receiptData.receipt.receipt_date}</p>
                                </div>
                            </div>

                            {/* Student & Payment Info Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={12} /> Student Details
                                    </h4>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{receiptData.receipt.student_name}</p>
                                        <p className="text-xs text-gray-600">Class: {receiptData.receipt.class_name} - {receiptData.receipt.section_name}</p>
                                        <p className="text-xs text-gray-600">Roll No: {receiptData.receipt.roll_no || 'N/A'}</p>
                                        <p className="text-xs text-gray-600">F's Name: {receiptData.receipt.father_name}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard size={12} /> Payment Info
                                    </h4>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Method: <span className="capitalize">{receiptData.receipt.payment_method}</span></p>
                                        <p className="text-xs text-gray-600">Reference: {receiptData.receipt.transaction_reference || 'N/A'}</p>
                                        <p className="text-xs text-gray-600">Academic Year: {receiptData.receipt.academic_year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Breakdown Table */}
                            <table className="w-full text-sm mb-8">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b border-gray-100">
                                        <th className="py-3 font-bold uppercase text-[10px] tracking-widest">Description</th>
                                        <th className="py-3 font-bold uppercase text-[10px] tracking-widest text-center">Month</th>
                                        <th className="py-3 font-bold uppercase text-[10px] tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {receiptData.feeDetails.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-3 text-gray-800 font-medium">{item.fee_type_name || 'Other Fee'}</td>
                                            <td className="py-3 text-gray-500 text-center">{item.month || '—'}</td>
                                            <td className="py-3 text-gray-900 font-bold text-right">₹{parseFloat(item.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-900">
                                        <td colSpan="2" className="py-4 text-gray-500 font-bold uppercase tracking-wider">Total Amount Paid</td>
                                        <td className="py-4 text-xl font-black text-gray-900 text-right">₹{receiptData.receipt.total_amount.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Footer */}
                            <div className="mt-12 flex justify-between items-end">
                                <div className="text-[10px] text-gray-400 italic">
                                    <p>Generated on: {new Date(receiptData.receipt.timestamp).toLocaleString()}</p>
                                    <p>This is a computer generated document.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-32 border-b border-gray-300 mb-2"></div>
                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Authorized Signatory</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Modal Footer - Hidden during print */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 print:hidden">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-receipt, #printable-receipt * { visibility: visible; }
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    @page { margin: 1cm; }
                }
            `}</style>
        </div>
    );
};

export default ReceiptModal;
