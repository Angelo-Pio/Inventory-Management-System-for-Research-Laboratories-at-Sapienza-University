import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const PageContentHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));


const PageHeaderToolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  // Ensure the toolbar is always on the right side, even after wrapping
  marginLeft: 'auto',
}));

export default function PageContainer(props) {
  const { children, title, actions = null } = props;

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ flex: 1, my: 2 }} spacing={2}>
        <Stack>
          
          <PageContentHeader>
            {title ? <Typography variant="h4">{title}</Typography> : null}
            <PageHeaderToolbar>{actions}</PageHeaderToolbar>
          </PageContentHeader>
        </Stack>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
}
