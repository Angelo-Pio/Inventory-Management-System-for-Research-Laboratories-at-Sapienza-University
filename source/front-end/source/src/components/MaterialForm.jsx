import { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";

import { getAllCategories } from "../services/labManagerServices";
import { lineHeight } from "@mui/system";

export default function EmployeeForm(props) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
    categories,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit]
  );

  const handleTextFieldChange = useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange]
  );

  const handleNumberFieldChange = useCallback(
    (event) => {
      onFieldChange(event.target.name, Number(event.target.value));
    },
    [onFieldChange]
  );

  const handleCategoryFieldChange = useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange]
  );

  const handleSelectFieldChange = useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange]
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = useCallback(() => {
    const parentPath = location.pathname.substring(
      0,
      location.pathname.lastIndexOf("/")
    );
    navigate(parentPath || "/");
  }, [navigate, backButtonPath]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: "100%" }}
    >
      <FormGroup>
        <TextField
          value={formValues.name ?? ""}
          onChange={handleTextFieldChange}
          name="name"
          label="Material name"
          error={!!formErrors.name}
          helperText={formErrors.name ?? " "}
          fullWidth
          variant="standard"
        />
        <TextField label="Description" variant="standard" fullWidth multiline />
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ marginY: 5 }}
        >
          <TextField
            type="number"
            variant="standard"
            value={formValues.threshold ?? ""}
            onChange={handleNumberFieldChange}
            name="threshold"
            label="Threshold"
            error={!!formErrors.threshold}
            helperText={formErrors.threshold ?? " "}
            fullWidth
          />
          <TextField
            type="number"
            variant="standard"
            value={formValues.quantity ?? ""}
            onChange={handleNumberFieldChange}
            name="quantity"
            label="Quantity"
            error={!!formErrors.quantity}
            helperText={formErrors.quantity ?? " "}
            fullWidth
          />
        </Stack>
        <Stack
          direction="row"
          spacing={5}
          justifyContent="space-between"
          sx={{ marginBottom: 5 }}
        >
          {!isNewCategory ? (
            <>
              {/* <TextField
                select
                variant="standard"
                value={formValues.category ?? ""}
                onChange={handleSelectFieldChange}
                name="category"
                label="Category"
                error={!!formErrors.category}
                helperText={formErrors.category ?? " "}
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.title}>
                    {cat.title}
                  </MenuItem>
                ))}
              </TextField> */}

              <Button
                variant="contained"
                onClick={() => {
                  onFieldChange("category", "");
                  setIsNewCategory(true);
                }}
                sx={{ lineHeight: 1, whiteSpace: "nowrap" }}
              >
                New Category
              </Button>
            </>
          ) : (
            <>
              <TextField
                variant="standard"
                value={formValues.newCategory ?? ""}
                onChange={handleCategoryFieldChange}
                name="newCategory"
                label="New category name"
                error={!!formErrors.newCategory}
                helperText={formErrors.newCategory ?? " "}
                fullWidth
              />
              <FormControl error={!!formErrors.consumable} sx={{paddingRight: 10}}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.consumable || false}
                      onChange={handleSelectFieldChange}
                      name="consumable"
                    />
                  }
                  label="Consumable"
                />
                <FormHelperText>{formErrors.consumable ?? " "}</FormHelperText>
              </FormControl>

              <Button
                variant="contained"
                onClick={() => {
                  setIsNewCategory(false);
                  onFieldChange("newCategory", "");
                }}
                sx={{ lineHeight: 1, paddingY: 3 }}
              >
                Select Existing Category
              </Button>
            </>
          )}
        </Stack>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}
