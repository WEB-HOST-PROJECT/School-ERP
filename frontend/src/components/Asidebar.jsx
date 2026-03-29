import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
    LayoutDashboard, 
    Users, 
    UserPlus, 
    Wallet, 
    CreditCard, 
    CalendarDays, 
    Building2, 
    ListTree, 
    Settings,
    GraduationCap
} from 'lucide-react'

const AsideBar = () => {
    const location = useLocation()

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/enrollments', label: 'Enrollments', icon: UserPlus },
        { path: '/fee-management', label: 'Fee Mgmt', icon: Wallet },
        { path: '/fee-payments', label: 'Payments', icon: CreditCard },
        { path: '/academic', label: 'Academic', icon: CalendarDays },
        { path: '/fee-structure', label: 'Fee Structure', icon: GraduationCap },
        { path: '/setting', label: 'Setting', icon: Settings },
    ]

    return (
        <aside className='h-screen w-64 glass-card border-r border-gray-800/50 flex flex-col fixed left-0 top-0 overflow-y-auto no-scrollbar'>
            <div className="p-6 flex items-center gap-3 border-b border-gray-800/50">
                <div className="bg-gradient-to-br from-pink-500 to-violet-600 p-2 rounded-xl">
                    <GraduationCap size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    EduCore ERP
                </h1>
            </div>

            <nav className='flex-1 p-4 space-y-1'>
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                isActive 
                                    ? 'bg-gradient-to-r from-pink-500/10 to-violet-600/10 text-pink-400 shadow-sm border border-pink-500/20' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon size={20} className={isActive ? "text-pink-400" : "text-gray-500"} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
            
            <div className="p-4 border-t border-gray-800/50">
                <p className="text-xs text-center text-gray-600">v2.0.0 &copy; 2026</p>
            </div>
        </aside>
    )
}

export default AsideBar