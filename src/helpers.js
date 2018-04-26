// @ts-check
import moment from 'moment';

export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDThh:mm';

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}

export function getNetMachineTime(dateFrom, dateTo, workHoursFrom = 7, workHoursTo = 20, pause = 0.5) {
    dateFrom = moment(dateFrom);
    dateTo = moment(dateTo);

    const notWorkingHours = workHoursTo - workHoursFrom;
    const hoursDifference = moment.duration(dateTo.diff(dateFrom)).asHours();
    const daysDifference = moment.duration(dateTo.diff(dateFrom)).asDays();

    const isBetween = dateFrom.isBetween(dateFrom.hours(workHoursTo), dateTo.hours(workHoursFrom));

    console.log(moment(dateFrom).hours(workHoursTo));

    return hoursDifference - notWorkingHours - pause;
}
