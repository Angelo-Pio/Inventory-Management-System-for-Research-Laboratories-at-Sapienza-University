
import { useAuth } from './AuthContext';

import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Logo from './Logo';
import MenuContentLabManager from '../lab-manager pages/MenuContentLabManager';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {

    const { user, department } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          px: 1.5,
        }}
      >
        <Logo />
        
      </Box>
      <Box 
        sx={{
          textAlign: 'center',
        }}
      >
        {department.name}
      </Box>
      <Divider />

      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        <Box 
        sx={{
          textAlign: 'center',
          mt: 1,
        }}
      >
        {user.role === 'admin' ? 'Admin' : user.role === 'labmanager' ? 'Lab Manager' : 'Researcher'}
      </Box>
      {
        user.role === 'admin' ? {/* Admin Menu - to be implemented */} : user.role === 'labmanager' ? <MenuContentLabManager /> : {/* Researcher Menu - to be implemented */} 
      }
        
      </Box>

      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          alt={`${user.name} ${user.surname}`}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            {user.name} {user.surname}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user.email}
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}
