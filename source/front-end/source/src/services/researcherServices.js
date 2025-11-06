import { apiCall } from './api';

// Material access and loans
export const getAvailableMaterials = async (departmentId) => {
  return await apiCall(`/researcher/${departmentId}/material`);
};

export const requestMaterialLoan = async (departmentId, loanData) => {
  return await apiCall(`/researcher/${departmentId}/material`, {
    method: 'POST',
    body: JSON.stringify(loanData),
  });
};

export const returnMaterial = async (departmentId, returnData) => {
  return await apiCall(`/researcher/${departmentId}/material`, {
    method: 'PUT',
    body: JSON.stringify(returnData),
  });
};

export const searchAvailableMaterials = async (departmentId, searchTerm) => {
  return await apiCall(`/researcher/${departmentId}/material/search?q=${encodeURIComponent(searchTerm)}`);
};

export const useMaterial = async(materialId, quantity_used)=> {
  if (!materialId) {
    throw new Error('materialId is required');
  }
  if (!Number.isFinite(Number(quantity_used)) || Number(quantity_used) <= 0) {
    throw new Error('quantity_used must be a positive number');
  }

  const params = new URLSearchParams({ quantity_used: String(Math.floor(Number(quantity_used))) });
  
  const res = await apiCall(`/material/${materialId}/use?quantity_used=${quantity_used}`, {
    method: 'POST',
  });
  console.log(res);


  return res.data;
}

// Issue a material request
export const requestMaterial = async (materialId, requestBody) => {
  return await apiCall(`/material/${materialId}/request`, {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
};

// Mark material as damaged and issue a ticket
export const markDamagedAndIssue = async (materialId, labUserId) => {
  return await apiCall(`/material/${materialId}/issue?labUserId=${labUserId}`, {
    method: "POST",
  });
};

// Get all requests opened by a researcher
export const getResearcherRequests = async (researcherId) => {
  return await apiCall(`/researcher/requests?researcherId=${researcherId}`);
};



const researcherService = {
  getAvailableMaterials,
  requestMaterialLoan,
  returnMaterial,
  searchAvailableMaterials,
};

export default researcherService;