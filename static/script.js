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


async function updateSlideRange() {
    const slideRange = await getSlideRange();
    const start = slideRange.start;
    const end = slideRange.end;
    const slider = document.getElementById('slide');
    slider.setAttribute('min', Number(start));
    slider.setAttribute('max', Number(end));
    slider.setAttribute('value', Number(start));
    slider.setAttribute('step', 1);
}

window.onload = updateSlideRange()