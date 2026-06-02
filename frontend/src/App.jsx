import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AsideBar from './components/Asidebar'
import Header from './components/Header'

import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import FeeManagement from './pages/FeeManagement'
import Enrollments from './pages/Enrollments'

import Academics from './pages/Academics'
import FeeSetup from './pages/FeeSetup'
import FeePayments from './pages/FeePayments'
import Receipts from './pages/Receipts'

// Stubs for missing pages
const Placeholder = ({ title }) => (
  <div className="flex h-full items-center justify-center">
    <div className="glass-card p-8 rounded-2xl text-center">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">{title}</h2>
      <p className="text-gray-400 mt-2">Implementation in progress...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <div className='flex h-screen bg-gray-950 font-sans text-gray-100 overflow-hidden'>
      <Toaster position="top-right" toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' }
      }} />
      <AsideBar />
      
      <div className='flex flex-col flex-1 w-full ml-64 overflow-hidden relative'>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <Header />
        
        <main className='flex-1 overflow-y-auto p-6 md:p-8 z-0 relative'>
          <div className="max-w-7xl mx-auto h-full">
            <Routes>
              <Route path='/' element={<Navigate to="/dashboard" replace />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/students/*' element={<Students />} />
              <Route path='/fee-management' element={<FeeManagement />} />
              <Route path='/fee-payments' element={<FeePayments />} />
              <Route path='/receipts' element={<Receipts />} />
              <Route path='/enrollments' element={<Enrollments />} />
              <Route path='/academic' element={<Academics />} />
              <Route path='/fee-structure' element={<FeeSetup />} />
              <Route path='/setting' element={<Placeholder title="Settings" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App