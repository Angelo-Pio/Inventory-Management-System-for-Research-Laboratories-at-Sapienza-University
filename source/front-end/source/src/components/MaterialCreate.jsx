import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  addMaterial,
  validate as validateMaterial,
  getAllCategories,
  createCategory,
} from "../services/labManagerServices";
import { useAuth } from "./AuthContext";
import MaterialForm from "./MaterialForm";
import PageContainer from "./PageContainer";

export default function GridCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formState, setFormState] = useState(() => ({
    values: {consumable:false},
    errors: {},
  }));

  const [categories, setCategories] = useState([]);
  const formValues = formState.values;
  const formErrors = formState.errors;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();

        setCategories(data.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    fetchCategories();
  }, []);
  useEffect(() => {
    console.log(categories);
    
  }, [categories]);

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
        const { issues } = validateMaterial(values, categories);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };
      console.log(newFormValues);
      
      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues]
  );

  const handleFormReset = useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = useCallback(async () => {
    const { issues } = validateMaterial(formValues, categories);

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
      let payload = {};
      if (formValues.category) {
        payload = {
          ...formValues,
          category: { title: formValues.category },
        };
      }
      if (formValues.newCategory) {
        payload = {
          ...formValues,
          category: { title: formValues.newCategory,  consumable: formValues.consumable },
        };
        
        if (!formValues.consumable) {
          payload = {
          ...payload,
          threshold : 1,
          quantity:1,
        };
        }
      }
      const payloadNewCategory = { title: formValues.newCategory, consumable: formValues.consumable };

      console.log("payload: ", payload);
      console.log("categories:",payloadNewCategory);
      
      
      await addMaterial(user.departmentId, payload);
      if (formValues.newCategory)
        await createCategory(payloadNewCategory);

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
    <PageContainer title="New Material">
      <MaterialForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Save"
        categories={categories}
      />
    </PageContainer>
  );
}
