let last24h_data = []

async function get24hData(){
    try{
        const get = await fetch("./api/get_time")
        const data = await get.json()
        const arr = await lineChartData(data)
        return arr
    }
    catch (error) {
        console.error('Error fetching time data:', error);
        return [];
    }
}

async function lineChartData(time){
    const promises = [];

    for (let i = 0; i < 48 && i * 10 < time.time.length; i++) {
        const date = time.time[time.time.length - i * 10 - 1];
        promises.push(
            fetch(`./api/get_data?date=${date}`)
                .then(response => response.json())
                .then(data => ({ x: time_diff(date,time.time[time.time.length - 1]), y: JSON.parse(data) , debug:date }))
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

async function updateLineChart(station_id) {

    if(last24h_data.length == 0) last24h_data = await get24hData()

    console.log(last24h_data)

    d3.select("#d3line-chart").remove()

    const svg = d3.select("#d3-chart")
    .append("g")
    .attr("id","d3line-chart")
    .attr("width", window.innerWidth/2)
    .attr("height", window.innerHeight/2)
    .attr("transform", "translate(" + window.innerWidth * 0.05 + "," +  window.innerHeight * 0.05 + ")");

    const xScale =d3.scaleLinear()
    .domain([24, 0])
    .range([0, window.innerWidth*0.4]);

    const yScale =d3.scaleLinear()
    .domain([0 , d3.max(last24h_data, d => d.y[station_id])])
    .range([window.innerHeight*0.4 , 0]);

    const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y[station_id]));

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
