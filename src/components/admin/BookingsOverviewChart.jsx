import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const BookingsOverviewChart = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = data.map((d) => d.label);
    const datasetConfig = [
      { key: "pending", label: "Pending", color: "#facc15" },
      { key: "completed", label: "Completed", color: "#22c55e" },
      { key: "cancelled", label: "Cancelled", color: "#ef4444" },
      { key: "total", label: "Total", color: "#3b82f6" },
    ];

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: datasetConfig.map(({ key, label, color }) => ({
          label,
          data: data.map((d) => d[key] ?? 0),
          borderColor: color,
          backgroundColor: `${color}20`,
          fill: false,
          tension: 0.2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "top" },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
        },
        animation: { duration: 400 },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[320px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default BookingsOverviewChart;
