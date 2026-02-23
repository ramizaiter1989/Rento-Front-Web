import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

/**
 * Pie chart for Play Store vs App Store clicks.
 * @param {Object} byStore - { playstore: number, appstore: number }
 */
const MobileAppClicksPieChart = ({ byStore }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const playstore = byStore?.playstore ?? 0;
  const appstore = byStore?.appstore ?? 0;
  const total = playstore + appstore;

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Play Store", "App Store"],
        datasets: [
          {
            data: [playstore, appstore],
            backgroundColor: ["#34C759", "#007AFF"],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.raw ?? 0;
                const pct = total > 0 ? ((v / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${v} (${pct}%)`;
              },
            },
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
  }, [playstore, appstore]);

  return (
    <div className="w-full h-full min-h-[200px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default MobileAppClicksPieChart;
