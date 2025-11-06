import { Chart } from "react-google-charts";



// const options = {
//   title: "Monthly Product Sales and Orders Overview",
//   vAxis: { title: "Sales (CAD) / Orders" },
//   hAxis: { title: "Month" },
//   seriesType: "bars",
//   series: { 2: { type: "line" } },
// };
const options = {
  title: "Monthly Sales & Orders",
//   chartArea: { width: "75%" },
  legend: { position: "top" },
  hAxis: { title: "Month" },

  // Two y-axes: left for $ sales, right for order count
  vAxes: {
    0: { title: "Sales ($)", format: "short" },
    1: { title: "Orders", format: "decimal" },
  },

  // Combo settings: bars by default, make orders a line
  seriesType: "bars",
  series: {
    0: { type: "bars", targetAxisIndex: 0 }, // Month Sales
    1: { type: "line", targetAxisIndex: 1 }, // Total Orders
  },

  // Nice bar look
  bar: { groupWidth: "20%" },
};

export function AdminChart({data}) {
  return (
    <Chart
      chartType="ComboChart"
      width="100%"
      height="100%"
      data={data}
      options={options}
    />
  );
}
