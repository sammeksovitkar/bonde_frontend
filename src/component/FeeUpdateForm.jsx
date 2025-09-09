import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from './Icons';
import axios from 'axios';

const YearlyFeeDetailsPage = ({ goBack }) => {
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  
  // Array of months for the dropdown
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // Fetch all students on component mount
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://bonde-backend-navy.vercel.app/api/students/all');
      const fetchedStudents = res.data;
      setStudents(fetchedStudents);
      
      // Extract unique years from the student data using the correct 'year_month' key
      const allYears = [...new Set(fetchedStudents.flatMap(student =>
        Object.keys(student.year_month || {})
      ))].sort().reverse();
      setYears(allYears);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle year and month selection and filter students
  useEffect(() => {
    if (selectedYear && selectedMonth && students.length > 0) {
      const filtered = students.filter(student => {
        // Access fee data using the correct 'year_month' key
        const feesForMonth = student.year_month?.[selectedYear]?.[selectedMonth];
        
        // Log the value to help with debugging
        console.log(`Student ${student.sitNo} - ${selectedYear}-${selectedMonth}:`, feesForMonth);
        
        // The condition requires feesForMonth to exist and its value to be greater than 0
        return feesForMonth && feesForMonth.value > 0;
      }).map(student => {
        const feesForMonth = student.year_month[selectedYear][selectedMonth];
        return {
          ...student,
          feesForMonth: feesForMonth,
        };
      });
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedYear, selectedMonth, students]);

  // Render the fee status based on the fee values
  const renderStatus = (fees) => {
    if (fees.value > 0 && fees.paid > 0) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">Paid</span>;
    } else if (fees.value > 0) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">Unpaid</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">N/A</span>;
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">View Fees by Year and Month</h2>
        <button onClick={goBack} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-200 flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
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
            No fee data found. Please add fees for a year and month first using the "Update Fees" form.
          </p>
        ) : (
          selectedYear && selectedMonth && (
            filteredStudents.length > 0 ? (
              <div className="overflow-x-auto mt-6">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-left">
                      <th className="px-6 py-3 font-semibold text-gray-600">Sit No</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.sitNo} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">{student.sitNo}</td>
                        <td className="px-6 py-4">{student.name}</td>
                        <td className="px-6 py-4">{renderStatus(student.feesForMonth)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-6">No students found for {selectedMonth} {selectedYear}.</p>
            )
          )
        )
      )}
    </div>
  );
};

export default YearlyFeeDetailsPage;
