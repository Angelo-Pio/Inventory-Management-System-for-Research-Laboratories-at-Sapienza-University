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
export const requestMaterial = async (requestBody) => {
  return await apiCall(`/material/request`, {
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


export async function getManyRequests({
  researcherId,
  paginationModel = { page: 0, pageSize: 10 },
  filterModel = { items: [] },
  sortModel = [{ field: 'materialName', sort: 'asc' }],
}) {
  if (researcherId == null) throw new Error('researcherId is required');

  // Fetch all requests from API
  const response = await getResearcherRequests(researcherId);
  let filtered = Array.isArray(response.data) ? [...response.data] : [];

  // Helper to read nested fields like "material.name"
  const readField = (obj, fieldPath) =>
    fieldPath?.split('.').reduce((acc, key) => acc?.[key], obj);

  // Filtering (same logic as materials)
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, operator, value }) => {
      if (!field || value == null) return;

      filtered = filtered.filter((item) => {
        const itemValue = readField(item, field);
        const aStr = itemValue != null ? String(itemValue).toLowerCase() : '';
        const bStr = String(value).toLowerCase();

        switch (operator) {
          case 'contains':
            return aStr.includes(bStr);
          case 'equals':
            return itemValue === value || aStr === bStr;
          case 'startsWith':
            return aStr.startsWith(bStr);
          case 'endsWith':
            return aStr.endsWith(bStr);
          default:
            return true;
        }
      });
    });
  }

  // Quick Filter (search bar)
  if (filterModel?.quickFilterValues?.length) {
    const qvs = filterModel.quickFilterValues.map((q) => String(q).toLowerCase());
    filtered = filtered.filter((item) =>{
      console.log(item);
      
      qvs.every((q) =>
        [
          String(item.name || '').toLowerCase(),
        ].some((v) => v.includes(q))
      )
    }
    );
  }

  // Sorting
  const activeSort = sortModel?.[0] || { field: 'materialName', sort: 'asc' };
  const { field: sortField, sort: sortOrder } = activeSort;

  if (sortField) {
    filtered.sort((a, b) => {
      const va = readField(a, sortField);
      const vb = readField(b, sortField);
      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      if (sa < sb) return sortOrder === 'asc' ? -1 : 1;
      if (sa > sb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const page = paginationModel.page ?? 0;
  const pageSize = paginationModel.pageSize ?? filtered.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);

  return {
    items: paginated,
    itemCount: filtered.length,
  };
}




const researcherService = {
  getAvailableMaterials,
  requestMaterialLoan,
  returnMaterial,
  searchAvailableMaterials,
};

export default researcherService;