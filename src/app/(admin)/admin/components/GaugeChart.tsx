// components/GaugeChart.tsx
"use client";

import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, ChartTypeRegistry } from "chart.js";
import "chartjs-gauge";
import React from "react";

declare module "chart.js" {
  interface ChartTypeRegistry {
    gauge: ChartTypeRegistry["doughnut"];
  }
}

interface GaugeChartProps {
  data: any;
  options: any;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ data, options }) => {
  return <Chart type="gauge" data={data} options={options} />;
};

export default GaugeChart;
