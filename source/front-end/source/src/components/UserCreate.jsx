import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { createUser, getAllDepartments, validateUser, getDepartmentIdByName } from "../services/adminServices";
import { useAuth } from "./AuthContext";
import UserForm from "./UserForm";
import PageContainer from "./PageContainer";

export default function GridCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formState, setFormState] = useState(() => ({
    values: {},
    errors: {},
  }));

  const [departments, setDepartments] = useState([]);
  const formValues = formState.values;
  const formErrors = formState.errors;

  useEffect(() => {
      const fetchDepartments = async () => {
        try {
          const data = await getAllDepartments();
  
          setDepartments(data.data);
        } catch (err) {
          console.error("Failed to load departments", err);
        }
      };
  
      fetchDepartments();
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
    (name, value, role = "") => {
      const validateField = async (values) => {
        const { issues } = validateUser(values, role);
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
    const { issues } = validateUser(formValues, user.role);

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
      let payload = {}
      if(user.role=='labmanager'){
      payload = {
          ...formValues,
          role:"researcher",
          departmentId:user.departmentId
        };
      console.log(payload);
      }
      if (user.role=='admin') {
        const departmentId = getDepartmentIdByName(departments,formValues.department)
        payload = {
          ...formValues,
          departmentId:departmentId
        };
      }

      console.log(payload);
      
      
      await createUser(payload);
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
      <UserForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Save"
        departments = {departments}
      />
    </PageContainer>
  );
}
