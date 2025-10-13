import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatCard from "../components/StatCard";
import { Button, Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import CustomDatePicker from "../components/CustomDataPicker";
import PieChartCard from "../components/PieChartCard";

export default function LabManagerHome() {
  return (
    <div className="flex flex-col items-center space-y-6 px-6 pb-10 mt-8 md:mt-0">
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Inventory
      </Typography>

      {/* Stat Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr 1fr",
          },
          gap: {
            xs: "16px",
            sm: "20px",
            md: "2vw",
            lg: "3vw",
            xl: "4vw",
          },
          width: "100%",
        }}
      >
       
      </Box>

    </Box>
            </div>
          
  );
}
