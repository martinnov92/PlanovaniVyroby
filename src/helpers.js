// @ts-check
import moment from 'moment';

export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDThh:mm';

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}

export function getNetMachineTime(dateFrom, dateTo, workHoursFrom = 7, workHoursTo = 20, pause = 0.5) {
    let result = 0;
    let minutesWorked = 0;
    const BREAK_AFTER_MINUTES = 360;
    
    dateFrom = moment(dateFrom).toDate();
    dateTo = moment(dateTo).toDate();
    // const notWorkingHours = workHoursTo - workHoursFrom;

    // kontrola jestli jsou data ve správném pořadí
    if (moment(dateTo).isBefore(moment(dateFrom))) {
        return result;
    }

    let current = dateFrom;
    while (current < dateTo) {
        const currentTime = current.getHours() + (current.getMinutes() / 60);

        // kontrola jestli je daná hodina větší než pracovní doba od a menší než pracovní doba do
        if (currentTime >= workHoursFrom && currentTime <= workHoursTo) {
            minutesWorked++;
        }

        // zvětšit čas o hodinu
        current.setTime(current.getTime() + 1000 * 60);
    }

    // odečíst zákonnou přestávku
    if ((minutesWorked / 60) >= 6) {
        const multiple = Math.floor(minutesWorked / BREAK_AFTER_MINUTES);
        minutesWorked = minutesWorked - ((pause * 60) * multiple);
    }

    return Math.floor(minutesWorked / 10) * 10;
}

export function formatMinutesToTime(totalMinutes) {
    if (!totalMinutes) {
        // default
        return `0h 0m`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
}
