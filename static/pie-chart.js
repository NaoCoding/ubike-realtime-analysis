// 獲得 data(時間) 的 bike 數量
async function fetchBikeData(date) {
    const dataResponse = await fetch(`/api/get_data?date=${date}`);
    const data = await dataResponse.json();
    return JSON.parse(data); // 確保 data 是 JSON 格式
}

async function drawPieChart() {
    try {
        // 獲得 bike 數量
        const timeResponse = await fetch('/api/get_time');
        const timeData = await timeResponse.json();
        const latestDate = timeData.time[document.getElementById('slide').value];

        const data = await fetchBikeData(latestDate);

        // 獲得 region 資訊
        const stationInfoResponse = await fetch('/api/station_info');
        let stationInfo = await stationInfoResponse.json();
        stationInfo = JSON.parse(stationInfo); // 確保 stationInfo 是 JSON 格式

        // 生成 data 與 stationInfo 的對應
        const stationData = [];
        for (const station of stationInfo) {
            const dataEntry = data.find(d => d[1] === station.sno);
            stationData.push({
                available_rent_bikes: dataEntry ? dataEntry[0] : 0,
                total: station.total,
                region: station.sarea,
                station_ID: station.sno
            });
        }

        // Sum available_rent_bikes for the same region
        const regionData = d3.rollups(
            stationData,
            v => d3.sum(v, d => d.available_rent_bikes),
            d => d.region
        ).map(([region, available_rent_bikes]) => ({
            region,
            available_rent_bikes
        }));

        // Calculate the total number of available bikes across all regions
        const totalAvailableBikes = d3.sum(regionData, d => d.available_rent_bikes);

        // Sort the regionData by the proportion of available bikes in descending order
        regionData.sort((a, b) => b.available_rent_bikes / totalAvailableBikes - a.available_rent_bikes / totalAvailableBikes);

        /***************************************************************************/
        d3.select("#d3pie-chart").remove();

        // 生成svg
        const margin = {top: 580, right: 80, bottom: 80, left: 1080};
        const width = 1500 - margin.left - margin.right;
        const height = 1000 - margin.top - margin.bottom;

        const radius = Math.min(width, height) / 2;

        const svg = d3.select("#d3-chart")
            .append("svg")
            .attr("id","d3pie-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

        // 設定顏色比例尺
        const color = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, d3.max(regionData, d => d.available_rent_bikes / totalAvailableBikes)]);

        // 設定 pie 和 arc
        const pie = d3.pie()
            .value(d => d.available_rent_bikes);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const outerArc = d3.arc()
            .innerRadius(radius * 1.15)
            .outerRadius(radius * 1.15);

        // 繪製 pie chart
        svg.selectAll('path')
            .data(pie(regionData))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.available_rent_bikes / totalAvailableBikes))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`Region: ${d.data.region}<br>Available: ${d.data.available_rent_bikes}<br>Total Available: ${totalAvailableBikes}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        // 添加百分比文字
        svg.selectAll('text')
            .data(pie(regionData))
            .enter()
            .append('text')
            .text(d => `${d.data.region}: ${((d.data.available_rent_bikes / totalAvailableBikes) * 100).toFixed(1)}%`)
            .attr("transform", d => `translate(${outerArc.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", 12)
            .style("background", "rgba(128, 128, 128, 0.5)"); // 灰色半透明背景

        // 添加 tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "10px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)");

    } catch (error) {
        console.error('Error fetching data for pie chart:', error);
    }
}

drawPieChart();
