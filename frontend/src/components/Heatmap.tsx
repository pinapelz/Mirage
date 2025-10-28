import HeatMap from '@uiw/react-heat-map';

export type HeatmapObject = {
  date: string,
  count: number
}

export type HeatmapData = {
  data: HeatmapObject[]
}

const Heatmap = (data : HeatmapData) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  console.log(data.data);

  return (
    <HeatMap
      value={data.data}
      width={800}
      startDate={oneYearAgo}
      style={{
        color: '#ffffff'
      }}
      panelColors={{
        0: '#161b22',
        2: '#0e4429',
        4: '#006d32',
        10: '#26a641',
        20: '#39d353'
      }}
    />
  )

}
export default Heatmap;
