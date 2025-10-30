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
import ConstructionIcon from '@mui/icons-material/Construction';
import NotificationsIcon from "@mui/icons-material/Notifications";

const mainListItems = [
  { text: "Inventory", icon: <StorageIcon />, path: "/researcher-dashboard" },
  { text: "Requests", icon: <NotificationsIcon />, path: "/researcher-dashboard/requests" },
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
    if (target === "/researcher-dashboard") return current === target;
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
