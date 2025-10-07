import { getUserById } from "../services/adminServices";
import { useAuth } from "../components/AuthContext";

import { CssBaseline, alpha, Box } from "@mui/material";
import MainGrid from "../components/MainGrid";
import SideMenu from "../components/SideMenu";
import AppTheme from "../themes/AppTheme";
import {
  chartsCustomizations,
  // dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../themes/customization";
import { useEffect } from "react";

const xThemeComponents = {
  ...chartsCustomizations,
  // ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};


export default function Dashboard(props) {

  const { user, setUser } = useAuth();
//Spostarlo in login
useEffect(() => {
  const fetchUserData = async () => {
    if (user.id) {
      try {
        const userData = await getUserById(user.id);
        
        if (userData.data) {
          setUser(prev => { const updatedUser = { ...prev, name: userData.data.name, surname: userData.data.surname, departmentId: userData.data.departmentId }; console.log("User data after fetch attempt:", updatedUser); return updatedUser; });
        }
        
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
  };

  fetchUserData();
  
  
}, [user.id, setUser]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      {/* Main container with flex */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Left side menu */}
        <SideMenu user={user} />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top navigation bar */}
          {/* <AppNavbar /> */}

          {/* Main content */}
          <Box
            component="main"
            className="flex-1 overflow-auto pt-2"
            sx={(theme) => ({
              backgroundColor: `rgba(${theme.vars.palette.background.defaultChannel} / 1)`,
            })}
          >
            <div className="flex flex-col items-center space-y-6 px-6 pb-10 mt-8 md:mt-0">
              {/* <Header /> */}
              <MainGrid />
            </div>
          </Box>
        </div>
      </div>
    </AppTheme>
  );
}