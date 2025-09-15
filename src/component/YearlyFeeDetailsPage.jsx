import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'sheetjs-style';

// Self-contained components and functions to resolve import errors
const FaArrowLeft = () => <span>⬅️</span>;
const FaFileExcel = () => <span>📄</span>;
const FaUser = () => <span>👤</span>;
const FaIdCard = () => <span>🆔</span>;
const FaVenusMars = () => <span>🚻</span>;
const FaPhone = () => <span>📞</span>;
const FaEnvelope = () => <span>✉️</span>;
const FaMapMarkerAlt = () => <span>📍</span>;
const FaDollarSign = () => <span>💲</span>;
const FaCalendarAlt = () => <span>📅</span>;
const FaCheck = () => <span>✅</span>;
const FaTimes = () => <span>❌</span>;
const FaEdit = () => <span>✏️</span>;
const FaTrashAlt = () => <span>🗑️</span>;

const CustomModal = ({ title, open, onCancel, onOk, okText, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="relative w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition duration-150">
            &times;
          </button>
        </div>
        <div className="mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onOk}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150"
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentFormModal = ({ students, modalVisible, setModalVisible, editingStudent, setEditingStudent, fetchStudents, setMessage, setIsError }) => {
  const [formData, setFormData] = useState({
    name: '', sitNo: '', gender: '', mobile: '', email: '', address: '', fees: '', date: ''
  });
  const [errors, setErrors] = useState({});
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
    } else {
      setFormData({ name: '', sitNo: '', gender: '', mobile: '', email: '', address: '', fees: '', date: '' });
    }
  }, [editingStudent, students]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const onFinish = async () => {
    const data = {
      ...formData,
      sitNo: Number(formData.sitNo),
      fees: Number(formData.fees),
    };

    try {
      if (editingStudent) {
        await axios.put(`https://bonde-backend-navy.vercel.app/api/students/update/${editingStudent.sitNo}`, data);
        setMessage('Student details updated successfully! 👍');
        setIsError(false);
      } else {
        const dateToUse = new Date(formData.date);
        const admissionYear = dateToUse.getFullYear().toString();
        const admissionMonth = dateToUse.toLocaleString('default', { month: 'short' }).toLowerCase();
        
        data.year_month = {
          [admissionYear]: {
            months: {
              [admissionMonth]: {
                value: Number(formData.fees),
                paid: 0,
              }
            }
          }
        };
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
      title={editingStudent ? 'Edit Student Details' : 'Add New Student'}
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
          </div>
          <div className="relative">
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaPhone /></div>
              <input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleFormChange} placeholder="e.g., 123-456-7890" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="px-3 text-gray-400"><FaEnvelope /></div>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="e.g., johndoe@example.com" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
            </div>
          </div>
          <div className="relative col-span-1 sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className={`flex items-start border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="p-3 text-gray-400"><FaMapMarkerAlt /></div>
              <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleFormChange} placeholder="Enter student's address" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required></textarea>
            </div>
          </div>
          
          {!editingStudent && (
            <>
              <div className="relative">
                <label htmlFor="fees" className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
                <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.fees ? 'border-red-500' : 'border-gray-300'}`}>
                  <div className="px-3 text-gray-400"><FaDollarSign /></div>
                  <input type="number" id="fees" name="fees" value={formData.fees} onChange={handleFormChange} placeholder="e.g., 500" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <div className={`flex items-center border rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}>
                  <div className="px-3 text-gray-400"><FaCalendarAlt /></div>
                  <input type="date" id="date" name="date" value={formData.date} onChange={handleFormChange} className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" required />
                </div>
              </div>
            </>
          )}

        </div>
      </form>
    </CustomModal>
  );
};

