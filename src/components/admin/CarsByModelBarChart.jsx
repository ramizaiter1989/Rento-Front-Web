import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const TEAL = "#00A19C";

const CarsByModelBarChart = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Cars",
            data: data.map((d) => d.count),
            backgroundColor: TEAL,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => "Cars: " + ctx.raw,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 0, font: { size: 12 } },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 12 } },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
        },
        animation: { duration: 600 },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  if (!data?.length) return null;

  return (
    <div className="w-full h-full min-h-[280px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CarsByModelBarChart;
