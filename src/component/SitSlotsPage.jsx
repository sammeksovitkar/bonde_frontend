import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomModal from './CustomModal';
import { FaArrowLeft } from './Icons';

// New component for the sit buttons, with Tailwind styling
const SitButton = ({ sit, onClick }) => {
  let buttonColor = '';
  let statusText = '';

  if (sit.isBooked) {
    if (sit.status === 'paid') {
      buttonColor = 'bg-green-500 hover:bg-green-600';
      statusText = 'Paid';
    } else if (sit.status === 'unpaid') {
      buttonColor = 'bg-yellow-500 hover:bg-yellow-600';
      statusText = 'Unpaid';
    }
  } else {
    // This is a truly vacant sit
    buttonColor = 'bg-red-500 hover:bg-red-600';
    statusText = 'Vacant';
  }

  return (
    <button
      onClick={() => onClick(sit)}
      className={`rounded-md p-2 text-white font-semibold transition duration-200 w-full h-16 flex flex-col items-center justify-center text-center ${buttonColor}`}
    >
      <span>Sit {sit.sitNumber}</span>
      <span className="text-xs mt-1">{statusText}</span>
    </button>
  );
};

const SitSlotsPage = ({ goBack }) => {
  const [sits, setSits] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [selectedSitNumber, setSelectedSitNumber] = useState(null);
  const [vacantCount, setVacantCount] = useState(0);

  // Filter states
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'paid', 'unpaid', 'vacant'
  const [years, setYears] = useState([]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

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
      if (allYears.length > 0) {
        setSelectedYear(allYears[0]);
      }
      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      setSelectedMonth(currentMonth);

    } catch (err) {
      console.error('Error fetching students:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const initialSits = Array.from({ length: 100 }, (_, i) => ({
      sitNumber: i + 1,
      isBooked: false,
      studentInfo: null,
      status: 'vacant',
    }));

    // Update sits array with actual student data and status based on filters
    const updatedSits = initialSits.map(sit => {
      const student = students.find(s => s.sitNo === sit.sitNumber);
      if (student) {
        sit.isBooked = true;
        sit.studentInfo = student;
        
        // This is the core fix. Ensure month names are consistent (lowercase).
        const monthData = student.year_month?.[selectedYear]?.months?.[selectedMonth.toLowerCase()];
        
        if (monthData && monthData.paid > 0) {
          sit.status = 'paid';
        } else {
          // If a student is booked but has no fee record for the month, we treat it as unpaid.
          sit.status = 'unpaid';
        }
      }
      return sit;
    });

    // The core logic for filtering what is displayed
    const finalSits = updatedSits.filter(sit => {
      if (selectedType === 'all') return true;
      
      // When 'vacant' is selected, only show sits that are not booked at all
      if (selectedType === 'vacant') {
        return !sit.isBooked;
      }
      
      // For 'paid' or 'unpaid', filter based on the determined status
      return sit.status === selectedType;
    });

    setSits(finalSits);

    // Recalculate vacant count based on actual booked sits
    const bookedSitNumbers = new Set(students.map(s => s.sitNo));
    setVacantCount(100 - bookedSitNumbers.size);
  }, [students, selectedYear, selectedMonth, selectedType]);


  const handleSitClick = (sit) => {
    setStudentInfo(sit.isBooked ? sit.studentInfo : null);
    setSelectedSitNumber(sit.sitNumber);
    setInfoModalVisible(true);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Study Point Sit Slots ({vacantCount} Vacant)</h2>
        <button onClick={goBack} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-200 flex items-center mt-4 sm:mt-0">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6 items-center">
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
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${selectedType === 'all' ? 'bg-gray-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('paid')}
            className={`py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${selectedType === 'paid' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            Paid
          </button>
          <button
            onClick={() => setSelectedType('unpaid')}
            className={`py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${selectedType === 'unpaid' ? 'bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
          >
            Unpaid
          </button>
          <button
            onClick={() => setSelectedType('vacant')}
            className={`py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${selectedType === 'vacant' ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            Vacant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
        {sits.map(sit => (
          <SitButton key={sit.sitNumber} sit={sit} onClick={handleSitClick} />
        ))}
      </div>

      {/* View Student Info/Sit Info Modal */}
      <CustomModal
        title={studentInfo ? 'Student Info' : `Sit #${selectedSitNumber} is Vacant`}
        open={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        okText="Close"
        hideOkButton={!studentInfo} // Hide the "OK" button for vacant sits
      >
        {studentInfo ? (
          <div className="space-y-4 text-gray-700">
            <p><strong className="font-semibold text-gray-900">Name:</strong> {studentInfo.name}</p>
            <p><strong className="font-semibold text-gray-900">Sit No:</strong> {studentInfo.sitNo}</p>
            <p><strong className="font-semibold text-gray-900">Gender:</strong> {studentInfo.gender}</p>
            <p><strong className="font-semibold text-gray-900">Mobile:</strong> {studentInfo.mobile}</p>
            <p><strong className="font-semibold text-gray-900">Email:</strong> {studentInfo.email}</p>
            <p><strong className="font-semibold text-gray-900">Address:</strong> {studentInfo.address}</p>
            <p><strong className="font-semibold text-gray-900">Fees:</strong> {studentInfo.fees}</p>
            <p><strong className="font-semibold text-gray-900">Admission Date:</strong> {studentInfo.date ? new Date(studentInfo.date).toLocaleDateString() : 'N/A'}</p>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-medium">This sit is currently vacant and available for booking.</p>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default SitSlotsPage;