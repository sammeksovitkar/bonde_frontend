import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentTable from './StudentTable';
import StudentFormModal from './StudentFormModal';
import SitSlotsPage from './SitSlotsPage';
import StatCard from './StatCard';
import FeeUpdateForm from './FeeUpdateForm';
import YearlyFeeDetailsPage from './YearlyFeeDetailsPage';
import { UsersIcon, MaleIcon, FemaleIcon, UserPlusIcon, SittingIcon, FaCalendarAlt, FaCheck, FaTimes } from './Icons';

const TOTAL_SITS_CAPACITY = 100;

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const [initialSelectedType, setInitialSelectedType] = useState('all');

  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
  });

  const [sitStats, setSitStats] = useState({
    paid: 0,
    unpaid: 0,
    vacant: TOTAL_SITS_CAPACITY,
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://bonde-backend-navy.vercel.app/api/students/all');
      const fetchedStudents = res.data;
      setStudents(fetchedStudents);

      const total = fetchedStudents.length;
      const male = fetchedStudents.filter(s => s.gender === 'Male').length;
      const female = fetchedStudents.filter(s => s.gender === 'Female').length;
      setStats({ total, male, female });

      let paidCount = 0;
      let unpaidCount = 0;
      
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toLowerCase();
      
      fetchedStudents.forEach(student => {
        const monthData = student.year_month?.[currentYear]?.months?.[currentMonth];
        if (monthData && monthData.paid > 0) {
          paidCount++;
        } else {
          unpaidCount++;
        }
      });

      setSitStats({
        paid: paidCount,
        unpaid: unpaidCount,
        vacant: TOTAL_SITS_CAPACITY - total,
      });

    } catch (err) {
      console.error('Error fetching students:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentPage === 'dashboard') {
      fetchStudents();
    }
  }, [currentPage]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = () => {
    setEditingStudent(null);
    setModalVisible(true);
  };
  
  const handleSitViewClick = (type) => {
    setInitialSelectedType(type);
    setCurrentPage('sits');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            {/* Banner Section */}
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-10 mb-10 text-white shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop")' }}></div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-extrabold mb-2 leading-tight">Welcome to Swaraj Study Point</h1>
                    <p className="text-xl font-light mb-6">Manage your students and sit slots with ease.</p>
                    <button
                        onClick={handleAdd}
                        className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
                    >
                        <UserPlusIcon className="inline-block mr-2" /> Add a New Student
                    </button>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="space-y-12">
                {/* Quick Stats Section */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Current Statistics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title="Total Students" value={stats.total} color="bg-gradient-to-r from-blue-600 to-blue-800" icon={<UsersIcon />} />
                        <StatCard title="Male Students" value={stats.male} color="bg-gradient-to-r from-green-500 to-green-700" icon={<MaleIcon />} />
                        <StatCard title="Female Students" value={stats.female} color="bg-gradient-to-r from-pink-500 to-pink-700" icon={<FemaleIcon />} />
                    </div>
                </section>

                {/* Sit Status Overview Section */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Sit Status Overview</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleSitViewClick('all')}
                            className="flex-1 min-w-40 py-4 px-6 rounded-xl text-white font-semibold shadow-md transition duration-300 bg-gray-600 hover:bg-gray-700 transform hover:scale-105"
                        >
                            <span className="text-sm">Total Sits</span>
                            <br />
                            <span className="text-4xl font-bold">{TOTAL_SITS_CAPACITY}</span>
                        </button>
                        <button
                            onClick={() => handleSitViewClick('paid')}
                            className="flex-1 min-w-40 py-4 px-6 rounded-xl text-white font-semibold shadow-md transition duration-300 bg-green-500 hover:bg-green-600 transform hover:scale-105"
                        >
                            <span className="text-sm">Paid Sits</span>
                            <br />
                            <span className="text-4xl font-bold">{sitStats.paid}</span>
                        </button>
                        <button
                            onClick={() => handleSitViewClick('unpaid')}
                            className="flex-1 min-w-40 py-4 px-6 rounded-xl text-white font-semibold shadow-md transition duration-300 bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105"
                        >
                            <span className="text-sm">Unpaid Sits</span>
                            <br />
                            <span className="text-4xl font-bold">{sitStats.unpaid}</span>
                        </button>
                        <button
                            onClick={() => handleSitViewClick('vacant')}
                            className="flex-1 min-w-40 py-4 px-6 rounded-xl text-white font-semibold shadow-md transition duration-300 bg-red-500 hover:bg-red-600 transform hover:scale-105"
                        >
                            <span className="text-sm">Vacant Sits</span>
                            <br />
                            <span className="text-4xl font-bold">{sitStats.vacant}</span>
                        </button>
                    </div>
                </section>
            </div>
          </>
        );
      case 'sits':
        return <SitSlotsPage goBack={() => {setCurrentPage('dashboard');fetchStudents()}} initialSelectedType={initialSelectedType} />;
      case 'update-fees':
        return <FeeUpdateForm goBack={() => setCurrentPage('dashboard')} />;
      case 'view-fees':
        return <YearlyFeeDetailsPage students={students} goBack={() => setCurrentPage('dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 shadow-lg flex flex-col">
        <div className="text-2xl font-extrabold mb-8 text-blue-400">Swaraj Study Point</div>
        <nav className="space-y-2">
          <div
            onClick={() => setCurrentPage('dashboard')}
            role="button"
            className={`cursor-pointer flex items-center p-3 rounded-lg hover:bg-gray-700 transition duration-200 ${currentPage === 'dashboard' ? 'bg-gray-800' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span className="font-semibold">Home</span>
          </div>
          <div
            onClick={() => setCurrentPage('sits')}
            role="button"
            className={`cursor-pointer flex items-center p-3 rounded-lg hover:bg-gray-700 transition duration-200 ${currentPage === 'sits' ? 'bg-gray-800' : ''}`}
          >
            <SittingIcon />
            <span className="font-semibold">Sit Slots</span>
          </div>
          <div
            onClick={() => setCurrentPage('view-fees')}
            role="button"
            className={`cursor-pointer flex items-center p-3 rounded-lg hover:bg-gray-700 transition duration-200 ${currentPage === 'view-fees' ? 'bg-gray-800' : ''}`}
          >
            <FaCalendarAlt className="mr-2 w-5 h-5" />
            <span className="font-semibold">View Student List</span>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-auto">
        {renderContent()}
      </main>

      {/* Modals are placed here to be rendered outside of the main content flow */}
      <StudentFormModal
        students={students}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
        fetchStudents={fetchStudents}
      />
    </div>
  );
};

export default Dashboard;