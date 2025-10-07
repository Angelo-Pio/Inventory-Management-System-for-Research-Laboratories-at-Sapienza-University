import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import StorageIcon from '@mui/icons-material/Storage';
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import NotificationsIcon from '@mui/icons-material/Notifications';


const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon /> },
  { text: "Inventory", icon: <StorageIcon /> },
  { text: "Employees", icon: <PeopleRoundedIcon /> },
  { text: "Alerts", icon: <NotificationsIcon /> },
];

// const secondaryListItems = [
//   { text: "Settings", icon: <SettingsRoundedIcon /> },
  
// ];

export default function MenuContent() {
  return (
    <Stack className="flex-1 p-2 justify-between">
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding className="block">
            <ListItemButton selected={index === 0}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding className="block">
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Stack>
  );
}
