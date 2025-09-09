import React, { useEffect, useState } from 'react';
import { Button, Modal, Select, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

const TOTAL_SITS = 100;
const currentYear = new Date().getFullYear().toString();
const months = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sept', 'oct', 'nov', 'dec'
];

const SeatsPage = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('default', { month: 'short' }).toLowerCase()
  );
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://bonde-backend-navy.vercel.app/api/students/all');
        setAllStudents(res.data);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const getFilteredStudents = () => {
    const monthlyPaidStudents = allStudents.filter(student => {
      const monthData = student.year_month?.[currentYear]?.months?.[selectedMonth];
      return monthData && monthData.paid > 0;
    });

    switch (filterType) {
      case 'paid':
        return monthlyPaidStudents;
      case 'unpaid':
        return allStudents.filter(student => !monthlyPaidStudents.some(paidStudent => paidStudent.sitNo === student.sitNo));
      case 'all':
      default:
        return allStudents;
    }
  };

  const renderSeats = () => {
    const seats = [];
    const studentsToDisplay = getFilteredStudents();

    for (let i = 1; i <= TOTAL_SITS; i++) {
      const allStudent = allStudents.find((s) => s.sitNo === i.toString());
      const isPaidForMonth = allStudent && allStudent.year_month?.[currentYear]?.months?.[selectedMonth]?.paid > 0;
      const isOccupied = !!allStudent;
      
      let backgroundColor = 'gray';
      if (isOccupied) {
        backgroundColor = isPaidForMonth ? 'green' : 'red';
      }

      // Check if the seat should be visible based on the current filter and the student's status
      const isVisible = 
        filterType === 'all' || 
        (filterType === 'paid' && isPaidForMonth) || 
        (filterType === 'unpaid' && isOccupied && !isPaidForMonth);
      
      if (!isVisible && filterType !== 'all') {
        continue; // Skip rendering if the seat does not match the filter
      }

      seats.push(
        <Button
          key={i}
          style={{
            backgroundColor,
            color: 'white',
            margin: '5px',
            width: '60px',
            height: '60px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => isOccupied && setSelected(allStudent)}
        >
          {i}
        </Button>
      );
    }
    return seats;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" />
        <p>Loading seats...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Seats Overview ({selectedMonth.toUpperCase()})</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={() => setFilterType('all')} type={filterType === 'all' ? 'primary' : 'default'}>All</Button>
          <Button onClick={() => setFilterType('paid')} type={filterType === 'paid' ? 'primary' : 'default'}>Paid</Button>
          <Button onClick={() => setFilterType('unpaid')} type={filterType === 'unpaid' ? 'primary' : 'default'}>Unpaid</Button>
          <Select
            defaultValue={selectedMonth}
            style={{ width: 120 }}
            onChange={(value) => {
              setSelectedMonth(value);
            }}
          >
            {months.map(month => (
              <Option key={month} value={month}>{month.toUpperCase()}</Option>
            ))}
          </Select>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {renderSeats()}
      </div>

      <Modal
        open={!!selected}
        title={`Student Details (Sit No: ${selected?.sitNo})`}
        onCancel={() => setSelected(null)}
        footer={null}
      >
        <p><strong>Name:</strong> {selected?.name}</p>
        <p><strong>Gender:</strong> {selected?.gender}</p>
        <p><strong>Mobile:</strong> {selected?.mobile}</p>
        <p><strong>Email:</strong> {selected?.email}</p>
        <p><strong>Address:</strong> {selected?.address}</p>
      </Modal>
    </div>
  );
};

export default SeatsPage;