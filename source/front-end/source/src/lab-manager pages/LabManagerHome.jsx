import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatCard from "../components/StatCard";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Button, Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import CustomDatePicker from "../components/CustomDataPicker";
import { downloadReport } from "../services/labManagerServices";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import {
  getTotalRestocked,
  getMostRestockedMaterial,
} from "../services/labManagerServices";
import { summarizeRequests } from "../services/dashboardServices";

import dayjs from "dayjs";

export default function LabManagerHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const { user } = useAuth();

  const [requestsData, setRequestsData] = useState([]);
  const [totalRestocked, setTotalRestocked] = useState(0);
  const [mostRestocked, setMostRestocked] = useState("");
  const [loading, setLoading] = useState(true);
  const departmentId = user.departmentId;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          requestsResponse,
          totalRestockedResponse,
          mostRestockedResponse,
        ] = await Promise.all([
          summarizeRequests(departmentId),
          getTotalRestocked(departmentId),
          getMostRestockedMaterial(departmentId),
        ]);

        setRequestsData(requestsResponse);
        setTotalRestocked(totalRestockedResponse.data);
        setMostRestocked(mostRestockedResponse.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [departmentId]);

  useEffect(() => {
    console.log(totalRestocked);
    console.log(mostRestocked);
  }, [requestsData, totalRestocked, mostRestocked]);

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const startStr = startDate.format("YYYY-MM-DD[T]HH:mm:ss");
    const endStr = endDate.format("YYYY-MM-DD[T]HH:mm:ss");
    try {
      setIsLoading(true);

      const result = await downloadReport(user.departmentId, startStr, endStr);

      if (result.success) {
      } else {
        alert(`Failed to generate report: ${result.error}`);
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      alert("Unexpected error while downloading report.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 px-6 pb-10 mt-8">
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Typography component="h2" variant="h4" sx={{ mb: 2 }}>
          Overview
        </Typography>

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
          {requestsData.map((card, index) => (
            <StatCard {...card} key={index} />
          ))}
        </Box>

        <Stack
          sx={{ marginY: 5 }}
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }} key={1}>
            <CardContent>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Total Materials Restocked
              </Typography>

              <Typography variant="h4">{totalRestocked}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }} key={2}>
            <CardContent>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Most Restocked Material
              </Typography>

              <Typography variant="h4">{mostRestocked.name}</Typography>
            </CardContent>
          </Card>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            width: "100%",
          }}
        >
          <Typography component="h2" variant="h4">
            Reports
          </Typography>
          <Stack
            direction="row"
            sx={{
              display: { md: "flex" },
              width: "100%",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              maxWidth: { sm: "100%", md: "1700px" },
              py: 1.5,
            }}
            spacing={2}
          >
            <CustomDatePicker value={startDate} onChange={setStartDate} />
            <CustomDatePicker value={endDate} onChange={setEndDate} />
          </Stack>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button onClick={handleDownload} variant="outlined">
              New Report
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
