import React from 'react'
import { Users, GraduationCap, Building2, TrendingUp, IndianRupee } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="glass-card p-6 rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-opacity-10 backdrop-blur-sm ${colorClass}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div>
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold text-white mt-1 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r transition-all duration-300 from-white to-gray-400">
                {value}
            </p>
        </div>
    </div>
)

const Dashboard = () => {
    return (
        <div className="space-y-6 fade-in">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-gray-400 text-sm mt-1">Welcome back, here's what's happening today.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Students" 
                    value="1,248" 
                    icon={Users} 
                    trend={12} 
                    colorClass="bg-blue-500 from-blue-500 to-cyan-500 bg-gradient-to-br" 
                />
                <StatCard 
                    title="Active Classes" 
                    value="42" 
                    icon={Building2} 
                    colorClass="bg-pink-500 from-pink-500 to-rose-500 bg-gradient-to-br" 
                />
                <StatCard 
                    title="Total Collections" 
                    value="₹12.4L" 
                    icon={IndianRupee} 
                    trend={8.5} 
                    colorClass="bg-violet-500 from-violet-500 to-purple-500 bg-gradient-to-br" 
                />
                <StatCard 
                    title="New Enrollments" 
                    value="156" 
                    icon={TrendingUp} 
                    trend={24} 
                    colorClass="bg-emerald-500 from-emerald-500 to-teal-500 bg-gradient-to-br" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-gray-800/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Revenue Analytics</h2>
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-700/50 rounded-xl bg-white/5">
                        <TrendingUp size={48} className="text-gray-600 mb-2" />
                        <p className="text-gray-500 text-sm">Chart rendering placeholder</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 border border-gray-800/50 min-h-[300px]">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                    <ul className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <li key={i} className="flex gap-3 items-start pb-4 border-b border-gray-800/50 last:border-0">
                                <span className="h-2 w-2 mt-2 rounded-full bg-pink-500"></span>
                                <div>
                                    <p className="text-sm text-gray-300">New student enrolled in Class 10th A</p>
                                    <span className="text-xs text-gray-500">2 hours ago</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Dashboard