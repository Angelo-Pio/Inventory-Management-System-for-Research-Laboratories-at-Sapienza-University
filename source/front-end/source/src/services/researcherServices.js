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

  const res = await apiCall(`/material/${materialId}/use?quantity_used=1`, {
    method: 'POST',
  });

  // apiCall may already throw on non-2xx; return the API response for caller to inspect.
  return res;
}


const researcherService = {
  getAvailableMaterials,
  requestMaterialLoan,
  returnMaterial,
  searchAvailableMaterials,
};

export default researcherService;