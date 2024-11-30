//helper function to validate email format
export function isValidEmail(email) {
    //https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

//helper function to convert "dd-mm-yyyy hh:mm:ss" format to a Date object
export function parseDateTime(dateString) {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    let hours = 0, minutes = 0, seconds = 0;

    if (timePart) {
        const timeParts = timePart.split(":");
        hours = Number(timeParts[0]);
        minutes = Number(timeParts[1]);
        seconds = Number(timeParts[2]);
    }

    return new Date(year, month - 1, day, hours, minutes, seconds);
}

//helper function to validate the date and time format "dd-mm-yyyy hh:mm:ss"
export function isValidDateTime(dateString) {
    // https://regex-generator.olafneumann.org/?sampleText=2020-03-12T13%3A34%3A56.123Z%20INFO%20%20%5Borg.example.Class%5D%3A%20This%20is%20a%20%23simple%20%23logline%20containing%20a%20%27value%27.&flags=i
    const regex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    
    //verify if result is valid and can be converted to a js Date object
    const date = new Date(year, month - 1, day, hours, minutes, seconds);

    if (!date) {
        return false;
    }

    const isSameDay = date.getDate() === day;
    const isSameMonth = date.getMonth() + 1 === month;
    const isSameYear = date.getFullYear() === year;
    const isSameHour = date.getHours() === hours;
    const isSameMinute = date.getMinutes() === minutes;
    const isSameSecond = date.getSeconds() === seconds;

    return isSameDay && isSameMonth && isSameYear && isSameHour && isSameMinute && isSameSecond;
}