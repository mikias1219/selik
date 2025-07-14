"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import GaugeComponent from "react-gauge-component";
import { Movie, Game, Music, Ebook, Poster } from "../types";
import GenericTable from "./GenericTable";

// Dynamic imports for Chart.js components to prevent SSR issues
const Pie = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
});
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});
const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  { ssr: false }
);
const Radar = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Radar),
  { ssr: false }
);

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  mediaType: string;
  revenue: number;
  date: string;
  id: string;
}

interface StatsViewProps {
  movies: Movie[];
  games: Game[];
  music: Music[];
  ebooks: Ebook[];
  posters: Poster[];
  sales?: SalesData[];
  viewMode: "table" | "cards";
}

const getCardGradient = (label: string) => {
  const gradients: Record<string, string> = {
    Movies: "from-purple-600 via-purple-500 to-purple-400",
    Games: "from-blue-600 via-blue-500 to-blue-400",
    Music: "from-green-600 via-green-500 to-green-400",
    Ebooks: "from-orange-600 via-orange-500 to-orange-400",
    Posters: "from-red-600 via-red-500 to-red-400",
    "Total Revenue": "from-cinema-purple via-purple-600 to-purple-700",
  };
  return (
    gradients[label] || "from-cinema-gray via-cinema-gray/90 to-cinema-gray/80"
  );
};

