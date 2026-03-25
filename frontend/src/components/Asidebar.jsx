import React from 'react'

const AsideBar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
        <nav>
            <ul>
                <li className="mb-4"><a href="#" className="hover:text-gray-400">Dashboard</a></li>
                <li className="mb-4"><a href="#" className="hover:text-gray-400">Students</a></li>
                <li className="mb-4"><a href="#" className="hover:text-gray-400">Fee Payments</a></li>
                <li className="mb-4"><a href="#" className="hover:text-gray-400">Fee Management</a></li>
                <li className="mb-4"><a href="#" className="hover:text-gray-400">Classes</a></li>
                <li className="mb-4"><a href="#" className="hover:text-gray-400">Sections</a></li>
                <li className="mb-4"><a href="#" className="hover:text-gray-400">Academic Years</a></li>
            </ul>
        </nav>
    </aside>
  )
}

export default AsideBar