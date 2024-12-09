async function getSlideRange() {
    try {
        const response = await fetch('./slide-range');
        if (!response.ok) {
            throw new Error('Response Error');
        }
        const data = await response.json();
        return data;
    } catch (error) {
       console.error('Error fetching slide range:', error);
   }
}
