import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { getDepartmentMaterials, validateRequest } from "../services/labManagerServices";
import { useAuth } from "../components/AuthContext";
import RequestForm from "./RequestForm";
import PageContainer from "../components/PageContainer";

export default function RequestCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formState, setFormState] = useState(() => ({
    values: {},
    errors: {},
  }));

  const [materials, setMaterials] = useState([]);
  const formValues = formState.values;
  const formErrors = formState.errors;

  useEffect(() => {
      const fetchMaterials = async () => {
        try {
          const data = await getDepartmentMaterials(user.departmentId);
  
          setMaterials(data.data);
        } catch (err) {
          console.error("Failed to load materials", err);
        }
      };
  
      fetchMaterials();
    }, []);

    

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
        const { issues } = validateRequest(values);
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
    const { issues } = validateRequest(formValues);

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
      // let payload = {}
      // if(user.role=='labmanager'){
      // payload = {
      //     ...formValues,
      //     role:"researcher",
      //     departmentId:user.departmentId
      //   };
      // console.log(payload);
      // }
      // if (user.role=='admin') {
      //   const departmentId = getDepartmentIdByName(departments,formValues.department)
      //   payload = {
      //     ...formValues,
      //     departmentId:departmentId
      //   };
      // }

      console.log(formValues);
      
      
      // await createUser(formValues);
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
    <PageContainer title="New User">
      <RequestForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Save"
        materials = {materials}
      />
    </PageContainer>
  );
}
