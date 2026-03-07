import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function AdminReports() {
  const data = {
    labels: ["Users", "Recruiters", "Jobs", "Applications"],
    datasets: [
      {
        label: "System Report",
        data: [120, 25, 18, 90],
      },
    ],
  };

  return (
    <div className="container" style={{ marginTop: "90px" }}>
      <h4>System Reports</h4>
      <p className="text-muted">Overall platform statistics</p>

      <div className="card p-4">
        <Bar data={data} />
      </div>
    </div>
  );
}

export default AdminReports;
