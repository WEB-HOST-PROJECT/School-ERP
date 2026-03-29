import React from 'react'
import { Wallet, Search, Filter, History, FileText } from 'lucide-react'

const FeeManagement = () => {
    return (
        <div className="space-y-6 fade-in h-full flex flex-col">
            <header className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Wallet className="text-emerald-500" /> Fee Management
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Track student fee dues, process payments, and generate receipts.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors text-sm font-medium text-gray-300">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors text-sm font-medium text-white shadow-lg shadow-emerald-500/20">
                        <FileText size={16} /> Print Reports
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-5 rounded-2xl border border-gray-800/50 flex flex-col">
                    <span className="text-gray-400 text-sm font-medium mb-1">Total Expected (Q1)</span>
                    <span className="text-2xl font-bold text-white mb-2">₹14,50,000</span>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-auto">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-gray-800/50 flex flex-col">
                    <span className="text-gray-400 text-sm font-medium mb-1">Total Collected</span>
                    <span className="text-2xl font-bold text-emerald-400 mb-2">₹12,40,000</span>
                    <span className="text-xs text-gray-500 mt-auto">85% of expected collection</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-gray-800/50 flex flex-col">
                    <span className="text-gray-400 text-sm font-medium mb-1">Pending Dues</span>
                    <span className="text-2xl font-bold text-rose-400 mb-2">₹2,10,000</span>
                    <span className="text-xs text-gray-500 mt-auto">Across 45 students</span>
                </div>
            </div>

            <div className="flex-1 glass-card rounded-2xl border border-gray-800/50 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/30">
                    <h3 className="font-medium text-white">Recent Transactions</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input 
                            type="text" 
                            placeholder="Receipt # or Student" 
                            className="bg-gray-800/50 border border-gray-700 rounded-full pl-8 pr-4 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors w-64"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center text-center">
                    <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                        <History size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-gray-400">Loading recent transactions from server...</p>
                </div>
            </div>
        </div>
    )
}

export default FeeManagement