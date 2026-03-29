import React from 'react'
import { Bell, UserCircle, Search } from 'lucide-react'

const Header = () => {
    return (
        <header className='h-16 glass z-10 sticky top-0 flex items-center justify-between px-6 border-b border-gray-800/50'>
            <div className="flex items-center gap-4 text-gray-400 focus-within:text-white transition-colors w-1/3">
                <Search size={20} />
                <input 
                    type="text" 
                    placeholder="Search students, fees, or classes..." 
                    className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500"
                />
            </div>
            
            <div className="flex items-center gap-6">
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <Bell size={22} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                    </span>
                </button>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 pr-3 rounded-full transition-colors">
                    <UserCircle size={32} className="text-gray-300" />
                    <div className="hidden md:block text-sm text-right">
                        <p className="font-medium text-white">Admin User</p>
                        <p className="text-xs text-gray-500">Principal</p>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header