import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  trendValues,
  labels,
  uniqueId,
}) {
  const theme = useTheme();

  const trendColors = {
    up: theme.palette.success.dark,
    down: theme.palette.error.dark,
    neutral: theme.palette.grey[700],
  };

  const labelColors = { up: "success", down: "error", neutral: "default" };
  const chartColor = trendColors[trend];
  const chipColor = labelColors[trend];
  const gradientId = uniqueId || `area-gradient-${value}`;

  return (
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>

        <Stack direction="column" spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">{value}</Typography>
            <Chip size="small" color={chipColor} label={trendValues} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {interval}
          </Typography>

          <Box sx={{ width: "100%", height: 50 }}>
            <SparkLineChart
              color={chartColor}
              data={data}
              area
              showHighlight
              showTooltip
              xAxis={{ scaleType: "band", data: labels }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#${gradientId})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={gradientId} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
