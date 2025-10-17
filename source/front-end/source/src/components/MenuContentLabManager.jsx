import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import StorageIcon from "@mui/icons-material/Storage";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import NotificationsIcon from "@mui/icons-material/Notifications";

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, path: "/labmanager-dashboard" },
  { text: "Inventory", icon: <StorageIcon />, path: "/labmanager-dashboard/inventory" },
  { text: "Employees", icon: <PeopleRoundedIcon />, path: "/labmanager-dashboard/employees" },
  { text: "Alerts", icon: <NotificationsIcon />, path: "/labmanager-dashboard/alerts" },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Normalize trailing slashes for comparison
  const normalize = (p) => (p || "").replace(/\/+$/, "") || "/";

  const current = normalize(location.pathname);

  const isSelected = (path) => {
    const target = normalize(path);
    // Home should match exactly the base path
    if (target === "/labmanager-dashboard") return current === target;
    // For other items, we'll treat a prefix match as selected so deeper pages remain highlighted
    return current === target || current.startsWith(target + "/");
  };

  return (
    <Stack className="flex-1 p-2 justify-between">
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.text} disablePadding className="block">
            <ListItemButton
              selected={isSelected(item.path)}
              onClick={() => navigate(item.path)}
              aria-current={isSelected(item.path) ? "page" : undefined}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
