import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getDepartmentMaterials,
  validateRequest,
} from "../services/labManagerServices";
import { useAuth } from "../components/AuthContext";
import RequestForm from "./RequestForm";
import PageContainer from "../components/PageContainer";
import {
  requestMaterial,
  markDamagedAndIssue,
  getResearcherRequests,
} from "../services/researcherServices";

export default function RequestCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formState, setFormState] = useState(() => ({
    values: {},
    errors: {},
  }));

  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const formValues = formState.values;
  const formErrors = formState.errors;

  useEffect(() => {
    if (!user?.departmentId || !user?.id) return;

    const fetchMaterials = async () => {
      try {
        const [materialsResp, requestsResp] = await Promise.all([
          getDepartmentMaterials(user.departmentId).catch((err) => {
            console.error("Failed to load materials", err);
            return null;
          }),
          getResearcherRequests(user.id).catch((err) => {
            console.error("Failed to load requests", err);
            return null;
          }),
        ]);

        const materialsData = materialsResp?.data ?? [];
        const requestsData = requestsResp?.data ?? [];

        console.log("materials:", materialsData);
        console.log("requests:", requestsData);

        const requestedMaterialIds = new Set(
          requestsData
            .map((r) => r.material_id)
            .filter((id) => id !== undefined && id !== null)
        );

        const filtered = materialsData.filter(
          (mat) =>
            !requestedMaterialIds.has(mat.id) ||
            (requestedMaterialIds.has(mat.id) && mat.category.consumable) ||
            (requestedMaterialIds.has(mat.id) && mat.status === "None")
        );

        setMaterials(filtered);
        console.log("filteredMaterials:", filtered);
      } catch (err) {
        console.error("Unexpected error while fetching dashboard data", err);
      }
    };

    fetchMaterials();
  }, [user?.departmentId, user?.id]);

  const setFormValues = useCallback((newFormValues) => {
    setFormState((previousState) => ({
      ...previousState,
      values: newFormValues,
    }));
  }, []);

  const setFormErrors = useCallback((newFormErrors) => {
    setFormState((previousState) => ({
      ...previousState,
      errors: newFormErrors,
    }));
  }, []);

  const handleFormFieldChange = useCallback(
    (name, value) => {
      const validateField = async (values) => {
        const { issues } = validateRequest(values, materials);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues]
  );

  const handleFormReset = useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = useCallback(async () => {
    const { issues } = validateRequest(formValues, materials);

    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(
          issues.map((issue) => [issue.path?.[0], issue.message])
        )
      );
      return;
    }
    setFormErrors({});

    try {
      const material = materials.find((m) => m.name === formValues.material);
      console.log(material);
      let payload = {};

      if (!material.category.consumable) {
        console.log(user.name);

        payload = {
          material_id: material.id,
          researcher_id: user.id,
          researcher_name: user.name,
          researcher_surname: user.surname,
          materialStatus: "Damaged",
          quantity: 1,
          requestStatus: "Pending",
        };
        await markDamagedAndIssue(payload.material_id, user.id);
        await requestMaterial(payload);
      } else {
        payload = {
          material_id: material.id,
          researcher_id: user.id,
          researcher_name: user.name,
          researcher_surname: user.surname,
          materialStatus: "LowStock",
          quantity: formValues.quantity,
        };
        await requestMaterial(payload);
      }
      console.log(payload);

      const parentPath = location.pathname.substring(
        0,
        location.pathname.lastIndexOf("/")
      );
      navigate(parentPath || "/");
    } catch (createError) {
      throw createError;
    }
  }, [formValues, navigate, setFormErrors]);

  return (
    <PageContainer title="New Request">
      <RequestForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Save"
        materials={materials}
      />
    </PageContainer>
  );
}
