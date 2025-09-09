import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrashAlt, FaEye } from './Icons';
import CustomModal from './CustomModal';

const StudentTable = ({ students, fetchStudents, setEditingStudent, setModalVisible }) => {
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let newFilteredStudents = students;

    if (filterName) {
      newFilteredStudents = newFilteredStudents.filter(student =>
        student.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }
    if (filterDate) {
      newFilteredStudents = newFilteredStudents.filter(student =>
        student.date === filterDate
      );
    }
    setFilteredStudents(newFilteredStudents);
    setLoading(false);
  }, [students, filterName, filterDate]);

  const handleEdit = (record) => {
    setEditingStudent(record);
    setModalVisible(true);
  };

  const handleConfirmDelete = (sitNo) => {
    setStudentToDelete(sitNo);
    setConfirmDeleteVisible(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://bonde-backend-navy.vercel.app/api/students/delete/${studentToDelete}`);
      fetchStudents();
      setConfirmDeleteVisible(false);
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800">Student Records</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Filter by Name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full sm:w-48 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-48 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-left">
                <th className="px-6 py-3 font-semibold text-gray-600">Sit No</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Gender</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Fees</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Admission Date</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4 text-gray-500">Loading...</td></tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.sitNo} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">{student.sitNo}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">{student.gender}</td>
                    <td className="px-6 py-4">{student.fees}</td>
                    <td className="px-6 py-4">{student.date ? new Date(student.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      {student.status === 'paid' ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">Paid</span>
                      ) : student.status === 'unpaid' ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">Unpaid</span>
                      ) : (
                         <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800 transition duration-200"><FaPencilAlt /></button>
                      <button onClick={() => handleConfirmDelete(student.sitNo)} className="text-red-600 hover:text-red-800 transition duration-200"><FaTrashAlt /></button>
                      <button className="text-gray-600 hover:text-gray-800 transition duration-200"><FaEye /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Custom Confirmation Modal for Deletion */}
      <CustomModal
        title="Confirm Deletion"
        open={confirmDeleteVisible}
        onCancel={() => setConfirmDeleteVisible(false)}
        onOk={handleDelete}
        okText="Delete"
      >
        <div className="p-4 text-center text-gray-600">
          <p className="text-lg font-medium">Are you sure you want to delete this student's record?</p>
        </div>
      </CustomModal>
    </>
  );
};

export default StudentTable;