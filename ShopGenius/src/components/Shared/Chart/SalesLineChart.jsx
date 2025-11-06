import { Chart } from 'react-google-charts'


const options = {
  title: 'Sales Over Time',
  curveType: 'function',
  legend: { position: 'bottom' },
  series: [{ color: '#F43F5E' }],
}
const SalesLineChart = ({data}) => {
  return (
    <Chart chartType='LineChart' width='100%' data={data} options={options} />
  )
}

export default SalesLineChart;