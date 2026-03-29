import React from 'react'
import API from '../../api/api'
import { useEffect, useState } from 'react'


const StudentManagement = () => {
    const [students, setStudents] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        API.get("/students")
            .then((res) => setStudents(res.data))
            .catch((err) => setError(err))
    }, [])
    console.log(students, error)

    return (
        <div className='main'>
            <table className='w-full text-left'>
                <thead className='bg-gray-800 '>
                    <tr>
                        <th>SR No.</th>
                        <th>Name</th>
                        <th>DOB</th>
                        <th>Father's Name</th>
                        <th>Mother's Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                {students.length > 0 ? (
                    students.map((student) => (
                        <tbody key={student.id} className='bg-gray-700 even:bg-gray-600'>
                            <tr>
                                <td>{student.id}</td>
                                <td>{student.name}</td>
                                <td>{student.dob}</td>
                                <td>{student.father_name}</td>
                                <td>{student.mother_name}</td>
                                <td>
                                    <button className='bg-blue-500 cursor-pointer text-white px-2 py-1 rounded'>View</button>
                                </td>
                            </tr>
                        </tbody>
                    ))
                ) : (
                    <tbody>
                        <tr>
                            <td colSpan="6" className="text-center">No students found.</td>
                        </tr>
                    </tbody>
                )}
            </table>
        </div>
    )
}

export default StudentManagement