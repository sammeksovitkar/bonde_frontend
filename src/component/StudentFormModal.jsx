// StudentFormModal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomModal from './CustomModal';
import { FaUser, FaIdCard, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaCheck, FaTimes } from './Icons';

// New props added: setMessage and setIsError
const StudentFormModal = ({ students, modalVisible, setModalVisible, editingStudent, setEditingStudent, fetchStudents, setMessage, setIsError }) => {
  const [formData, setFormData] = useState({
    name: '', sitNo: '', gender: '', mobile: '', email: '', address: '', fees: '', date: ''
  });
  const [errors, setErrors] = useState({});
  const [isPaid, setIsPaid] = useState(false);
  const [availableSits, setAvailableSits] = useState([]);

  useEffect(() => {
    const usedSits = new Set(students.map(s => s.sitNo));
    const allPossibleSits = Array.from({ length: 100 }, (_, i) => i + 1);
    const sitsToDisplay = allPossibleSits.filter(sit => !usedSits.has(sit));
    
    setAvailableSits(sitsToDisplay);

    if (editingStudent) {
      const formattedDate = editingStudent.date ? new Date(editingStudent.date).toISOString().split('T')[0] : '';
      setFormData({
        ...editingStudent,
        date: formattedDate,
      });

      if (!sitsToDisplay.includes(editingStudent.sitNo)) {
        setAvailableSits(prev => [...prev, editingStudent.sitNo].sort((a, b) => a - b));
      }

      const { selectedYear, selectedMonth } = editingStudent;
      if (selectedYear && selectedMonth && editingStudent.year_month && editingStudent.year_month.get(selectedYear)) {
        const yearData = editingStudent.year_month.get(selectedYear);
        const monthData = yearData.months.get(selectedMonth);
        if (monthData) {
          setIsPaid(monthData.paid > 0);
        } else {
          setIsPaid(false);
        }
      } else {
        setIsPaid(false);
      }
    } else {
      setFormData({ name: '', sitNo: '', gender: '', mobile: '', email: '', address: '', fees: '', date: '' });
      setIsPaid(false);
    }
  }, [editingStudent, students]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const onFinish = async () => {
    const validationErrors = {};
    if (!formData.name) validationErrors.name = "Name is mandatory.";
    if (!formData.sitNo) validationErrors.sitNo = "Sit Number is mandatory.";
    if (!formData.gender) validationErrors.gender = "Gender is mandatory.";
    if (!formData.mobile) validationErrors.mobile = "Mobile is mandatory.";
    if (!formData.email) validationErrors.email = "Email is mandatory.";
    if (!formData.address) validationErrors.address = "Address is mandatory.";
    if (!formData.fees) validationErrors.fees = "Fees is mandatory.";
    if (!formData.date) validationErrors.date = "Admission Date is mandatory.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data = {
      ...formData,
      sitNo: Number(formData.sitNo),
      fees: Number(formData.fees),
    };
    
    if (!editingStudent) {
      const dateToUse = new Date(formData.date);
      const isDateValid = !isNaN(dateToUse.getTime());
      
      const admissionYear = (isDateValid ? dateToUse.getFullYear() : new Date().getFullYear()).toString();
      const admissionMonth = (isDateValid ? dateToUse.toLocaleString('default', { month: 'short' }) : new Date().toLocaleString('default', { month: 'short' })).toLowerCase();
      
      data.year_month = {
        [admissionYear]: {
          months: { 
            [admissionMonth]: {
              value: Number(formData.fees?1:0), 
              paid: 0, 
            }
          }
        }
      };
    }
    
    if (editingStudent) {
      const yearToUpdate = editingStudent.selectedYear || new Date().getFullYear().toString();
      const monthToUpdate = editingStudent.selectedMonth || new Date().toLocaleString('default', { month: 'short' }).toLowerCase();
      
      data.year_month = {
        ...editingStudent.year_month,
        [yearToUpdate]: {
          ...editingStudent.year_month[yearToUpdate],
          months: {
            ...editingStudent.year_month?.[yearToUpdate]?.months,
            [monthToUpdate]: {
              ...editingStudent.year_month?.[yearToUpdate]?.months?.[monthToUpdate],
              value: 1,
              paid: isPaid ? 1 : 0
            }
          }
        }
      };
    }

    console.log("Sending payload to server:", data);

    try {
      if (editingStudent) {
        await axios.put(`https://bonde-backend-navy.vercel.app/api/students/update/${editingStudent.sitNo}`, data);
        setMessage('Student details updated successfully! 👍');
        setIsError(false);
      } else {
        await axios.post('https://bonde-backend-navy.vercel.app/api/students/create', data);
        setMessage('New student created successfully! 🎉');
        setIsError(false);
      }
      fetchStudents();
      setModalVisible(false);
      setErrors({});
      setEditingStudent(null);
    } catch (err) {
      console.error('Server error:', err);
      setMessage('Failed to create/update student. Please try again. 😟');
      setIsError(true);
    }
  };

  return (
    <CustomModal
      title={editingStudent ? 'Edit Student' : 'Add Student'}
      open={modalVisible}
      onCancel={() => { setModalVisible(false); setEditingStudent(null); setErrors({}); }}
      onOk={onFinish}
      okText={editingStudent ? 'Save Changes' : 'Add Student'}
    >
      <form className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaUser /></div>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter full name" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div className="relative">
            <label htmlFor="sitNo" className="block text-sm font-medium text-gray-700 mb-1">Sit No</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.sitNo ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaIdCard /></div>
              {editingStudent ? (
                <input type="number" id="sitNo" name="sitNo" value={formData.sitNo} disabled className="flex-1 block w-full px-4 py-2 bg-gray-100 rounded-md text-gray-900 border-none focus:ring-0 cursor-not-allowed" />
              ) : (
                <select id="sitNo" name="sitNo" value={formData.sitNo} onChange={handleFormChange} className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0 appearance-none" required>
                  <option value="">Select Sit Number</option>
                  {availableSits.map(sit => (
                    <option key={sit} value={sit}>{sit}</option>
                  ))}
                </select>
              )}
            </div>
            {errors.sitNo && <p className="text-red-500 text-sm mt-1">{errors.sitNo}</p>}
          </div>

          <div className="relative">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaVenusMars /></div>
              <select id="gender" name="gender" value={formData.gender} onChange={handleFormChange} className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0 appearance-none" required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
          <div className="relative">
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaPhone /></div>
              <input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleFormChange} placeholder="e.g., 123-456-7890" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
            </div>
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaEnvelope /></div>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="e.g., johndoe@example.com" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="relative col-span-1 sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className={`flex items-start border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="p-3 text-gray-400"><FaMapMarkerAlt /></div>
              <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleFormChange} placeholder="Enter student's address" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required></textarea>
            </div>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          <div className="relative">
            <label htmlFor="fees" className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.fees ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaDollarSign /></div>
              <input type="number" id="fees" name="fees" value={formData.fees} onChange={handleFormChange} placeholder="e.g., 500" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
            </div>
            {errors.fees && <p className="text-red-500 text-sm mt-1">{errors.fees}</p>}
          </div>
          <div className="relative">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaCalendarAlt /></div>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleFormChange} className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
            </div>
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          
          {editingStudent && (
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Status for Current Month
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="paid"
                    name="paidStatus"
                    checked={isPaid}
                    onChange={() => setIsPaid(true)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="paid" className="ml-2 flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <FaCheck className="text-green-600 mr-1" /> Paid
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="unpaid"
                    name="paidStatus"
                    checked={!isPaid}
                    onChange={() => setIsPaid(false)}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                  />
                  <label htmlFor="unpaid" className="ml-2 flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <FaTimes className="text-red-600 mr-1" /> Unpaid
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </CustomModal>
  );
};

export default StudentFormModal;
