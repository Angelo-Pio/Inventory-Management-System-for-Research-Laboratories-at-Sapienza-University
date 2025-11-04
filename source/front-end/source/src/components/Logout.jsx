import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

// ---- New imports to inline the MenuButton ----
import Badge, { badgeClasses } from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { logout } from '../services/authServices'
import { useNavigate } from 'react-router-dom';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

export default function Logout() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const navigate = useNavigate?.() ?? null
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

const handleLogout = async () => {
    // close the menu immediately for better UX
    handleClose();
    setLogoutError(null);
    setLoggingOut(true);

    try {
      const result = await logout(); // your provided function
      setLoggingOut(false);

      if (result?.success) {
        // Option A: navigate to login route (recommended if you use react-router)
        if (navigate) {
          navigate('/login', { replace: true });
          return;
        }
        // Option B: reload the page (simple fallback)
        window.location.href = '/login'; // or window.location.reload();
      } else {
        // show an error message (you can replace this with a toast)
        setLogoutError(result?.error || 'Logout failed');
        console.error('Logout failed:', result);
      }
    } catch (err) {
      setLoggingOut(false);
      setLogoutError('Network error occurred');
      console.error('Logout error:', err);
    }
  };
  
  return (
    <React.Fragment>
      {/* Inlined MenuButton: Badge + IconButton */}
      <Badge
        color="error"
        variant="dot"
        invisible /* no showBadge passed, so the badge is hidden */
        sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
      >
        <IconButton
          size="small"
          aria-label="Open menu"
          onClick={handleClick}
          sx={{ borderColor: 'transparent' }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Badge>

      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: '8\px',
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .${dividerClasses.root}`]: {
            margin: '4px -4px',
          },
        }}
      >
        
        <MenuItem
          onClick={handleLogout}
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0,
            },
          }}
        >
          <ListItemText>Logout</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
