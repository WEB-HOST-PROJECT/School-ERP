import React from 'react'
import { Link } from "react-router-dom";

const AsideBar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <nav>
        <ul>
          <li className="mb-4">
            <Link to="/" className="hover:text-gray-400">Dashboard of home page</Link>
          </li>
          <li className="mb-4">
            <Link to="/students" className="hover:text-gray-400">Students</Link>
          </li>
          <li className="mb-4">
            <Link to="/fee-payments" className="hover:text-gray-400">Fee Payments</Link>
          </li>
          <li className="mb-4">
            <Link to="/fee-management" className="hover:text-gray-400">Fee Management</Link>
          </li>
          <li className="mb-4">
            <Link to="/classes" className="hover:text-gray-400">Classes</Link>
          </li>
          <li className="mb-4">
            <Link to="/sections" className="hover:text-gray-400">Sections</Link>
          </li>
          <li className="mb-4">
            <Link to="/academic" className="hover:text-gray-400">Academic Years</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AsideBar