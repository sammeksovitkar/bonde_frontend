import React from 'react';

const StatCard = ({ title, value, color, icon }) => (
  <div className={`flex-1 p-6 rounded-xl shadow-md ${color} text-white flex items-center space-x-4`}>
    <div className="p-3 bg-white/20 rounded-full">{icon}</div>
    <div>
      <div className="text-sm font-light uppercase opacity-80">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  </div>
);

export default StatCard;
