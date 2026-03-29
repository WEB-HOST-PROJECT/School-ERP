import React, { useState } from 'react'
import API from '../../api/api'
import toast from 'react-hot-toast'
import { User, Users, MapPin, Save, FileText } from 'lucide-react'

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, ...props }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-gray-400 ml-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            {...props}
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-gray-400 ml-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
        >
            <option value="" className="text-gray-500">Select {label}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const AddStudent = () => {
    const [studentData, setStudentData] = useState({
        name: '', gender: '', dob: '', category: '', contact_no: '',
        father_name: '', mother_name: '', pen_no: '', aadhar_no: '',
        house_name: '', certificate: '', email: '', address: '', status: 'active'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudentData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await API.post('/students', studentData);
            toast.success('Student registered successfully!');
            setStudentData({
                name: '', gender: '', dob: '', category: '', contact_no: '',
                father_name: '', mother_name: '', pen_no: '', aadhar_no: '',
                house_name: '', certificate: '', email: '', address: '', status: 'active'
            });
        } catch (error) {
            console.error('Error adding student:', error);
            toast.error('Failed to register student. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="h-full overflow-y-auto p-6 custom-scrollbar fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Student Registration</h2>
                    <p className="text-sm text-gray-400">Enter the details below to enroll a new student.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Group */}
                    <div className="bg-white/5 border border-gray-800/60 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                            <User size={16} /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <InputField value={studentData.name} onChange={handleChange} label="Full Name" name="name" placeholder="John Doe" required />
                            <SelectField value={studentData.gender} onChange={handleChange} label="Gender" name="gender" options={[
                                { label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }
                            ]} />
                            <InputField value={studentData.dob} onChange={handleChange} label="Date of Birth" name="dob" type="date" required />
                            <SelectField value={studentData.category} onChange={handleChange} label="Category" name="category" options={[
                                { label: 'General', value: 'general' }, { label: 'OBC', value: 'obc' }, { label: 'SC', value: 'sc' }, { label: 'ST', value: 'st' }
                            ]} />
                            <InputField value={studentData.contact_no} onChange={handleChange} label="Contact Number" name="contact_no" type="tel" placeholder="10-digit number" pattern="[0-9]{10}" title="Please enter a valid 10-digit mobile number" maxLength="10" required />
                            <InputField value={studentData.email} onChange={handleChange} label="Email Address" name="email" type="email" placeholder="student@example.com" />
                            <InputField value={studentData.aadhar_no} onChange={handleChange} label="Aadhar Number" name="aadhar_no" placeholder="12-digit Aadhar" pattern="[0-9]{12}" title="Please enter a valid 12-digit Aadhar number" maxLength="12" required />
                        </div>
                    </div>

                    {/* Parents Information Group */}
                    <div className="bg-white/5 border border-gray-800/60 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                            <Users size={16} /> Parents Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField value={studentData.father_name} onChange={handleChange} label="Father's Name" name="father_name" placeholder="Name of the father" required />
                            <InputField value={studentData.mother_name} onChange={handleChange} label="Mother's Name" name="mother_name" placeholder="Name of the mother" />
                        </div>
                    </div>

                    {/* Additional Details Group */}
                    <div className="bg-white/5 border border-gray-800/60 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                            <FileText size={16} /> Institutional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                            <SelectField value={studentData.status} onChange={handleChange} label="Student Status" name="status" options={[
                                { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Suspended', value: 'suspended' }, { label: 'Graduated', value: 'graduated' }
                            ]} />
                            <InputField value={studentData.pen_no} onChange={handleChange} label="PEN Number" name="pen_no" placeholder="Unique ID" />
                            <SelectField value={studentData.house_name} onChange={handleChange} label="House" name="house_name" options={[
                                { label: 'Red House', value: 'red' }, { label: 'Blue House', value: 'blue' }, { label: 'Green House', value: 'green' }, { label: 'Yellow House', value: 'yellow' }
                            ]} />
                            <InputField value={studentData.certificate} onChange={handleChange} label="Certificate" name="certificate" placeholder="e.g. TC submitted" />
                        </div>
                    </div>

                    {/* Address Group */}
                    <div className="bg-white/5 border border-gray-800/60 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                            <MapPin size={16} /> Residential Address
                        </h3>
                        <div className="flex flex-col space-y-1">
                            <textarea
                                name="address"
                                value={studentData.address}
                                onChange={handleChange}
                                placeholder="Full structured address..."
                                rows="3"
                                className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={() => setStudentData({ name: '', gender: '', dob: '', category: '', contact_no: '', father_name: '', mother_name: '', pen_no: '', aadhar_no: '', house_name: '', certificate: '', email: '', address: '' })} className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium">
                            Clear Form
                        </button>
                        <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : <Save size={18} />}
                            {isSubmitting ? 'Registering...' : 'Register Student'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
            `}</style>
        </div>
    )
}

export default AddStudent