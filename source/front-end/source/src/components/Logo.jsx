import Box from '@mui/material/Box';
import logoImage from '../assets/logo.png';

export default function Logo() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'white',
                typography: 'h6',
            }}
        >
            <img src={logoImage} alt="" className='w-44 object-contain' />
        </Box>
    );
}