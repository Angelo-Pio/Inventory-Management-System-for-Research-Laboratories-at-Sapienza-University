import { apiCall } from './api';

// Material management
export const addMaterial = async (departmentId, materialData) => {

  console.log(JSON.stringify(materialData));
  
  return await apiCall(`/management/${departmentId}/material`, {
    method: 'POST',
    body: JSON.stringify(materialData),
  });
};

export const getDepartmentMaterials = async (departmentId) => {
  return await apiCall(`/management/${departmentId}/material`);
};


export async function getMany({ departmentId, paginationModel = { page: 0, pageSize: 10 }, filterModel = { items: [] } }) {
  if (departmentId == null) throw new Error('departmentId is required');
  
  // fetch all materials for the department
  const materials = await getDepartmentMaterials(departmentId);
  let filtered = Array.isArray(materials.data) ? [...materials.data] : [];

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
          //filter only by name (not category)
          // String(readField(item, 'category.title') || '').toLowerCase(),
        ].some((v) => v.includes(q))
      )
    );
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
 * updateMaterialQuantity: calls the backend PUT endpoint when you want to update only quantity via query params
 * (If your backend expects materialId, userId and quantity as request params)
 */
export const updateMaterialQuantity = async (departmentId, { materialId, userId, quantity }) => {
  const qs = `?materialId=${encodeURIComponent(materialId)}&userId=${encodeURIComponent(userId)}&quantity=${encodeURIComponent(quantity)}`;
  return await apiCall(`/management/${departmentId}/material${qs}`, {
    method: 'PUT',
  });
};


//Delete Material
export const deleteMaterial = async (departmentId, materialId) => {
  return await apiCall(`/management/${departmentId}/material?materialId=${encodeURIComponent(materialId)}`, {
    method: 'DELETE',
  });
};


//Validate Form
export function validate(material, categories=[]) {
  let issues = [];
 
    

  if (!material.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  if(!material.quantity){
     issues = [...issues, { message: 'Quantity is required', path: ['quantity'] }];
  }

  if(!material.threshold){
     issues = [...issues, { message: 'Threshold is required', path: ['threshold'] }];
  }


  if (!material.newCategory && !material.category) {
    issues = [...issues, { message: 'Category is required', path: ['category','newCategory'] }];
  }

  if (
  material.newCategory &&
  categories.some(
    (cat) => cat.title.trim().toLowerCase() === material.newCategory.trim().toLowerCase()
  )
) {
  issues = [
    ...issues,
    { message: "Category already exists", path: ['newCategory'] }
  ];
}
  

  return { issues };
}

// Create a new Category
export const createCategory = async (categoryData) => {
  return await apiCall(`/management/material/category`, {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

// Fetch all categories
export const getAllCategories = async () => {
  return await apiCall(`/management/material/category`);
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

const labManagerService = {
  addMaterial,
  getDepartmentMaterials,
  deleteMaterial,
  downloadReport,
};

export default labManagerService;