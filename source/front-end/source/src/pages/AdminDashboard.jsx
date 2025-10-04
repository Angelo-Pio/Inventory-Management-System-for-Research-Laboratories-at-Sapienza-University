import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Admin Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            System Administration & Control Center
          </h2>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Welcome to the administrative control center for Sapienza University's Laboratory Inventory Management System. 
            As a System Administrator, you have comprehensive oversight of all departments, users, and system operations 
            across the entire university research infrastructure.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-600">
              <h3 className="font-semibold text-red-800 text-lg mb-2">👑 System Management</h3>
              <p className="text-red-600 text-sm">Configure system settings, security, and global parameters</p>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600">
              <h3 className="font-semibold text-blue-800 text-lg mb-2">👤 User Administration</h3>
              <p className="text-blue-600 text-sm">Create, modify, and manage all user accounts and permissions</p>
            </div>
            
            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-600">
              <h3 className="font-semibold text-green-800 text-lg mb-2">🏢 Department Management</h3>
              <p className="text-green-600 text-sm">Oversee department creation, structure, and resource allocation</p>
            </div>
            
            <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-600">
              <h3 className="font-semibold text-purple-800 text-lg mb-2">📈 Global Analytics</h3>
              <p className="text-purple-600 text-sm">University-wide reports, usage statistics, and trend analysis</p>
            </div>
            
            <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-600">
              <h3 className="font-semibold text-orange-800 text-lg mb-2">🔐 Security & Audit</h3>
              <p className="text-orange-600 text-sm">Monitor system access, security logs, and audit trails</p>
            </div>
            
            <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-600">
              <h3 className="font-semibold text-indigo-800 text-lg mb-2">⚙️ System Configuration</h3>
              <p className="text-indigo-600 text-sm">Database management, backup systems, and maintenance</p>
            </div>
            
            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-600">
              <h3 className="font-semibold text-yellow-800 text-lg mb-2">🚨 Alert Management</h3>
              <p className="text-yellow-600 text-sm">System-wide notifications, critical alerts, and escalations</p>
            </div>
            
            <div className="bg-teal-50 p-5 rounded-lg border-l-4 border-teal-600">
              <h3 className="font-semibold text-teal-800 text-lg mb-2">📊 Performance Monitoring</h3>
              <p className="text-teal-600 text-sm">System health, performance metrics, and optimization</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Administrative Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Create New User
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Add Department
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Generate System Report
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                System Backup
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">University Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Departments:</span>
                <span className="font-semibold text-gray-800">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users:</span>
                <span className="font-semibold text-blue-600">342</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lab Managers:</span>
                <span className="font-semibold text-green-600">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Researchers:</span>
                <span className="font-semibold text-purple-600">318</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Health:</span>
                <span className="font-semibold text-green-600">Optimal</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent System Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">New user registration - Biology Dept.</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Department report generated - Chemistry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">System backup completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Security audit scheduled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Critical update available</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Administrative Privileges Active</h3>
          <p className="text-red-100">
            You are currently operating with full administrative privileges. Please exercise caution when making 
            system-wide changes that may affect all departments and users across the university network.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 italic">
            Sapienza University - Laboratory Inventory Management System | Administrative Control Center
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;