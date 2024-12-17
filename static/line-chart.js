let last24h_data = [];
let stationInfo = [];

async function get24hData(endTime){
    try{
        const get = await fetch("./api/get_time");
        const data = await get.json();
        const arr = await lineChartData(data, endTime);
        return arr;
    }
    catch (error) {
        console.error('Error fetching time data:', error);
        return [];
    }
}

async function lineChartData(time, endTime){
    const promises = [];
    const endIndex = time.time.indexOf(endTime);

    for (let i = 0; i < 48 && i * 10 <= endIndex; i++) {
        const date = time.time[endIndex - i * 10];
        promises.push(
            fetch(`./api/get_data?date=${date}`)
                .then(response => response.json())
                .then(data => ({ x: time_diff(date, endTime), y: JSON.parse(data) , debug:date }))
        );
    }

    try {
        const data = await Promise.all(promises);
        return data;
    } catch (error) {
        console.error('Error fetching data for line chart:', error);
        return [];
    }
}

async function fetchStationInfo() {
    try {
        const response = await fetch('./api/station_info');
        const data = await response.json();
        stationInfo = JSON.parse(data);
    } catch (error) {
        console.error('Error fetching station info:', error);
    }
}

async function updateLineChart(station_id, endTime) {
    await fetchStationInfo();

    last24h_data = await get24hData(endTime);

    console.log(last24h_data);

    d3.select("#d3line-chart").remove();

    const svg = d3.select("#d3-chart")
        .append("svg")
        .attr("id","d3line-chart")
        .attr("width", window.innerWidth/2)
        .attr("height", window.innerHeight/2)
        .append("g")
        .attr("transform", "translate(" + window.innerWidth * 0.05 + "," +  window.innerHeight * 0.05 + ")");

    const xScale =d3.scaleLinear()
        .domain([24, 0])
        .range([0, window.innerWidth*0.4]);

    const yScale =d3.scaleLinear()
        .domain([0 , d3.max(last24h_data, d => d.y.find(entry => entry[1] === station_id)[0])])
        .range([window.innerHeight*0.4 , 0]);

    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y.find(entry => entry[1] === station_id)[0]));

    svg.append("path")
        .datum(last24h_data) 
        .attr("d", line)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    svg.append("g")
        .attr("transform", "translate(0," + window.innerHeight*0.40 + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

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

    svg.selectAll("circle")
        .data(last24h_data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y.find(entry => entry[1] === station_id)[0]))
        .attr("r", 4)
        .attr("fill", d => {
            const available = d.y.find(entry => entry[1] === station_id)[0];
            const total = stationInfo.find(station => station.sno === station_id).total;
            const percentage = available / total;
            if (percentage >= 0.6) return "green";
            if (percentage >= 0.3) return "#FF8C00";
            return "red";
        })
        .on("mouseover", function(event, d) {
            const date = parseDate(d.debug);
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            tooltip.style("visibility", "visible")
                .html(`Time: ${formattedDate}<br>Available Bikes: ${d.y.find(entry => entry[1] === station_id)[0]}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    // 添加站點名稱和總數量
    const station = stationInfo.find(station => station.sno === station_id);
    svg.append("text")
        .attr("x", window.innerWidth * 0.20)
        .attr("y", window.innerHeight * 0.44)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Station: ${station.sna} (Total: ${station.total})`);
}

function selectStation(lat , lng){
    var index = 0
    for(var i=0;i<stationInfo.length;i++){
        if(stationInfo[i].latitude == lat && stationInfo[i].longtitude == lng){
            index = i
            break
        }
    }
    awaitupdateLineChart(index)
}

function parseDate(dateStr) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; 
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = parseInt(dateStr.substring(8, 10), 10);
    const minute = parseInt(dateStr.substring(10, 12), 10);
    return new Date(year, month, day, hour, minute);
}

function time_diff(dateStr1, dateStr2) {
    const date1 = parseDate(dateStr1);
    const date2 = parseDate(dateStr2);
    const diffInMilliseconds = Math.abs(date2 - date1);
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    return diffInHours;
}

async function awaitupdateLineChart(stationId){
    const interval = setInterval(() => {
        if(timeList.length > 0){
            clearInterval(interval);
            updateLineChart(stationId, timeList[document.getElementById('slide').value]);
        }
    }, 50);
}
// updateLineChart('500101001', timeList[document.getElementById('slide').value]);
awaitupdateLineChart('500101001');
// awaitupdateLineChart('500101002');