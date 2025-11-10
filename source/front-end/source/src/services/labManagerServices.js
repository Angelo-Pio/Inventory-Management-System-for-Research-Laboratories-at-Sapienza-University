import { apiCall } from "./api";

export const getTotalRestocked = async (departmentId) => {
  return await apiCall(`/management/${departmentId}/graphdata/totRestocked`, {
    method: "GET",
  });
};

export const getMostRestockedMaterial = async (departmentId) => {
  return await apiCall(
    `/management/${departmentId}/graphdata/mostRestockedMaterial`,
    {
      method: "GET",
    }
  );
};

// Material management
export const addMaterial = async (departmentId, materialData) => {
  return await apiCall(`/management/${departmentId}/material`, {
    method: "POST",
    body: JSON.stringify(materialData),
  });
};

export const getMaterialById = async (id) => {
  return await apiCall(`/management/material?id=${id}`);
};

export const getDepartmentMaterials = async (departmentId) => {
  return await apiCall(`/management/${departmentId}/material`);
};

export async function getMany({
  departmentId,
  paginationModel = { page: 0, pageSize: 10 },
  filterModel = { items: [] },
  sortModel = [{ field: "name", sort: "asc" }],
}) {
  if (departmentId == null) throw new Error("departmentId is required");

  const materials = await getDepartmentMaterials(departmentId);
  let filtered = Array.isArray(materials.data) ? [...materials.data] : [];

  const readField = (obj, fieldPath) => {
    if (!fieldPath) return undefined;
    return fieldPath
      .split(".")
      .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };

  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, operator, value }) => {
      if (!field || value == null) return;

      filtered = filtered.filter((item) => {
        const itemValue = readField(item, field);

        const aStr = itemValue != null ? String(itemValue).toLowerCase() : "";
        const bStr = String(value).toLowerCase();

        switch (operator) {
          case "contains":
            return aStr.includes(bStr);
          case "equals":
            return itemValue === value || String(itemValue) === String(value);
          case "startsWith":
            return aStr.startsWith(bStr);
          case "endsWith":
            return aStr.endsWith(bStr);
          case ">":
            return Number(itemValue) > Number(value);
          case "<":
            return Number(itemValue) < Number(value);
          case ">=":
            return Number(itemValue) >= Number(value);
          case "<=":
            return Number(itemValue) <= Number(value);
          default:
            return true;
        }
      });
    });
  }

  if (filterModel?.quickFilterValues?.length) {
    const qvs = filterModel.quickFilterValues.map((q) =>
      String(q).toLowerCase()
    );
    filtered = filtered.filter((item) =>
      qvs.every((q) =>
        [String(item.name || "").toLowerCase()].some((v) => v.includes(q))
      )
    );
  }

  const activeSort = (paginationModel &&
    Array.isArray(paginationModel.sortModel) &&
    paginationModel.sortModel[0]) ||
    (sortModel && Array.isArray(sortModel) && sortModel[0]) || {
      field: "name",
      sort: "asc",
    };

  const { field: sortField, sort: sortOrder = "asc" } = activeSort;

  if (sortField) {
    const compareValues = (a, b) => {
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;

      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return na - nb;
      }

      const da = Date.parse(a);
      const db = Date.parse(b);
      if (!Number.isNaN(da) && !Number.isNaN(db)) {
        return da - db;
      }

      const sa = String(a).toLowerCase();
      const sb = String(b).toLowerCase();
      if (sa < sb) return -1;
      if (sa > sb) return 1;
      return 0;
    };

    filtered.sort((left, right) => {
      const a = readField(left, sortField);
      const b = readField(right, sortField);
      const cmp = compareValues(a, b);
      return sortOrder === "desc" ? -cmp : cmp;
    });
  }

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

