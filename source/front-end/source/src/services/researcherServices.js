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

const researcherService = {
  getAvailableMaterials,
  requestMaterialLoan,
  returnMaterial,
  searchAvailableMaterials,
};

export default researcherService;