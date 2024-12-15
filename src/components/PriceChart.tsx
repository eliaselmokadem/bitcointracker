// src/components/PriceChart.tsx
import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { modalStyles } from "../styles/HomeScreen.styles";
import { BitcoinPrice } from "../types/BitcoinPrice";

interface PriceChartProps {
  filteredPrices: BitcoinPrice[];
  theme: any; // Adjust the type based on your actual theme structure
  SCREEN_WIDTH: number;
  CHART_HEIGHT: number;
  getPercentageColor: (percentage: number) => string;
  formatDate: (date: string) => string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  filteredPrices,
  theme,
  SCREEN_WIDTH,
  CHART_HEIGHT,
  getPercentageColor,
  formatDate,
}) => {
  if (filteredPrices.length === 0) return null;

  const chartData = [...filteredPrices].reverse();
  const data = {
    labels: chartData.map((price) => formatDate(price.Date)),
    datasets: [
      {
        data: chartData.map((price) => price.Price),
        color: (opacity = 1) => `rgba(46, 119, 208, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const latestPrice = chartData[0]?.Price ?? 0;
  const previousPrice = chartData[1]?.Price ?? 0;
  const priceChange =
    previousPrice !== 0
      ? ((latestPrice - previousPrice) / previousPrice) * 100
      : 0;

  return (
    <View style={modalStyles.chartContainer}>
      <View style={modalStyles.chartHeader}>
        <View>
          <Text style={[modalStyles.currentPrice, { color: theme.text }]}>
            ${latestPrice.toLocaleString()}
          </Text>
          <Text
            style={[
              modalStyles.priceChange,
              { color: getPercentageColor(priceChange) },
            ]}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </Text>
        </View>
      </View>
      <LineChart
        data={data}
        width={SCREEN_WIDTH - 32}
        height={CHART_HEIGHT}
        chartConfig={{
          backgroundColor: "transparent",
          backgroundGradientFrom: "transparent",
          backgroundGradientTo: "transparent",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(46, 119, 208, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForLabels: {
            fontSize: 10,
          },
        }}
        bezier
        style={modalStyles.chart}
      />
    </View>
  );
};

export default PriceChart;
