import { Chart } from "react-google-charts";

const options = {
  tooltip: { isHtml: true },
  title: "Daily Product Sales Overview",
  legend: { position: "top" },
  chartArea: { width: "70%" },
  hAxis: { title: "Date", format: "MMM dd" },
  vAxis: { title: "Sales / Sold Count" },
  colors: ["#3b82f6", "#60a5fa"],
};

export default function SellerChart({ data }) {
  console.log(data);
  return (
    // <div style={{ width: "100%", height: "400px" }}>
    <Chart
      chartType="ColumnChart"
      width="100%"
      height="100%"
      data={data}
      options={options}
    />
    // </div>
  );
}