export async function getManyRequests({
  messages,
  alertPaginationModel = { page: 0, pageSize: 10 },
  lowStockPaginationModel = { page: 0, pageSize: 10 },

  filterModel = { items: [] },
  sortModel = [{ field: "materialName", sort: "asc" }],
}) {
  const filtered = await Promise.all(
    messages.map(async (msg) => {
      try {
        const response = await getMaterialById(msg.materialId);
        const mat = response.data;

        return {
          name: mat.name,
          quantity: mat.quantity,
          threshold: mat.threshold,
          status: msg.materialStatus,
          requestId: msg.requestId ?? mat.name,
          category: mat.category.title ?? "-",
          consumable: mat.category.consumable,
          materialId: mat.id,
          requested_quantity: mat.category.consumable
            ? msg.requested_quantity ?? mat.threshold - mat.quantity
            : 0,
          researcher:
            ((msg?.user_name ?? "") + " " + (msg?.user_surname ?? "")).trim() ||
            "-",

          type: msg.type ?? "",
        };
      } catch (err) {
        console.error("Error fetching material for id", msg.materialId, err);
        return {
          name: msg.name ?? "",
          quantity: msg.quantity ?? 0,
          threshold: null,
          status: null,
          category: "",
          materialId: msg.materialId,
          type: msg.type,
        };
      }
    })
  );

  const lowStockMaterials = filtered.filter((m) => m.consumable);

  const alertMaterials = filtered.filter((m) => !m.consumable);
  const readField = (obj, fieldPath) =>
    fieldPath?.split(".").reduce((acc, key) => acc?.[key], obj);

  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, operator, value }) => {
      if (!field || value == null) return;

      alertMaterials = alertMaterials.filter((item) => {
        const itemValue = readField(item, field);
        const aStr = itemValue != null ? String(itemValue).toLowerCase() : "";
        const bStr = String(value).toLowerCase();

        switch (operator) {
          case "contains":
            return aStr.includes(bStr);
          case "equals":
            return itemValue === value || aStr === bStr;
          case "startsWith":
            return aStr.startsWith(bStr);
          case "endsWith":
            return aStr.endsWith(bStr);
          default:
            return true;
        }
      });
    });
  }

  if (filterModel?.quickFilterValues?.length) {
    const qvs = filterModel.quickFilterValues.map((q) =>
      String(q).toLowerCase()
    );
    alertMaterials = alertMaterials.filter((item) => {
      console.log(item);

      qvs.every((q) =>
        [String(item.name || "").toLowerCase()].some((v) => v.includes(q))
      );
    });
  }

  const activeSort = sortModel?.[0] || { field: "materialName", sort: "asc" };
  const { field: sortField, sort: sortOrder } = activeSort;

  if (sortField) {
    alertMaterials.sort((a, b) => {
      const va = readField(a, sortField);
      const vb = readField(b, sortField);
      const sa = String(va ?? "").toLowerCase();
      const sb = String(vb ?? "").toLowerCase();
      if (sa < sb) return sortOrder === "asc" ? -1 : 1;
      if (sa > sb) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  // PaginationLowStock
  const pageLowStock = lowStockPaginationModel.page ?? 0;
  const pageSizeLowStock =
    lowStockPaginationModel.pageSize ?? lowStockMaterials.length;
  const startLowStock = pageLowStock * pageSizeLowStock;
  const endLowStock = startLowStock + pageSizeLowStock;
  const paginatedLowStock = lowStockMaterials.slice(startLowStock, endLowStock);

  const pageAlert = alertPaginationModel.page ?? 0;
  const pageSizeAlert = alertPaginationModel.pageSize ?? alertMaterials.length;
  const startAlert = pageAlert * pageSizeAlert;
  const endAlert = startAlert + pageSizeAlert;
  const paginatedAlert = alertMaterials.slice(startAlert, endAlert);
  console.log(paginatedAlert);

  return {
    itemsLowStock: paginatedLowStock,
    itemCountLowStock: lowStockMaterials.length,
    itemsAlert: paginatedAlert,
    itemCountAlert: alertMaterials.length,
  };
}

export const updateMaterialQuantity = async (
  departmentId,
  { materialId, userId, quantity }
) => {
  const qs = `?materialId=${encodeURIComponent(
    materialId
  )}&userId=${encodeURIComponent(userId)}&quantity=${encodeURIComponent(
    quantity
  )}`;

  return await apiCall(`/management/${departmentId}/material${qs}`, {
    method: "PUT",
  });
};

//Delete Material
export const deleteMaterial = async (departmentId, materialId) => {
  return await apiCall(
    `/management/${departmentId}/material?materialId=${encodeURIComponent(
      materialId
    )}`,
    {
      method: "DELETE",
    }
  );
};

//Validate Form
export function validate(material, categories = [], materials = []) {
  let issues = [];

  if (!material.name) {
    issues = [...issues, { message: "Name is required", path: ["name"] }];
  }

  if (materials.some((mat) => mat.name === material.name)) {
    issues = [
      ...issues,
      {
        message: "A material with the same name already exists",
        path: ["name"],
      },
    ];
  }

  if (!material.newCategory && !material.category) {
    issues = [
      ...issues,
      { message: "Category is required", path: ["category", "newCategory"] },
    ];
  }

  if (
    material.newCategory &&
    categories.some(
      (cat) =>
        cat.title.trim().toLowerCase() ===
        material.newCategory.trim().toLowerCase()
    )
  ) {
    issues = [
      ...issues,
      { message: "Category already exists", path: ["newCategory"] },
    ];
  }

  console.log(issues);

  return { issues };
}

// Create a new Category
export const createCategory = async (categoryData) => {
  return await apiCall(`/management/material/category`, {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
};

// Fetch all categories
export const getAllCategories = async () => {
  return await apiCall(`/management/material/category/all`);
};

// Fetch all material requests for a specific department
export const getAllRequests = async (departmentId) => {
  return await apiCall(`/management/${departmentId}/requests`);
};

// Mark a specific material request as done
export const markRequestAsDone = async (requestId) => {
  return await apiCall(`/management/requests/${requestId}/done`, {
    method: "POST",
  });
};

//validate request
export function validateRequest(request, materials) {
  let issues = [];

  console.log(materials);

  if (!request.material) {
    issues = [
      ...issues,
      { message: "Material is required", path: ["material"] },
    ];
  }

  if (
    materials.find((mat) => mat.name === request.material)?.category
      .consumable &&
    !request.quantity
  ) {
    issues = [
      ...issues,
      { message: "Quantity is required", path: ["quantity"] },
    ];
  }

  return { issues };
}
export const downloadReport = async (departmentId, startDate, endDate) => {
  try {
    const response = await apiCall(
      `/management/report/${departmentId}?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.data) {
      const errorText = await response.text();
      return {
        success: false,
        error: errorText || "Failed to generate report",
      };
    }

    const blob = new Blob([response.data], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${departmentId}_${startDate}_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error downloading report:", error);
    return { success: false, error: "Network error occurred" };
  }
};

const labManagerService = {
  addMaterial,
  getDepartmentMaterials,
  deleteMaterial,
  downloadReport,
};

export default labManagerService;
