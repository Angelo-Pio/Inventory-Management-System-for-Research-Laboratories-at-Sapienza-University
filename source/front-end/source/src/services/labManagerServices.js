import { apiCall, downloadFile } from './api';

// Material management
export const addMaterial = async (departmentId, materialData) => {
  return await apiCall(`/management/${departmentId}/material`, {
    method: 'POST',
    body: JSON.stringify(materialData),
  });
};

export const getDepartmentMaterials = async (departmentId) => {
  return await apiCall(`/management/${departmentId}/material`);
};

export const updateMaterial = async (departmentId, materialData) => {
  return await apiCall(`/management/${departmentId}/material`, {
    method: 'PUT',
    body: JSON.stringify(materialData),
  });
};

export const deleteMaterial = async (departmentId, materialId) => {
  return await apiCall(`/management/${departmentId}/material?material_id=${materialId}`, {
    method: 'DELETE',
  });
};

export const getMaterialByBarcode = async (departmentId, barcode) => {
  return await apiCall(`/management/${departmentId}/material/barcode?barcode=${barcode}`);
};

export const searchMaterials = async (departmentId, searchTerm) => {
  return await apiCall(`/management/${departmentId}/material/search?q=${encodeURIComponent(searchTerm)}`);
};

// Report generation
export const downloadReport = async (departmentId, startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/management/report/${departmentId}?startDate=${startDate}&endDate=${endDate}`,
      { credentials: 'include' }
    );
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${departmentId}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText || 'Report generation failed' };
    }
  } catch (error) {
    console.error('Report download error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

const labManagerService = {
  addMaterial,
  getDepartmentMaterials,
  updateMaterial,
  deleteMaterial,
  getMaterialByBarcode,
  searchMaterials,
  downloadReport,
};

export default labManagerService;