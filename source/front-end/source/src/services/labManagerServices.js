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

/**
 * getMany: fetch all materials for a department and then apply
 * client-side filtering, sorting and pagination similar to the employees example.
 *
 * @param {Object} args
 *  - departmentId: number
 *  - paginationModel: { page: number, pageSize: number }
 *  - filterModel: { items: [ { field, operator, value } ], quickFilterValues: [] }
 *  - sortModel: [ { field, sort } ]
 *
 * returns: { items: [...], itemCount: number }
 */
export async function getMany({ departmentId, paginationModel = { page: 0, pageSize: 25 }, filterModel = { items: [] }, sortModel = [] }) {
  if (departmentId == null) throw new Error('departmentId is required');

  // fetch all materials for the department
  const materials = await getDepartmentMaterials(departmentId);
  let filtered = Array.isArray(materials) ? [...materials] : [];

  // helper to read nested fields like "category.title"
  const readField = (obj, fieldPath) => {
    if (!fieldPath) return undefined;
    return fieldPath.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };

  // Apply item filters (operators: contains, equals, startsWith, endsWith, >, <, >=, <=)
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, operator, value }) => {
      if (!field || value == null) return;

      filtered = filtered.filter((item) => {
        const itemValue = readField(item, field);
        // normalise for string comparisons
        const aStr = itemValue != null ? String(itemValue).toLowerCase() : '';
        const bStr = String(value).toLowerCase();

        switch (operator) {
          case 'contains':
            return aStr.includes(bStr);
          case 'equals':
            // try strict equality first, then string equality fallback
            return itemValue === value || String(itemValue) === String(value);
          case 'startsWith':
            return aStr.startsWith(bStr);
          case 'endsWith':
            return aStr.endsWith(bStr);
          case '>':
            return Number(itemValue) > Number(value);
          case '<':
            return Number(itemValue) < Number(value);
          case '>=':
            return Number(itemValue) >= Number(value);
          case '<=':
            return Number(itemValue) <= Number(value);
          default:
            return true;
        }
      });
    });
  }

  // quickFilterValues: match any quick value inside commonly searched fields
  if (filterModel?.quickFilterValues?.length) {
    const qvs = filterModel.quickFilterValues.map((q) => String(q).toLowerCase());
    filtered = filtered.filter((item) =>
      qvs.every((q) =>
        [
          String(item.name || '').toLowerCase(),
          String(item.status || '').toLowerCase(),
          String(readField(item, 'category.title') || '').toLowerCase(),
        ].some((v) => v.includes(q))
      )
    );
  }

  // Apply sorting (multi-field)
  if (Array.isArray(sortModel) && sortModel.length) {
    filtered.sort((a, b) => {
      for (const { field, sort } of sortModel) {
        const va = readField(a, field);
        const vb = readField(b, field);

        if (va == null && vb == null) continue;
        if (va == null) return sort === 'asc' ? -1 : 1;
        if (vb == null) return sort === 'asc' ? 1 : -1;

        if (va < vb) return sort === 'asc' ? -1 : 1;
        if (va > vb) return sort === 'asc' ? 1 : -1;
        // equal => continue to next sort field
      }
      return 0;
    });
  }

  // Pagination
  const page = paginationModel?.page ?? 0;
  const pageSize = paginationModel?.pageSize ?? filtered.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);

  return {
    items: paginated,
    itemCount: filtered.length,
  };
}

/**
 * getOne: fetches materials for department and finds a single material by id.
 */
export async function getOne(departmentId, materialId) {
  if (departmentId == null) throw new Error('departmentId is required');
  if (materialId == null) throw new Error('materialId is required');

  const materials = await getDepartmentMaterials(departmentId);
  const found = Array.isArray(materials) ? materials.find((m) => String(m.id) === String(materialId)) : null;

  if (!found) {
    throw new Error('Material not found');
  }
  return found;
}

export const updateMaterial = async (departmentId, materialData) => {
  // this keeps the original semantics you already had (JSON body)
  return await apiCall(`/management/${departmentId}/material`, {
    method: 'PUT',
    body: JSON.stringify(materialData),
  });
};

/**
 * updateMaterialQuantity: calls the backend PUT endpoint when you want to update only quantity via query params
 * (If your backend expects materialId, userId and quantity as request params)
 */
export const updateMaterialQuantity = async (departmentId, { materialId, userId, quantity }) => {
  const qs = `?materialId=${encodeURIComponent(materialId)}&userId=${encodeURIComponent(userId)}&quantity=${encodeURIComponent(quantity)}`;
  return await apiCall(`/management/${departmentId}/material${qs}`, {
    method: 'PUT',
  });
};

export const deleteMaterial = async (departmentId, materialId) => {
  // keep your existing query param name - if backend expects material_id or materialId, make sure it matches
  // here we pass material_id as in your snippet; change to 'materialId' if needed
  return await apiCall(`/management/${departmentId}/material?material_id=${encodeURIComponent(materialId)}`, {
    method: 'DELETE',
  });
};

export const getMaterialByBarcode = async (departmentId, barcode) => {
  return await apiCall(`/management/${departmentId}/material/barcode?barcode=${encodeURIComponent(barcode)}`);
};

export const searchMaterials = async (departmentId, searchTerm) => {
  return await apiCall(`/management/${departmentId}/material/search?q=${encodeURIComponent(searchTerm)}`);
};

// Report generation (kept as-is; consider using apiCall wrapper if desired)
export const downloadReport = async (departmentId, startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/management/report/${departmentId}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
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



// export const addMaterial = async (departmentId, materialData) => {
//   return await apiCall(`/management/${departmentId}/material`, {
//     method: 'POST',
//     body: JSON.stringify(materialData),
//   });
// };

// export const getDepartmentMaterials = async (departmentId) => {
//   return await apiCall(`/management/${departmentId}/material`);
// };

// export const updateMaterial = async (departmentId, materialData) => {
//   return await apiCall(`/management/${departmentId}/material`, {
//     method: 'PUT',
//     body: JSON.stringify(materialData),
//   });
// };

// export const deleteMaterial = async (departmentId, materialId) => {
//   return await apiCall(`/management/${departmentId}/material?material_id=${materialId}`, {
//     method: 'DELETE',
//   });
// };

// export const getMaterialByBarcode = async (departmentId, barcode) => {
//   return await apiCall(`/management/${departmentId}/material/barcode?barcode=${barcode}`);
// };

// export const searchMaterials = async (departmentId, searchTerm) => {
//   return await apiCall(`/management/${departmentId}/material/search?q=${encodeURIComponent(searchTerm)}`);
// };

// // Report generation
// export const downloadReport = async (departmentId, startDate, endDate) => {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/management/report/${departmentId}?startDate=${startDate}&endDate=${endDate}`,
//       { credentials: 'include' }
//     );
    
//     if (response.ok) {
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `report_${departmentId}_${startDate}_${endDate}.csv`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//       return { success: true };
//     } else {
//       const errorText = await response.text();
//       return { success: false, error: errorText || 'Report generation failed' };
//     }
//   } catch (error) {
//     console.error('Report download error:', error);
//     return { success: false, error: 'Network error occurred' };
//   }
// };

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