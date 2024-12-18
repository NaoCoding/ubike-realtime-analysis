// 獲得 data(時間) 的 bike 數量
async function fetchBikeData(date) {
    const dataResponse = await fetch(`/api/get_data?date=${date}`);
    const data = await dataResponse.json();
    return JSON.parse(data); // 確保 data 是 JSON 格式
}

async function drawScatterPlot() {
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
                available_return_bikes: station.total - (dataEntry ? dataEntry[0] : 0),
                region: station.sarea,
                station_name: station.sna,
                station_ID: station.sno
            });
        }

        console.log(stationData);

        /***********************************************************************/
        d3.select("#d3scatter-plot").remove();
        // 生成svg
        const margin = {top: 550, right: 30, bottom: 40, left: 90};
        const width = 800 - margin.left - margin.right; // 調整寬度
        const height = 1150 - margin.top - margin.bottom; // 調整高度

        const svg = d3.select("#d3-chart")
            .append("svg")
            .attr("id","d3scatter-plot")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 設定比例尺
        const x = d3.scaleLinear()
            .domain([0, d3.max(stationData, d => d.available_rent_bikes)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(stationData, d => d.available_return_bikes)])
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

        // 繪製 scatter plot
        const dots = svg.selectAll(".dot")
            .data(stationData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.available_rent_bikes))
            .attr("cy", d => y(d.available_return_bikes))
            .attr("r", 3.5)
            .attr("fill", d => {
                const percentage = d.available_rent_bikes / d.total;
                if (percentage >= 0.6) return "green";
                if (percentage >= 0.3) return "#FF8C00";
                return "red";
            })
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`Station: ${d.station_name}<br>Available: ${d.available_rent_bikes}<br>Empty Slots: ${d.available_return_bikes}<br>Total Slots: ${d.total}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        // 添加 x 軸
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // 添加 x 軸標題
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 35)
            .text("Available Bikes");

        // 添加 y 軸
        svg.append("g")
            .call(d3.axisLeft(y));

        // 添加 y 軸標題
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", 0)
            .text("Empty Slots");

        // 添加日期資訊
        const formattedDate = latestDate.slice(0, 4) + '-' + latestDate.slice(4, 6) + '-' + latestDate.slice(6, 8) + ' ' + latestDate.slice(8, 10) + ':' + latestDate.slice(10, 12);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(`Date: ${formattedDate}`);
    } catch (error) {
        console.error('Error fetching data for scatter plot:', error);
    }
}

async function updateScatterPlot(stationIDList) {
    try {
        // 獲得 bike 數量
        const timeResponse = await fetch('/api/get_time');
        const timeData = await timeResponse.json();
        const latestDate = timeData.time[document.getElementById('slide').value];

        const data = await fetchBikeData(latestDate);

        // 生成 data 與 stationIDList 的對應
        const stationData = stationIDList.map(station => {
            const dataEntry = data.find(d => d[1] === station.sno);
            return {
                available_rent_bikes: dataEntry ? dataEntry[0] : 0,
                total: station.total,
                available_return_bikes: station.total - (dataEntry ? dataEntry[0] : 0),
                name: station.sna,
                station_ID: station.sno
            };
        });

        console.log('scatter plot station data: ', stationData);

        /***********************************************************************/
        d3.select("#d3scatter-plot").remove();
        // 生成svg
        const margin = {top: 550, right: 30, bottom: 40, left: 90};
        const width = 800 - margin.left - margin.right; // 調整寬度
        const height = 1150 - margin.top - margin.bottom; // 調整高度

        const svg = d3.select("#d3-chart")
            .append("svg")
            .attr("id","d3scatter-plot")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 設定比例尺
        const x = d3.scaleLinear()
            .domain([0, d3.max(stationData, d => d.available_rent_bikes)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(stationData, d => d.available_return_bikes)])
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

        // 繪製 scatter plot
        const dots = svg.selectAll(".dot")
            .data(stationData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.available_rent_bikes))
            .attr("cy", d => y(d.available_return_bikes))
            .attr("r", 4)
            .attr("fill", d => {
                const percentage = d.available_rent_bikes / d.total;
                if (percentage >= 0.6) return "green";
                if (percentage >= 0.3) return "#FF8C00";
                return "red";
            })
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`Station: ${d.name}<br>Available: ${d.available_rent_bikes}<br>Empty Slots: ${d.available_return_bikes}<br>Total Slots: ${d.total}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        // 添加 x 軸
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // 添加 x 軸標題
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 35)
            .text("Available Bikes");

        // 添加 y 軸
        svg.append("g")
            .call(d3.axisLeft(y));

        // 添加 y 軸標題
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", 0)
            .text("Empty Slots");

        // 添加日期資訊
        const formattedDate = latestDate.slice(0, 4) + '-' + latestDate.slice(4, 6) + '-' + latestDate.slice(6, 8) + ' ' + latestDate.slice(8, 10) + ':' + latestDate.slice(10, 12);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(`Date: ${formattedDate}`);
    } catch (error) {
        console.error('Error updating scatter plot:', error);
    }
}

drawScatterPlot();
