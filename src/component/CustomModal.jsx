import React from 'react';

const CustomModal = ({ title, open, onCancel, onOk, children, okText, hideOkButton }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-200">
            Cancel
          </button>
          {!hideOkButton && (
            <button onClick={onOk} className="py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-200">
              {okText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
