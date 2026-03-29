import React, { useState } from 'react'
import API from '../../api/api'

const AddStudent = () => {
    const [studentData, setStudentData] = useState({
        name: '',
        gender: '',
        dob: '',
        category: '',
        contact_no: '',
        father_name: '',
        mother_name: '',
        pen_no: '',
        aadhar_no: '',
        house_name: '',
        certificate: '',
        transport: '',
        address: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setStudentData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(studentData)
        try {
            const res = await API.post('/students', studentData)
            console.log(res.data)
            alert('Student added successfully!')
        } catch (error) {
            console.error('Error adding student:', error)
            alert('Error adding student. Please try again.')
        }
    }

    return (
        <div className='main'>
            <h1 className='text-2xl font-bold mb-4'>Add Student Page</h1>
            <h2 className='text-xl font-bold mb-4'>Personal Information</h2>
            <form onSubmit={handleSubmit} className='bg-gray-800 p-4 rounded'>
                <section className='flex'>
                    <div className='left-column w-1/2 pr-4'>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='name'>
                                Full Name
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='name'
                                type='text'
                                placeholder='Full Name'
                                name='name'
                                value={studentData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='gender'>
                                Gender
                            </label>
                            <select
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='gender'
                                name='gender'
                                value={studentData.gender}
                                onChange={handleChange}

                            >
                                <option value="">Select Gender</option>
                                <option value='male'>Male</option>
                                <option value='female'>Female</option>
                                <option value='other'>Other</option>
                            </select>
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='phone'>
                                Date of Birth
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='dob'
                                type='date'
                                placeholder='Date of Birth'
                                name='dob'
                                value={studentData.dob}
                                onChange={handleChange}

                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='phone'>
                                Category
                            </label>
                            <select
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='category'
                                name='category'
                                value={studentData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                <option value='general'>General</option>
                                <option value='obc'>OBC</option>
                                <option value='sc'>SC</option>
                                <option value='st'>ST</option>
                            </select>
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='father_name'>
                                Father's Name
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='father_name'
                                type='text'
                                placeholder="Father's Name"
                                name='father_name'
                                value={studentData.father_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='mother_name'>
                                Mother's Name
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='mother_name'
                                type='text'
                                placeholder="Mother's Name"
                                name='mother_name'
                                value={studentData.mother_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className='right-column w-1/2'>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='pen_no'>
                                Pen Number
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='pen_no'
                                type='text'
                                placeholder='Enter Pen Number'
                                name='pen_no'
                                value={studentData.pen_no}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='contact_no'>
                                Contact No.
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='contact_no'
                                type='text'
                                placeholder='Enter Contact No.'
                                name='contact_no'
                                value={studentData.contact_no}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='adhaar_no'>
                                Aadhar No.
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='aadhar_no'
                                type='text'
                                placeholder='Enter Aadhar No.'
                                name='aadhar_no'
                                value={studentData.aadhar_no}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='house_name'>
                                House Name
                            </label>
                            <select
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='house_name'
                                name='house_name'
                                value={studentData.house_name}
                                onChange={handleChange}

                            >
                                <option value="">Select House</option>
                                <option value='red'>Red</option>
                                <option value='blue'>Blue</option>
                                <option value='green'>Green</option>
                                <option value='yellow'>Yellow</option>
                            </select>
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='certificate'>
                                Certificate
                            </label>
                            <input
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='certificate'
                                type='text'
                                placeholder='Enter Certificate Details'
                                name='certificate'
                                value={studentData.certificate}
                                onChange={handleChange}

                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='transport'>
                                Transport
                            </label>
                            <select
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline'
                                id='transport'
                                type='text'
                                placeholder='Enter Transport Details'
                                name='transport'
                                value={studentData.transport}
                                onChange={handleChange}
                            >
                                <option value="">Select Transport</option>
                                <option value='yes'>Yes</option>
                                <option value='no'>No</option>
                            </select>
                        </div>

                    </div>
                </section>
                <div>
                    <label htmlFor="address">
                        Address
                    </label>
                    <textarea
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        name="address"
                        id="address"
                        value={studentData.address}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <button
                    className='bg-blue-500 cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                    type='submit'
                >
                    Add Student
                </button>
            </form>
        </div>
    )
}

export default AddStudent