import React from 'react';

const LabManagerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Lab Manager Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Laboratory Inventory Management & Control Center
          </h2>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Welcome to your comprehensive laboratory management hub. As a Lab Manager, you have full control 
            over inventory management, material tracking, user oversight, and detailed reporting for your department's 
            research operations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-800 text-lg mb-2">📦 Inventory Management</h3>
              <p className="text-blue-600 text-sm">Add, update, and organize laboratory materials and equipment</p>
            </div>
            
            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-green-800 text-lg mb-2">🔍 Material Tracking</h3>
              <p className="text-green-600 text-sm">Monitor stock levels, locations, and usage patterns</p>
            </div>
            
            <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-800 text-lg mb-2">👥 User Management</h3>
              <p className="text-orange-600 text-sm">Manage researcher access and monitor user activities</p>
            </div>
            
            <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-800 text-lg mb-2">📊 Reports & Analytics</h3>
              <p className="text-purple-600 text-sm">Generate detailed usage reports and inventory analytics</p>
            </div>
            
            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500">
              <h3 className="font-semibold text-red-800 text-lg mb-2">⚠️ Alerts & Notifications</h3>
              <p className="text-red-600 text-sm">Monitor low stock, overdue returns, and system alerts</p>
            </div>
            
            <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-500">
              <h3 className="font-semibold text-indigo-800 text-lg mb-2">🏷️ Barcode System</h3>
              <p className="text-indigo-600 text-sm">Scan and manage materials using barcode technology</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Add New Material
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Process Loan Requests
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Generate Monthly Report
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Materials:</span>
                <span className="font-semibold text-gray-800">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Loans:</span>
                <span className="font-semibold text-orange-600">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Low Stock Items:</span>
                <span className="font-semibold text-red-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Researchers:</span>
                <span className="font-semibold text-green-600">45</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 italic">
            Sapienza University - Laboratory Management System | Department Operations Center
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabManagerDashboard;