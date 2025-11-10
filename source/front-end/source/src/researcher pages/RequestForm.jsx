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
import { useAuth } from "../components/AuthContext";

import { lineHeight } from "@mui/system";

export default function RequestForm(props) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
    materials,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSelectFieldChange = useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value, user.role);
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
      sx={{ width: "100%", marginTop: 3 }}
    >
      <FormGroup>
        <TextField
          select
          variant="standard"
          value={formValues.material ?? ""}
          onChange={handleSelectFieldChange}
          name="material"
          label="Material"
          error={!!formErrors.material}
          helperText={formErrors.material ?? " "}
          fullWidth
        >
          {materials.map((material) => (
            <MenuItem key={material.id} value={material.name}>
              {material.name}
            </MenuItem>
          ))}
        </TextField>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ marginY: 5 }}
        >
          {materials.find((mat) => mat.name === formValues.material)?.category
            .consumable && (
            <TextField
              value={formValues.quantity ?? ""}
              onChange={handleTextFieldChange}
              name="quantity"
              label="Quantity"
              type="number"
              error={!!formErrors.quantity}
              helperText={formErrors.quantity ?? " "}
              fullWidth
              variant="standard"
            />
          )}
        </Stack>

        <TextField
          label="Description"
          variant="standard"
          fullWidth
          multiline
          sx={{ marginBottom: 5 }}
        />
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
