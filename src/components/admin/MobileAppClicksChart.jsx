import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

/**
 * Accepts series from GET /admin/mobile-app-clicks/chart: { label, count }[]
 * Or legacy format: { label, ios, android }[]
 */
const MobileAppClicksChart = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const hasCountFormat = data?.length && "count" in (data[0] ?? {});

  useEffect(() => {
    if (!data?.length || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = data.map((d) => d.label);

    const datasets = hasCountFormat
      ? [
          {
            label: "Clicks",
            data: data.map((d) => d.count ?? 0),
            borderColor: "#00A19C",
            backgroundColor: "rgba(0,161,156,0.15)",
            fill: true,
            tension: 0.3,
          },
        ]
      : [
          {
            label: "App Store (iOS)",
            data: data.map((d) => d.ios ?? 0),
            borderColor: "#007AFF",
            backgroundColor: "rgba(0,122,255,0.15)",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Play Store (Android)",
            data: data.map((d) => d.android ?? 0),
            borderColor: "#34C759",
            backgroundColor: "rgba(52,199,89,0.15)",
            fill: true,
            tension: 0.3,
          },
        ];

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            mode: "index",
            callbacks: {
              afterBody: (items) => {
                const total = items.reduce((s, i) => s + (i.raw ?? 0), 0);
                return `Total: ${total}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 0, font: { size: 11 } },
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
  }, [data, hasCountFormat]);

  if (!data?.length) return null;

  return (
    <div className="w-full h-full min-h-[280px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default MobileAppClicksChart;
