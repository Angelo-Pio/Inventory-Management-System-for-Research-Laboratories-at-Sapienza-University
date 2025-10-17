import { apiCall } from './api';

// User management
export const createUser = async (userData) => {
  return await apiCall('/admin/user', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const getAllUsers = async () => {
  return await apiCall('/admin/users');
};

export const getUserById = async (userId) => {
  return await apiCall(`/admin/user?user_id=${userId}`);
};

export const updateUser = async (userData) => {
  return await apiCall('/admin/user', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId) => {
  return await apiCall(`/admin/user?user_id=${userId}`, {
    method: 'DELETE',
  });
};

// Department management
export const createDepartment = async (departmentData) => {
  return await apiCall('/admin/department', {
    method: 'POST',
    body: JSON.stringify(departmentData),
  });
};

export const getAllDepartments = async () => {
  return await apiCall('/admin/departments');
};

export const getDepartmentById = async (departmentId) => {
  return await apiCall(`/admin/department?department_id=${departmentId}`);
}

export const deleteDepartment = async (departmentId) => {
  return await apiCall(`/admin/department?department_id=${departmentId}`, {
    method: 'DELETE',
  });
};

//Filter function
export async function getFilteredUsers({ departmentId, paginationModel = { page: 0, pageSize: 10 }, filterModel = { items: [] } }) {
  if (departmentId == null) throw new Error('departmentId is required');
  const users = await getAllUsers()
  
  let filtered = Array.isArray(users.data) ? [...users.data] : [];
  console.log(filtered);
  
  // Helper to read nested fields if needed
  const readField = (obj, path) => {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  // Apply column filters
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, operator, value }) => {
      if (!field || value == null) return;

      filtered = filtered.filter((user) => {
        const itemValue = readField(user, field);
        const aStr = itemValue != null ? String(itemValue).toLowerCase() : '';
        const bStr = String(value).toLowerCase();

        switch (operator) {
          case 'contains':
            return aStr.includes(bStr);
          case 'equals':
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

  // ✅ Apply quick search filter (name, surname, email, role)
  if (filterModel?.quickFilterValues?.length) {
    const qvs = filterModel.quickFilterValues.map((q) => String(q).toLowerCase());
    filtered = filtered.filter((user) =>
      qvs.every((q) =>
        [
          String(user.name || '').toLowerCase(),
          String(user.surname || '').toLowerCase(),
         
        ].some((fieldValue) => fieldValue.includes(q))
      )
    );
  }

  // ✅ Apply pagination
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


//Validate Form
export function validate(user) {
  let issues = [];


  if (!user.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }
  
  if (!user.surname) {
    issues = [...issues, { message: 'Surame is required', path: ['surname'] }];
  }

  if(!user.email){
     issues = [...issues, { message: 'Email is required', path: ['email'] }];
  }

  if(!user.password){
     issues = [...issues, { message: 'Password is required', path: ['password'] }];
  }
  

  return { issues };
}



const adminService = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  createDepartment,
  getAllDepartments,
  deleteDepartment,
};

export default adminService;