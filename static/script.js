async function getSlideRange() {
    try {
        const response = await fetch('./api/get_time');
        if (!response.ok) {
            throw new Error('Response Error');
        }
        const data = await response.json();
        return data;
    } catch (error) {
       console.error('Error fetching slide range:', error);
   }
}

let timeList = []

async function selectArea(coords){

    var coords = JSON.parse(coords).geometry.coordinates[0]

    coords.sort(function(a,b){
        if(a[0] == b[0]) return a[1] - b[1];
        return a[0] - b[0];
    })

    console.log(coords)

    const station_info = await fetch('/api/station_info')
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            return JSON.parse(data).filter(station => {
                return (
                    station.longitude >= coords[1][0] &&
                    station.longitude <= coords[4][0] &&
                    station.latitude >= coords[1][1] &&
                    station.latitude <= coords[4][1]
                );
            });
        })

    const slider = document.getElementById('slide');

    const time_data = await fetch('/api/get_data?date='+timeList[slider.value])

    
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        return JSON.parse(data)
    })

    station_info.filter(station => {
        return time_data.find(time => time.sno == station.sno)
    }
    )

    console.log(station_info)
    
    //ToDo : update three plots with station_info

    
    

}


function update_slider_value(value){
    if(parseNumberToDate(timeList[value]) == document.getElementById('slider_value').innerHTML)return
    document.getElementById('slider_value').innerHTML = parseNumberToDate(timeList[value]);
    document.querySelector("body > div.container > div > iframe").src = './api/map?date=' + timeList[value];
    document.getElementById('loading-div').style.display = 'flex';
    document.getElementById('iframe').style.display = 'none';

    //ToDo : update three chart and the line chart
    awaitupdateLineChart('undefined')
    drawPieChart()
    drawBarChart()
    drawScatterPlot()
}

async function updateSlideRange() {
    const slideRange = await getSlideRange();
    timeList = slideRange.time;
    const slider = document.getElementById('slide');
    slider.setAttribute('min', Number(0));
    slider.setAttribute('max', Number(timeList.length - 1));
    slider.setAttribute('value', Number(timeList.length - 1));
    slider.setAttribute('step', 1);

    document.getElementById("slider_value").innerHTML = parseNumberToDate(timeList[timeList.length - 1]);
}

function parseNumberToDate(target){

    target = String(target)
    const year = target.substring(0, 4);
    const month = target.substring(4, 6);
    const day = target.substring(6, 8);
    const hour = target.substring(8, 10);
    const minute = target.substring(10, 12);
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

function iframe_onLoad(){

    document.getElementById('loading-div').style.display = 'none';
    document.getElementById('iframe').style.display = 'flex';
    
}

window.onload = updateSlideRange()
