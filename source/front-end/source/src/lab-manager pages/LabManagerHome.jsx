import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatCard from "../components/StatCard";
import { Button, Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import CustomDatePicker from "../components/CustomDataPicker";
import { downloadReport } from "../services/labManagerServices";
import { useEffect, useState } from "react";
import { useAuth } from '../components/AuthContext'; 
import {getRequestsGraphData,getTotalRestocked,getMostRestockedMaterial} from "../services/labManagerServices"

import dayjs from "dayjs";


const pieData = [
  { id: 0, value: 10, label: "PC" },
  { id: 1, value: 15, label: "Arduino" },
  { id: 2, value: 20, label: "GPU" },
];

const data = [
  {
    title: "Total Requests",
    value: "14k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Low Stock Requests",
    value: "325",
    interval: "Last 30 days",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
  {
    title: "Damahged Requests",
    value: "200k",
    interval: "Last 30 days",
    trend: "neutral",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510,
      530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
];

export default function LabManagerHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(dayjs("2025-10-01"));
  const [endDate, setEndDate] = useState(dayjs("2025-10-01"));
  const { user } = useAuth();

const [requestsData, setRequestsData] = useState(null);
  const [totalRestocked, setTotalRestocked] = useState(null);
  const [mostRestocked, setMostRestocked] = useState(null);
  const [loading, setLoading] = useState(true);
  const departmentId = user.departmentId

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          requestsResponse,
          totalRestockedResponse,
          mostRestockedResponse
        ] = await Promise.all([
          getRequestsGraphData(departmentId),
          getTotalRestocked(departmentId),
          getMostRestockedMaterial(departmentId),
        ]);

        setRequestsData(requestsResponse);
        setTotalRestocked(totalRestockedResponse);
        setMostRestocked(mostRestockedResponse);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [departmentId]);

  useEffect(()=>{
    console.log(requestsData);
    console.log(totalRestocked);
    console.log(mostRestocked);
    
  },[requestsData, totalRestocked, mostRestocked])

  const handleDownload = async () => {
    // simple validation
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    // format dates how your backend expects them. Example: YYYY-MM-DD
    const startStr = startDate.format("YYYY-MM-DD[T]HH:mm:ss")
    const endStr = endDate.format("YYYY-MM-DD[T]HH:mm:ss")
    try {
      setIsLoading(true);

      
      
      const result = await downloadReport(user.departmentId, startStr, endStr);

      

      if (result.success) {
        // you already trigger the download in downloadReport, optionally notify
        alert("Report downloaded successfully.");
      } else {
        alert(`Failed to generate report: ${result.error}`);
      }
    } catch (err) {
      setIsLoading(false); // immediate fallback if something thrown
      console.error(err);
      alert("Unexpected error while downloading report.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 px-6 pb-10 mt-8">
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        {/* cards */}
        <Typography component="h2" variant="h4" sx={{ mb: 2 }}>
          Overview
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
          {data.map((card, index) => (
            <StatCard {...card} key={index} />
          ))}
        </Box>

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
          {/* <SessionsChart />
        <PageViewsBarChart /> */}
        </Box>
      </Box>
    </div>
  );
}
