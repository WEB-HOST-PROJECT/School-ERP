import React from 'react'
import { Link } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import StudentManagement from './Students/StudentManagement'
import AddStudent from './Students/AddStudent'

const Students = () => {


    return (
        <main>
            <div className='mb-4 flex items-center justify-between border-b-2 pb-4'>
                <h1 className='text-2xl font-bold mb-4'>Students Managements</h1>
                <Link to="/add-student">
                    <button className='bg-green-500 cursor-pointer text-white px-2 py-1 rounded'>Add Student</button>
                </Link>
                <Link to="/view-students">
                    <button className='bg-green-500 cursor-pointer text-white px-2 py-1 rounded'>View Students</button>
                </Link>
            </div>
            <section className='main h-auto w-full'>
                <Routes>
                    <Route path="students/add-student" element={<AddStudent />} />
                    <Route path="students/view-students" element={<StudentManagement />} />
                </Routes>

            </section>
        </main>
    )

}

export default Students