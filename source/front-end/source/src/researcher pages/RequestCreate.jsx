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

export default function EmployeeForm(props) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
    departments
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
      sx={{ width: "100%" }}
    >
      <FormGroup>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <TextField
            value={formValues.name ?? ""}
            onChange={handleTextFieldChange}
            name="name"
            label="Name"
            error={!!formErrors.name}
            helperText={formErrors.name ?? " "}
            fullWidth
            variant="standard"
          />
          <TextField
            value={formValues.surname ?? ""}
            onChange={handleTextFieldChange}
            name="surname"
            label="Surname"
            error={!!formErrors.surname}
            helperText={formErrors.surname ?? " "}
            fullWidth
            variant="standard"
          />
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ marginY: 5 }}
        >
          <TextField
            value={formValues.email ?? ""}
            onChange={handleTextFieldChange}
            name="email"
            label="Email"
            error={!!formErrors.email}
            helperText={formErrors.email ?? " "}
            fullWidth
            variant="standard"
          />
          <TextField
            value={formValues.password ?? ""}
            onChange={handleTextFieldChange}
            name="password"
            label="Password"
            error={!!formErrors.password}
            helperText={formErrors.password ?? " "}
            fullWidth
            variant="standard"
          />
        </Stack>
        {user?.role === "labmanager" ? (
          <TextField
            sx={{ marginBottom: 5 }}
            label="Curriculum"
            variant="standard"
            fullWidth
            multiline
          />
        ) : (
          <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ marginY: 5 }}
        >
          <TextField
            select
            variant="standard"
            value={formValues.role ?? ""}
            onChange={handleSelectFieldChange}
            name="role"
            label="Role"
            error={!!formErrors.role}
            helperText={formErrors.role ?? " "}
            fullWidth
          >
            {/* <MenuItem value="admin">admin</MenuItem> */}
            <MenuItem value="labmanager">labmanager</MenuItem>
            <MenuItem value="researcher">researcher</MenuItem>

          </TextField>
          <TextField
            select
            variant="standard"
            value={formValues.department ?? ""}
            onChange={handleSelectFieldChange}
            name="department"
            label="Department"
            error={!!formErrors.department}
            helperText={formErrors.department ?? " "}
            fullWidth
          >
            {departments.map((department) => (
                  <MenuItem key={department.id} value={department.name}>
                    {department.name}
                  </MenuItem>
                ))}

          </TextField>
          </Stack>
        )}
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
