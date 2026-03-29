import React from 'react'
import { Link } from 'react-router-dom'

const AsideBar = () => {
    return (
        <div className='h-screen w-3/12 bg-gray-200'>

            <nav className='p-4'>
                <ul>
                    <li className='mb-2'>
                        <Link to='/dashboard' className='text-gray-700 hover:text-gray-900'>Dashboard</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/students' className='text-gray-700 hover:text-gray-900'>Students</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/enrollments' className='text-gray-700 hover:text-gray-900'>Enrollments</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/fee-management' className='text-gray-700 hover:text-gray-900'>Fee Management</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/fee-payments' className='text-gray-700 hover:text-gray-900'>Fee Payments</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/academic' className='text-gray-700 hover:text-gray-900'>Academic</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/classes' className='text-gray-700 hover:text-gray-900'>Classes</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/sections' className='text-gray-700 hover:text-gray-900'>Sections</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/fee-structure' className='text-gray-700 hover:text-gray-900'>Fee Structure</Link>
                    </li>
                    <li className='mb-2'>
                        <Link to='/setting' className='text-gray-700 hover:text-gray-900'>Setting</Link>
                    </li>
                </ul>
            </nav>

        </div>
    )
}

export default AsideBar