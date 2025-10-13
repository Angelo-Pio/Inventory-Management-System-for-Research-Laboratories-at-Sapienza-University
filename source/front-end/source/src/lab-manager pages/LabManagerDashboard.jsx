import { getUserById } from "../services/adminServices";
import { useAuth } from "../components/AuthContext";

import { CssBaseline, alpha, Box } from "@mui/material";
import MainGrid from "./LabManagerHome";
import SideMenu from "../components/SideMenu";
import AppTheme from "../themes/AppTheme";
import {
  chartsCustomizations,
  // dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../themes/customization";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const xThemeComponents = {
  ...chartsCustomizations,
  // ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};


export default function Dashboard(props) {



  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      {/* Main container with flex */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Left side menu */}
        <SideMenu  />

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