const StudentTable = ({ students, fetchStudents, setEditingStudent, setModalVisible, handleUpdateFeeStatus }) => {
  if (students.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-6">
        No students found for the selected month and year.
      </p>
    );
  }
  
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setModalVisible(true);
  };
  
  const handleDeleteClick = async (sitNo) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`https://bonde-backend-navy.vercel.app/api/students/delete/${sitNo}`);
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleStatusToggle = (student) => {
    const currentStatus = student.year_month?.[student.selectedYear]?.months?.[student.selectedMonth];
    if (currentStatus) {
      handleUpdateFeeStatus(student.sitNo, currentStatus);
    }
  };

  const tableHeaders = ["Sit No", "Name", "Gender",  "Fees", "Status", "Actions"];
  
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mt-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {tableHeaders.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.sitNo}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.sitNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.feesForMonth?.value || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleStatusToggle(student)}
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 ${student.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                >
                  {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'N/A'}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
                <button
                  onClick={() => handleEditClick(student)}
                  className="text-blue-600 hover:text-blue-900 transition duration-150"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteClick(student.sitNo)}
                  className="text-red-600 hover:text-red-900 transition duration-150"
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const exportToExcel = (data, fileName, selectedMonth, selectedYear) => {
  if (!data || data.length === 0) {
    console.log("No data to export.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet([]);
  
  const title = `Student Fee Details for ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} ${selectedYear}`;
  XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });
  
  const titleCell = worksheet["A1"];
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 14 }, 
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  const excelData = data.map(student => ({
    "Sit No": student.sitNo,
    "Name": student.name,
    "Gender": student.gender,
    "Mobile": student.mobile,
    "Fees": student.feesForMonth?.value || 'N/A',
    "Status": student.status
              ? student.status.charAt(0).toUpperCase() + student.status.slice(1)
              : 'N/A'
  }));

  const headers = Object.keys(excelData[0]);
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A3" });
  XLSX.utils.sheet_add_json(worksheet, excelData, { origin: "A4", skipHeader: true });

  const lastCol = String.fromCharCode('A'.charCodeAt(0) + headers.length - 1);
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

  worksheet['!cols'] = [
    { wch: 10 }, 
    { wch: 25 }, 
    { wch: 10 }, 
    { wch: 15 }, 
    { wch: 10 }, 
    { wch: 15 }  
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Fees");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

const YearlyFeeDetailsPage = (prevObj) => {
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [newFeeYear, setNewFeeYear] = useState('');
  const [newFeeMonth, setNewFeeMonth] = useState('');
  const [addFeesMessage, setAddFeesMessage] = useState('');
  const [studentMessage, setStudentMessage] = useState(''); // New state for student form messages
  const [isError, setIsError] = useState(false); // New state for message type
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];

  // This is the filtering function, memoized with useCallback
  const updateFilteredStudents = useCallback((studentsData, year, month) => {
    if (year && month && studentsData.length > 0) {
      const monthKey = month.toLowerCase();
      const filteredAndMappedStudents = studentsData
        .filter(student => student.year_month?.[year]?.months?.[monthKey])
        .map(student => {
          const monthData = student.year_month[year].months[monthKey];
          const feesForMonth = monthData?.value || 'N/A';
          const status = monthData.paid === 1 ? 'paid' : 'unpaid';
          return {
            ...student,
            feesForMonth: { value: feesForMonth, paid: monthData.paid },
            status: status,
            selectedYear: year,
            selectedMonth: month,
          };
        });
      setFilteredStudents(filteredAndMappedStudents);
    } else {
      setFilteredStudents([]);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://bonde-backend-navy.vercel.app/api/students/all');
      const fetchedStudents = res.data;
      setStudents(fetchedStudents);
      
      const allYears = [...new Set(
        fetchedStudents.flatMap(student => student.year_month ? Object.keys(student.year_month) : [])
      )].sort().reverse();
      setYears(allYears);

      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const currentMonth = today.toLocaleString('default', { month: 'short' }).toLowerCase();
      
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
      setNewFeeYear(currentYear);
      setNewFeeMonth(currentMonth);
      
      updateFilteredStudents(fetchedStudents, currentYear, currentMonth);

    } catch (err) {
      console.error('Error fetching students:', err);
    }
    setLoading(false);
  }, [updateFilteredStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // This effect handles changes from dropdowns only
  useEffect(() => {
    if (selectedYear && selectedMonth && students.length > 0) {
      updateFilteredStudents(students, selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth, students, updateFilteredStudents]);
  
  // NEW useEffect to handle and clear the studentMessage
  useEffect(() => {
    if (studentMessage) {
      const timer = setTimeout(() => {
        setStudentMessage('');
        setIsError(false);
      }, 5000); // Message disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [studentMessage]);

  const handleAddFees = async () => {
    if (!newFeeYear || !newFeeMonth) {
      setAddFeesMessage('Please select a year and month to add fees.');
      return;
    }
  
    setLoading(true);
    setAddFeesMessage(`Copying last month's fees to ${newFeeMonth.charAt(0).toUpperCase() + newFeeMonth.slice(1)} ${newFeeYear}...`);
    
    const newMonthIndex = months.indexOf(newFeeMonth);
    const newYear = parseInt(newFeeYear);
    let fromMonthIndex = newMonthIndex - 1;
    let fromYear = newYear;

    if (fromMonthIndex < 0) {
      fromMonthIndex = 11;
      fromYear = newYear - 1;
    }

    const fromMonth = months[fromMonthIndex];
    
    try {
      const payload = {
        fromYear: fromYear.toString(),
        fromMonth: fromMonth,
        toYear: newFeeYear,
        toMonth: newFeeMonth
      };
      
      await axios.post('https://bonde-backend-navy.vercel.app/api/students/copy-fees-next-month', payload);
  
      setAddFeesMessage(`✅ Successfully copied fees to ${newFeeMonth.charAt(0).toUpperCase() + newFeeMonth.slice(1)} ${newFeeYear} for all students.`);
      fetchStudents();
    } catch (err) {
      console.error('Error setting fees:', err);
      setAddFeesMessage('❌ Failed to set fees. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateFeeStatus = async (studentId, currentStatus) => {
    const newPaidStatus = currentStatus.paid > 0 ? 0 : 1;
    const payload = {
      year: selectedYear,
      month: selectedMonth,
      fees: {
        ...currentStatus,
        paid: newPaidStatus,
      }
    };
    try {
      await axios.put(`https://bonde-backend-navy.vercel.app/api/students/update-fee/${studentId}`, payload);
      fetchStudents();
    } catch (err) {
      console.error('Error updating fee status:', err);
    }
  };

  const handleExport = () => {
    if (filteredStudents.length > 0) {
      const fileName = `Fee_Details_${selectedMonth.toUpperCase()}_${selectedYear}`;
      exportToExcel(filteredStudents, fileName, selectedMonth, selectedYear);
    } else {
      console.log("No data to export!");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Monthwise Student List</h2>
        <button onClick={prevObj.goBack} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-200 flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      </div>

      <div className="p-4 border border-blue-200 rounded-md mb-6 bg-blue-50">
        <h3 className="text-xl font-bold text-blue-800 mb-4">Send Student's Next Month</h3>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={newFeeYear}
            onChange={(e) => setNewFeeYear(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={newFeeMonth}
            onChange={(e) => setNewFeeMonth(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="">Select Month</option>
            {months.map(month => (
              <option key={month} value={month}>{month.charAt(0).toUpperCase() + month.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleAddFees}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center w-full sm:w-auto"
            disabled={!newFeeYear || !newFeeMonth || loading}
          >
            Send Student Next Month
          </button>
        </div>
        {addFeesMessage && <p className={`mt-4 text-center ${addFeesMessage.includes('Successfully') ? 'text-green-600' : 'text-red-600'}`}>{addFeesMessage}</p>}
      </div>

      <hr className="my-6" />

      {/* Message Display Area */}
      {studentMessage && (
        <div className={`mt-4 p-4 rounded-md text-center font-semibold transition-opacity duration-500 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {studentMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">View Monthly Student List</h3>
        {filteredStudents.length > 0 && (
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
          >
            <FaFileExcel className="mr-2" /> Export to Excel
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
        >
          <option value="">Select Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
        >
          <option value="">Select Month</option>
          {months.map(month => (
            <option key={month} value={month}>{month.charAt(0).toUpperCase() + month.slice(1)}</option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <p className="text-center text-gray-500">Loading students...</p>
      ) : (
        years.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">
            No fee data found. Please add fees for a year and month first using the "Send Student's Next Month" section above.
          </p>
        ) : (
          selectedYear && selectedMonth && (
            <StudentTable 
              students={filteredStudents}
              fetchStudents={fetchStudents}
              setEditingStudent={setEditingStudent}
              setModalVisible={setModalVisible}
              handleUpdateFeeStatus={handleUpdateFeeStatus}
            />
          )
        )
      )}
      
      {/* Pass the new message setters as props */}
 <StudentFormModal
  modalVisible={modalVisible}
  setModalVisible={setModalVisible}
  editingStudent={editingStudent}
  setEditingStudent={setEditingStudent}
  fetchStudents={fetchStudents}
  students={students}
  setMessage={setStudentMessage} // <-- This is the key line
  setIsError={setIsError}       // <-- This is also needed
/>
    </div>
  );
};

export default YearlyFeeDetailsPage;
