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