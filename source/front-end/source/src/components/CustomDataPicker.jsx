import React from "react";
import dayjs from "dayjs";
import Button from "@mui/material/Button";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import {
  useParsedFormat,
  usePickerContext,
  useSplitFieldProps,
} from "@mui/x-date-pickers";
import { useForkRef } from "@mui/material/utils";

/* ButtonField stays the same but uses forwarded props already provided by MUI internals */
function ButtonField(props) {
  const { forwardedProps } = useSplitFieldProps(props, "date");
  const pickerContext = usePickerContext();
  const handleRef = useForkRef(pickerContext.triggerRef, pickerContext.rootRef);
  const parsedFormat = useParsedFormat();

  const {
    slotProps,
    inputRef,
    enableAccessibleFieldDOMStructure,
    ...buttonProps
  } = forwardedProps;

  const valueStr =
    pickerContext.value == null
      ? parsedFormat
      : pickerContext.value.format(pickerContext.fieldFormat);

  return (
    <Button
      {...buttonProps}
      variant="outlined"
      ref={handleRef}
      size="small"
      startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
      className="w-full"
      onClick={() => pickerContext.setOpen((prev) => !prev)}
    >
      {pickerContext.label ?? valueStr}
    </Button>
  );
}

/**
 * Controlled CustomDatePicker.
 * Props:
 *  - value: dayjs instance or null
 *  - onChange: function(newValue: dayjs|null)
 *  - label (optional)
 */
export default function CustomDatePicker({ value, onChange, label }) {
  // default fallback value if none passed
  const fallback = dayjs("2025-10-01");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ?? fallback}
        label={value == null ? null : (label ?? value.format("MMM DD, YYYY"))}
        onChange={(newValue) => onChange?.(newValue)}
        slots={{ field: ButtonField }}
        slotProps={{
          nextIconButton: { size: "small" },
          previousIconButton: { size: "small" },
        }}
        views={["day", "month", "year"]}
      />
    </LocalizationProvider>
  );
}
