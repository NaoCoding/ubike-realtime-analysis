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


function update_slider_value(value){
    if(parseNumberToDate(timeList[value]) == document.getElementById('slider_value').innerHTML)return
    document.getElementById('slider_value').innerHTML = parseNumberToDate(timeList[value]);
    document.querySelector("body > div.container > div > iframe").src = './api/map?date=' + timeList[value];

    //ToDo : update three chart and del the line chart
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


window.onload = updateSlideRange()