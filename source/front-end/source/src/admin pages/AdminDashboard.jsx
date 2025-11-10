import { CssBaseline, alpha, Box } from "@mui/material";

import SideMenu from "../components/SideMenu";
import AppTheme from "../themes/AppTheme";
import {
  chartsCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../themes/customization";
import { Outlet } from "react-router-dom";

const xThemeComponents = {
  ...chartsCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <div className="flex min-h-screen bg-gray-50">
        <SideMenu />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Box
            component="main"
            className="flex-1 overflow-auto pt-2"
            sx={(theme) => ({
              backgroundColor: `rgba(${theme.vars.palette.background.defaultChannel} / 1)`,
            })}
          >
            <Outlet />
          </Box>
        </div>
      </div>
    </AppTheme>
  );
}
