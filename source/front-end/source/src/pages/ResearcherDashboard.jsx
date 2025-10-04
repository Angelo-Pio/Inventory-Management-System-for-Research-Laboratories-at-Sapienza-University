
const ResearcherDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Researcher Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Welcome to the Laboratory Inventory Management System
          </h2>
          
          <p className="text-gray-600 text-lg leading-relaxed">
            This is the Researcher Dashboard - your central hub for managing laboratory materials and equipment. 
            Here you can view available materials, request equipment loans, track your current borrowings, 
            and return items when your research is complete.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Available Materials</h3>
              <p className="text-blue-600 text-sm">Browse and search laboratory equipment</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Request Materials</h3>
              <p className="text-green-600 text-sm">Submit requests for equipment loans</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">My Loans</h3>
              <p className="text-yellow-600 text-sm">Track your current borrowed items</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Return Materials</h3>
              <p className="text-purple-600 text-sm">Return equipment after use</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 italic">
              Sapienza University - Research Laboratory Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard;