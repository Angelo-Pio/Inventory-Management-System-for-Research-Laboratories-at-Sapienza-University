import React, { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { inputsCustomizations } from "./customization/inputs";
import { dataDisplayCustomizations } from "./customization/dataDisplay";
import { feedbackCustomizations } from "./customization/feedback";
import { navigationCustomizations } from "./customization/navigation";
import { surfacesCustomizations } from "./customization/surface";
import { colorSchemes, typography, shadows, shape } from "./themePrimitives";

export default function AppTheme({ children, disableCustomTheme, themeComponents }) {
  const theme = useMemo(() => {
    if (disableCustomTheme) return {};

    return createTheme({
      cssVariables: {
        colorSchemeSelector: "data-mui-color-scheme",
        cssVarPrefix: "template",
      },
      colorSchemes,
      typography,
      shadows,
      shape,
      components: {
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
        ...themeComponents,
      },
    });
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <>{children}</>;
  }

  return <ThemeProvider theme={theme} disableTransitionOnChange>{children}</ThemeProvider>;
}
