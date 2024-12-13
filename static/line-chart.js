


function updateLineChart(station_id) {

    fetch("./api/get_time")
    .then(response => response.json())
    .then(time => {

        var data = []
        
        for(var i=0;i<480;i++){
            if(i == time.length) break;
            fetch("./api/get_data?date=" + time[time.length - i - 1])
            .then(response => response.json())
            .then(q => {
                data.push({x: time_diff(time[time.length - i - 1]), y: q[station_id]})
            })
        }

        const svg = d3.select("#d3-chart")
        .append("g")
        .attr("id","d3line-chart")
        .attr("width", window.innerWidth/2)
        .attr("height", window.innerHeight/2)
        .attr("transform", "translate(" + window.innerWidth * 0.05 + "," +  window.innerHeight * 0.05 + ")");

        const xScale =d3.scaleLinear()
        .domain([d3.max(data , function(d){return d.x}), d3.min(data, function(d){return d.x})])
        .range([0, window.innerWidth*0.4]);

        const yScale =d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([window.innerHeight*0.4 , 0]);

        const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

        svg.append("path")
            .datum(data) 
            .attr("d", line)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        svg.append("g")
            .attr("transform", "translate(0," + window.innerHeight*0.40 + ")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

    })

    
}

function time_diff(a , b){
    
}

