// 獲得 data(時間) 的 bike 數量
async function fetchBikeData(date) {
    const dataResponse = await fetch(`/api/get_data?date=${date}`);
    const data = await dataResponse.json();
    return JSON.parse(data); // 確保 data 是 JSON 格式
}

async function drawBarChart() {
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
            available_rent_bikes,
            total: d3.sum(stationData.filter(d => d.region === region), d => d.total)
        }));

        // Sort the regionData by available bikes in descending order
        regionData.sort((a, b) => b.available_rent_bikes - a.available_rent_bikes);

        console.log(regionData);

        /*********************************************************************************/
        // 生成svg
        const margin = {top: 90, right: 30, bottom: 40, left: 990}; // 增加 top margin
        const width = 1700 - margin.left - margin.right;
        const height = 450 - margin.top - margin.bottom;

        let svg = d3.select("#d3bar-chart");
        if (svg.empty()) {
            svg = d3.select("#d3-chart")
                .append("svg")
                .attr("id", "d3bar-chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        } else {
            svg.selectAll("*").remove();
            svg = svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        }

        // 設定比例尺
        const x = d3.scaleBand()
            .domain(regionData.map(d => d.region))
            .range([0, width])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(regionData, d => d.total)])
            .range([height, 0]);

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

        // 繪製 available_rent_bikes 的 bar chart
        svg.selectAll(".bar-available")
            .data(regionData)
            .enter()
            .append("rect")
            .attr("class", "bar-available")
            .attr("x", d => x(d.region))
            .attr("y", d => y(d.available_rent_bikes))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.available_rent_bikes))
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`Available: ${d.available_rent_bikes}<br>Total: ${d.total}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        // 繪製 total 的 bar chart (描出框)
        svg.selectAll(".bar-total")
            .data(regionData)
            .enter()
            .append("rect")
            .attr("class", "bar-total")
            .attr("x", d => x(d.region))
            .attr("y", d => y(d.total))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.total))
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);

        // 添加百分比文字
        svg.selectAll(".label")
            .data(regionData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d.region) + x.bandwidth() / 2)
            .attr("y", d => y(d.total) - 5) // 上方
            .attr("text-anchor", "middle")
            .text(d => `${((d.available_rent_bikes / d.total) * 100).toFixed(1)}%`);

        // 添加 x 軸
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // 添加 y 軸
        svg.append("g")
            .call(d3.axisLeft(y));

        // 顯示總站點數量
        svg.append("text")
            .attr("class", "total-stations")
            .attr("x", width - 150) // 放置在 bar chart 旁邊
            .attr("y", 15)
            .attr("text-anchor", "start")
            .text(`Total Stations: ${stationData.length}`);

        // 顯示日期
        const formattedDate = latestDate.replace('T', ' ').slice(0, 16).replace(/-/g, '-');
        svg.append("text")
            .attr("class", "date")
            .attr("x", width - 150) // 放置在 bar chart 旁邊
            .attr("y", 35)
            .attr("text-anchor", "start")
            .text(`Date: ${formattedDate}`);

    } catch (error) {
        console.error('Error fetching data for bar chart:', error);
    }
}

async function updateBarChart(stationIDList) {
    if (stationIDList.length === 0) {
        drawBarChart();
    } else {
        try {
            // 獲得 bike 數量
            const timeResponse = await fetch('/api/get_time');
            const timeData = await timeResponse.json();
            const latestDate = timeData.time[document.getElementById('slide').value];

            const data = await fetchBikeData(latestDate);
            
            console.log('stationIDList:', stationIDList);

            // 生成 data 與 stationInfo 的對應
            const stationData = stationIDList.map(station => ({
                available_rent_bikes: station.available_rent_bikes,
                total: station.total,
                name: station.sna,
                station_ID: station.sno
            }));

            console.log('stationData:', stationData);

            /********************************************/

            // 按照剩餘數量排序
            stationData.sort((a, b) => b.available_rent_bikes - a.available_rent_bikes);

            const margin = {top: 90, right: 30, bottom: 40, left: 990}; // 增加 top margin
            const width = 1700 - margin.left - margin.right;
            const height = 450 - margin.top - margin.bottom;

            // 更新svg
            const svg = d3.select("#d3-chart").select("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .select("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // 移除舊的圖表元素
            svg.selectAll("*").remove();

            // 更新比例尺
            const x = d3.scaleBand()
                .domain(stationData.map(d => d.name))
                .range([0, width])
                .padding(0.3);

            const y = d3.scaleLinear()
                .domain([0, d3.max(stationData, d => d.total)]) // Y 軸的最大值設為 total 最大的值
                .range([height, 0]);

            // 更新 bar chart
            svg.selectAll(".bar-available")
                .data(stationData)
                .enter()
                .append("rect")
                .attr("class", "bar-available")
                .attr("x", d => x(d.name))
                .attr("y", d => y(d.available_rent_bikes))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.available_rent_bikes))
                .attr("fill", "steelblue");

            // 更新 tooltip
            const tooltip = d3.select(".tooltip");
            svg.selectAll(".bar-available")
                .on("mouseover", function(event, d) {
                    tooltip.style("visibility", "visible")
                        .html(`Name: ${d.name}<br>Available: ${d.available_rent_bikes}<br>Total: ${d.total}`);
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                });

            // 更新百分比文字
            svg.selectAll(".label")
                .data(stationData)
                .enter()
                .append("text")
                .attr("class", "label")
                .attr("x", d => x(d.name) + x.bandwidth() / 2)
                .attr("y", d => y(d.available_rent_bikes) - 5) // 上方
                .attr("text-anchor", "middle")
                .text(d => `${d.available_rent_bikes}`);

            // 更新 total 的 bar chart (描出框)
            svg.selectAll(".bar-total")
                .data(stationData)
                .enter()
                .append("rect")
                .attr("class", "bar-total")
                .attr("x", d => x(d.name))
                .attr("y", d => y(d.total))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.total))
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 1.5);

            // 更新 x 軸
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("display", "none"); // 隱藏 X 軸的名稱

            // 更新 y 軸
            svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y));

            // 顯示總站點數量
            svg.append("text")
                .attr("class", "total-stations")
                .attr("x", width - 160) // 放置在 bar chart 旁邊
                .attr("y", 15)
                .attr("text-anchor", "start")
                .text(`Total Stations: ${stationData.length}`);

            // 顯示日期
            const formattedDate = latestDate.replace('T', ' ').slice(0, 16).replace(/-/g, '-');
            svg.append("text")
                .attr("class", "date")
                .attr("x", width - 160) // 放置在 bar chart 旁邊
                .attr("y", 35)
                .attr("text-anchor", "start")
                .text(`Date: ${formattedDate}`);
        } catch (error) {
            console.error('Error updating bar chart:', error);
        }
    }
}

updateBarChart([]);