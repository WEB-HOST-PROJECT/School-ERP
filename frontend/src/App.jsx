import React from 'react'
import AsideBar from './components/AsideBar'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import FeeManagement from './pages/FeeManagement'
import Enrollments from './pages/Enrollments'

const App = () => {
  return (
    <main className='bg-gray-800 h-auto w-full'>
      {/* <Header /> */}
      <div className='flex'>
        <AsideBar />
        <section className='bg-gray-900 h-auto w-full text-white p-5'>
          <Routes>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/students' element={<Students />} />
            <Route path='/fee-management' element={<FeeManagement />} />
            <Route path='/enrollments' element={<Enrollments />} />
          </Routes>
        </section>
      </div>
    </main>
  )
}

export default App