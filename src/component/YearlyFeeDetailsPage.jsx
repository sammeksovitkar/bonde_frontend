import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'sheetjs-style'; // Use sheetjs-style for styling

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

const StudentFormModal = ({ students, modalVisible, setModalVisible, editingStudent, setEditingStudent, fetchStudents }) => {
  const [formData, setFormData] = useState({
    name: '', sitNo: '', gender: '', mobile: '', email: '', address: '', fees: '', date: ''
  });
  const [errors, setErrors] = useState({});
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (editingStudent) {
      const formattedDate = editingStudent.date ? new Date(editingStudent.date).toISOString().split('T')[0] : '';
      
      setFormData({
        ...editingStudent,
        date: formattedDate,
      });

      const { selectedYear, selectedMonth } = editingStudent;
      if (selectedYear && selectedMonth && editingStudent.year_month && editingStudent.year_month[selectedYear]) {
        const monthData = editingStudent.year_month[selectedYear].months[selectedMonth];
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
  }, [editingStudent]);

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
    
    if (!editingStudent) {
      const dateToUse = new Date(formData.date);
      const isDateValid = !isNaN(dateToUse.getTime());
      
      const admissionYear = (isDateValid ? dateToUse.getFullYear() : new Date().getFullYear()).toString();
      const admissionMonth = (isDateValid ? dateToUse.toLocaleString('default', { month: 'short' }) : new Date().toLocaleString('default', { month: 'short' })).toLowerCase();
      
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

    }
    
    if (editingStudent) {
      const yearToUpdate = editingStudent.selectedYear || new Date().getFullYear().toString();
      const monthToUpdate = editingStudent.selectedMonth || new Date().toLocaleString('default', { month: 'short' }).toLowerCase();
      
      data.year_month = {
        [yearToUpdate]: {
          months: {
            [monthToUpdate]: {
              value: 1,
              paid: isPaid ? 1 : 0
            }
          }
        }
      };
      
    }

    console.log("Sending data to server:", data);

    try {
      if (editingStudent) {
        await axios.put(`https://bonde-backend-navy.vercel.app/api/students/update/${editingStudent.sitNo}`, { year_month: data.year_month });
      } else {
        await axios.post('https://bonde-backend-navy.vercel.app/api/students/create', data);
      }
      fetchStudents();
      setModalVisible(false);
      setErrors({});
      setEditingStudent(null);
    } catch (err) {
      console.error('Server error:', err);
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
              <input type="number" id="sitNo" name="sitNo" value={formData.sitNo} onChange={handleFormChange} placeholder="Enter unique sit number" className="flex-1 block w-full px-4 py-2 bg-white rounded-md text-gray-900 border-none focus:ring-0" disabled={!!editingStudent} required />
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

const StudentTable = ({ students, fetchStudents, setEditingStudent, setModalVisible }) => {
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'N/A'}
                </span>
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

// ** UPDATED exportToExcel function **
// NOTE: This function requires the 'sheetjs-style' library, not 'xlsx'.
// To use, run `npm install sheetjs-style`.
const exportToExcel = (data, fileName, selectedMonth, selectedYear) => {
  if (!data || data.length === 0) {
    console.log("No data to export.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet([]);
  
  // 1. Add the centered title at the top
  const title = `Student Fee Details for ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} ${selectedYear}`;
  XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });
  
  // Define the style for the title cell (A1)
  const titleCell = worksheet["A1"];
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 14 }, 
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // 2. Add headers and data starting from the third row (A3)
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

  // 3. Merge cells for the title
  const lastCol = String.fromCharCode('A'.charCodeAt(0) + headers.length - 1);
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

  // 4. Set column widths
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
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];

  
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://bonde-backend-navy.vercel.app/api/students/all');
      const fetchedStudents = res.data;
      setStudents(fetchedStudents);
      
      const allYears = [...new Set(
        fetchedStudents.flatMap(student => {
          if (student.year_month) {
            return Object.keys(student.year_month);
          }
          return [];
        })
      )].sort().reverse();
      setYears(allYears);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedYear && selectedMonth && students.length > 0) {
      const monthKey = selectedMonth.toLowerCase();
      const filteredAndMappedStudents = students
        .filter(student => {
          const monthData = student.year_month?.[selectedYear]?.months?.[monthKey];
          return !!monthData;
        })
        .map(student => {
          const monthData = student.year_month?.[selectedYear]?.months?.[monthKey];
          const feesForMonth = monthData?.value || 'N/A';
          const status = monthData ? (monthData.paid === 1 ? 'paid' : 'unpaid') : 'unpaid';
          
          return {
            ...student,
            feesForMonth: { value: feesForMonth, paid: monthData?.paid || 0 },
            status: status,
            selectedYear: selectedYear,
            selectedMonth: selectedMonth,
          };
        });

      setFilteredStudents(filteredAndMappedStudents);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedYear, selectedMonth, students]);
  
  useEffect(() => {
    fetchStudents();
    
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    const currentMonth = today.toLocaleString('default', { month: 'short' }).toLowerCase();
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);

    setNewFeeYear(currentYear);
    setNewFeeMonth(currentMonth);
  }, []);

  const handleAddFees = async () => {
    if (!newFeeYear || !newFeeMonth) {
      setAddFeesMessage('Please select a year and month to add fees.');
      return;
    }
  
    setLoading(true);
    setAddFeesMessage(`Copying last month's fees to ${newFeeMonth.charAt(0).toUpperCase() + newFeeMonth.slice(1)} ${newFeeYear}...`);
    
    const newDate = new Date(`${newFeeYear}-${months.indexOf(newFeeMonth) + 1}-01`);
    newDate.setMonth(newDate.getMonth() - 1);

    const fromYear = newDate.getFullYear().toString();
    const fromMonth = newDate.toLocaleString('default', { month: 'short' }).toLowerCase();
  
    try {
      const payload = {
        fromYear: fromYear,
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

  const handleEditFee = (studentId) => {
    const studentToUpdate = students.find(s => s.sitNo === studentId);
    if (studentToUpdate) {
      const currentFeeStatus = studentToUpdate.year_month?.[selectedYear]?.months?.[selectedMonth];
      if (currentFeeStatus) {
        handleUpdateFeeStatus(studentId, currentFeeStatus);
      }
    }
  };

  const handleDeleteFee = (studentId) => {
    console.log(`Delete fee for student with ID: ${studentId}`);
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
            No fee data found. Please add fees for a year and month first using the "Set Fees for Selected Month" section above.
          </p>
        ) : (
          selectedYear && selectedMonth && (
            <StudentTable 
              students={filteredStudents}
              fetchStudents={fetchStudents}
              setEditingStudent={setEditingStudent}
              setModalVisible={setModalVisible}
            />
          )
        )
      )}
      
      <StudentFormModal
        students={students}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        editingStudent={editingStudent?{...editingStudent,selectedYear,selectedMonth}:null}
        setEditingStudent={setEditingStudent}
        fetchStudents={fetchStudents}
      />
    </div>
  );
};

export default YearlyFeeDetailsPage;
