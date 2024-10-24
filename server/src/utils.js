// Helper function to convert "dd-mm-yyyy hh:mm:ss" format to a Date object
export function parseDateTime(dateString) {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart ? timePart.split(":").map(Number) : [0, 0, 0];

    return new Date(year, month - 1, day, hours, minutes, seconds);
}

// Helper function to validate the date and time format "dd-mm-yyyy hh:mm:ss"
export function isValidDateTime(dateString) {
    const regex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, seconds);

    return date && date.getDate() === day && (date.getMonth() + 1) === month && date.getFullYear() === year
        && date.getHours() === hours && date.getMinutes() === minutes && date.getSeconds() === seconds;
}