const DashboardCard = ({
  icon,
  label,
  value,
  delay,
}: {
  icon: string;
  label: string;
  value: string | number;
  delay: number;
}) => (
  <motion.div
    className={`bg-gradient-to-br ${getCardGradient(
      label
    )} backdrop-blur-md rounded-2xl p-5 border border-purple-500/10 hover:border-cinema-purple/60 shadow-2xl`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}
  >
    <div className="flex items-center space-x-4">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-sm uppercase tracking-wide text-gray-200">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function StatsView({
  movies,
  games,
  music,
  ebooks,
  posters,
  sales = [],
  viewMode,
}: StatsViewProps) {
  const [showModal, setShowModal] = useState(false);

  const componentCounts = [
    { label: "Movies", count: movies.length, icon: "🎬" },
    { label: "Games", count: games.length, icon: "🎮" },
    { label: "Music", count: music.length, icon: "🎵" },
    { label: "Ebooks", count: ebooks.length, icon: "📚" },
    { label: "Posters", count: posters.length, icon: "🖼️" },
  ];

  const defaultSales: SalesData[] = [
    { id: "s1", mediaType: "movies", revenue: 5000, date: "2025-06-01" },
    { id: "s2", mediaType: "games", revenue: 3000, date: "2025-06-01" },
    { id: "s3", mediaType: "music", revenue: 1000, date: "2025-06-01" },
    { id: "s4", mediaType: "ebooks", revenue: 2000, date: "2025-06-01" },
    { id: "s5", mediaType: "posters", revenue: 500, date: "2025-06-01" },
    { id: "s6", mediaType: "movies", revenue: 6000, date: "2025-06-15" },
    { id: "s7", mediaType: "games", revenue: 3500, date: "2025-06-15" },
    { id: "s8", mediaType: "music", revenue: 1200, date: "2025-06-15" },
    { id: "s9", mediaType: "ebooks", revenue: 2500, date: "2025-06-15" },
    { id: "s10", mediaType: "posters", revenue: 700, date: "2025-06-15" },
  ];

  const salesData = sales.length > 0 ? sales : defaultSales;
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0);
  const revenueTarget = 20000;

  const salesByType = salesData.reduce((acc, sale) => {
    acc[sale.mediaType] = (acc[sale.mediaType] || 0) + sale.revenue;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = {
    labels: Object.keys(salesByType),
    datasets: [
      {
        data: Object.values(salesByType),
        backgroundColor: [
          "#A855F7",
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
        ],
        borderColor: "#1F2937",
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(salesByType),
    datasets: [
      {
        label: "Revenue ($)",
        data: Object.values(salesByType),
        backgroundColor: "#A855F7",
        borderColor: "#7C3AED",
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: Object.keys(salesByType),
    datasets: [
      {
        data: Object.values(salesByType),
        backgroundColor: [
          "#A855F7",
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
        ],
        borderColor: "#1F2937",
        borderWidth: 2,
      },
    ],
    plugins: [
      {
        id: "centerText",
        beforeDraw: (chart: any) => {
          const { ctx, width, height } = chart;
          ctx.save();
          ctx.font = "bold 20px Cinematic";
          ctx.fillStyle = "#D1D5DB";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            `$${totalRevenue.toLocaleString()}`,
            width / 2,
            height / 2
          );
          ctx.restore();
        },
      },
    ],
  };

  const dates = [...new Set(salesData.map((sale) => sale.date))].sort();
  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: "Total Revenue ($)",
        data: dates.map((date) =>
          salesData
            .filter((sale) => sale.date === date)
            .reduce((sum, sale) => sum + sale.revenue, 0)
        ),
        borderColor: "#A855F7",
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const mediaTypes = [...new Set(salesData.map((sale) => sale.mediaType))];
  const stackedBarChartData = {
    labels: dates,
    datasets: mediaTypes.map((type, index) => ({
      label: type,
      data: dates.map((date) =>
        salesData
          .filter((sale) => sale.date === date && sale.mediaType === type)
          .reduce((sum, sale) => sum + sale.revenue, 0)
      ),
      backgroundColor: ["#A855F7", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"][
        index % 5
      ],
      borderColor: "#1F2937",
      borderWidth: 1,
    })),
  };

  const radarChartData = {
    labels: componentCounts.map((item) => item.label),
    datasets: [
      {
        label: "Component Counts",
        data: componentCounts.map((item) => item.count),
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        borderColor: "#A855F7",
        pointBackgroundColor: "#A855F7",
        pointBorderColor: "#1F2937",
        pointHoverBackgroundColor: "#1F2937",
        pointHoverBorderColor: "#A855F7",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#D1D5DB", font: { family: "Cinematic" } } },
      tooltip: { backgroundColor: "#1F2937", titleColor: "#A855F7" },
    },
    scales: {
      x: { ticks: { color: "#D1D5DB" }, grid: { color: "#374151" } },
      y: { ticks: { color: "#D1D5DB" }, grid: { color: "#374151" } },
    },
  };

  const radarChartOptions = {
    ...chartOptions,
    scales: {
      r: {
        ticks: { color: "#D1D5DB" },
        grid: { color: "#374151" },
        angleLines: { color: "#374151" },
        pointLabels: { color: "#D1D5DB", font: { family: "Cinematic" } },
      },
    },
  };

  const gaugeChartConfig = {
    value: totalRevenue,
    minValue: 0,
    maxValue: revenueTarget,
    majorTicks: [0, revenueTarget * 0.33, revenueTarget * 0.66, revenueTarget],
    highlights: [
      { from: 0, to: revenueTarget * 0.33, color: "#EF4444" },
      {
        from: revenueTarget * 0.33,
        to: revenueTarget * 0.66,
        color: "#F59E0B",
      },
      { from: revenueTarget * 0.66, to: revenueTarget, color: "#10B981" },
    ],
    colors: {
      needle: "#A855F7",
      valueLabel: "#D1D5DB",
    },
    valueLabel: {
      display: true,
      fontFamily: "Cinematic",
      fontSize: 16,
      formatter: (value: number) => `$${value.toLocaleString()}`,
    },
    arc: {
      width: 0.3,
    },
  };

  const salesColumns = [
    { header: "Media Type", accessor: "mediaType" },
    { header: "Revenue ($)", accessor: "revenue" },
    { header: "Date", accessor: "date" },
  ];

  if (viewMode === "table") {
    return (
      <>
        <GenericTable
          data={salesData}
          columns={salesColumns}
          type="sales"
          onEdit={() => {}}
          onDelete={() => {}}
          onPreview={() => setShowModal(true)}
        />

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center overflow-auto">
            <div className="bg-cinema-gray max-w-6xl w-full m-4 p-8 rounded-xl shadow-2xl relative">
              <button
                className="absolute top-4 right-4 text-cinema-purple hover:text-white text-2xl"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <h3 className="text-cinema-purple font-cinematic mb-2">
                    Sales Pie
                  </h3>
                  <Pie
                    data={pieChartData}
                    options={chartOptions}
                    aria-label="Sales distribution pie chart"
                  />
                </div>
                <div className="h-64">
                  <h3 className="text-cinema-purple font-cinematic mb-2">
                    Sales Bar
                  </h3>
                  <Bar
                    data={barChartData}
                    options={chartOptions}
                    aria-label="Revenue per type bar chart"
                  />
                </div>
                <div className="h-64">
                  <h3 className="text-cinema-purple font-cinematic mb-2">
                    Sales Doughnut
                  </h3>
                  <Doughnut
                    data={doughnutChartData}
                    options={chartOptions}
                    aria-label="Sales breakdown doughnut chart"
                  />
                </div>
                <div className="h-64">
                  <h3 className="text-cinema-purple font-cinematic mb-2">
                    Revenue Over Time
                  </h3>
                  <Line
                    data={lineChartData}
                    options={chartOptions}
                    aria-label="Revenue over time line chart"
                  />
                </div>
                <div className="h-64">
                  <h3 className="text-cinema-purple font-cinematic mb-2">
                    Stacked Revenue
                  </h3>
                  <Bar
                    data={stackedBarChartData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: { stacked: true },
                        y: { stacked: true },
                      },
                    }}
                    aria-label="Revenue by type over time stacked bar chart"
                  />
                </div>
                <div className="h-64">
                  <h3 className="text-cinema-purple font-cinematic mb-2">
                    Component Distribution
                  </h3>
                  <Radar
                    data={radarChartData}
                    options={radarChartOptions}
                    aria-label="Component distribution radar chart"
                  />
                </div>
                <div className="h-64 lg:col-span-2 flex justify-center">
                  <div className="w-64">
                    <h3 className="text-cinema-purple font-cinematic mb-2 text-center">
                      Revenue Progress
                    </h3>
                    <GaugeComponent
                      id="revenue-gauge-modal"
                      {...gaugeChartConfig}
                      aria-label="Revenue progress gauge"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {componentCounts.map((item, index) => (
          <DashboardCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.count}
            delay={index * 0.1}
          />
        ))}
        <DashboardCard
          icon="💰"
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          delay={0.6}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          className="bg-cinema-gray/80 backdrop-blur-md rounded-lg p-6 border border-purple-400/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-cinematic text-cinema-purple mb-4">
            Sales Distribution (Pie)
          </h2>
          <div className="h-64">
            <Pie
              data={pieChartData}
              options={chartOptions}
              aria-label="Sales distribution pie chart"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-cinema-gray/80 backdrop-blur-md rounded-lg p-6 border border-purple-400/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-cinematic text-cinema-purple mb-4">
            Revenue per Type (Bar)
          </h2>
          <div className="h-64">
            <Bar
              data={barChartData}
              options={chartOptions}
              aria-label="Revenue per type bar chart"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-cinema-gray/80 backdrop-blur-md rounded-lg p-6 border border-purple-400/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-lg font-cinematic text-cinema-purple mb-4">
            Sales Breakdown (Doughnut)
          </h2>
          <div className="h-64">
            <Doughnut
              data={doughnutChartData}
              options={chartOptions}
              aria-label="Sales breakdown doughnut chart"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-cinema-gray/80 backdrop-blur-md rounded-lg p-6 border border-purple-400/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h2 className="text-lg font-cinematic text-cinema-purple mb-4">
            Revenue Over Time (Line)
          </h2>
          <div className="h-64">
            <Line
              data={lineChartData}
              options={chartOptions}
              aria-label="Revenue over time line chart"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-cinema-gray/80 backdrop-blur-md rounded-lg p-6 border border-purple-400/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <h2 className="text-lg font-cinematic text-cinema-purple mb-4">
            Revenue by Type Over Time (Stacked Bar)
          </h2>
          <div className="h-64">
            <Bar
              data={stackedBarChartData}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: { stacked: true },
                  y: { stacked: true },
                },
              }}
              aria-label="Revenue by type over time stacked bar chart"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-cinema-gray/80 backdrop-blur-md rounded-lg p-6 border border-purple-400/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <h2 className="text-lg font-cinematic text-cinema-purple mb-4">
            Component Distribution (Radar)
          </h2>
          <div className="h-64">
            <Radar
              data={radarChartData}
              options={radarChartOptions}
              aria-label="Component distribution radar chart"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-cinema-gray/80 backdrop-blur-md rounded-lg p-6 border border-purple-400/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <h2 className="text-lg font-cinematic text-cinema-purple mb-4">
            Revenue Progress (Gauge)
          </h2>
          <div className="h-64 flex justify-center">
            <div className="w-48">
              <GaugeComponent
                id="revenue-gauge"
                {...gaugeChartConfig}
                aria-label="Revenue progress gauge"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
