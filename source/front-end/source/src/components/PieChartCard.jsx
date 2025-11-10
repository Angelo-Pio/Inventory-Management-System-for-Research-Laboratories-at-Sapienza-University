import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { PieChart } from "@mui/x-charts/PieChart";
import Typography from "@mui/material/Typography";

export default function PieChartCard({ title, value }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>

        <PieChart
          series={[
            {
              innerRadius: 50,
              outerRadius: 100,
              arcLabel: "value",
              data: value,
            },
          ]}
          width={200}
          height={200}
        />
      </CardContent>
    </Card>
  );
}
