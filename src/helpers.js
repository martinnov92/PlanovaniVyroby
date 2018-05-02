// @ts-check
import moment from 'moment';

export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDThh:mm';

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}

export function getNetMachineTime(dateFrom, dateTo, workHoursFrom = 7, workHoursTo = 20, pause = 0.5) {
    const START_TIME = moment().set({
        hour: workHoursFrom,
        minute: 0,
        seconds: 0,
        millisecond: 0,
    });

    const END_TIME = moment().set({
        hour: workHoursTo,
        minute: 0,
        seconds: 0,
        millisecond: 0,
    });

    let result = 0;
    dateFrom = moment(dateFrom);
    dateTo = moment(dateTo);
    // const notWorkingHours = workHoursTo - workHoursFrom;

    // kontrola jestli jsou data ve správném pořadí
    if (dateTo.isBefore(dateFrom)) {
        return result;
    }

    // zjistit celkový počet dnů (TODO: mínus víkendy a svátky)
    const timeDiff = moment.duration(dateTo.diff(dateFrom));
    const totalDays = Math.floor(timeDiff.asDays());

    if (totalDays > 0) {
        for (let i = 0; i < totalDays; i++) {
            const dayStart = moment(dateFrom).add(i, 'days');
            const START_OF_CURRENT_DAY = moment(dayStart).hour(workHoursFrom);
            const END_OF_CURRENT_DAY = moment(dayStart).hour(workHoursTo);

            const dayStartDiff = moment.duration(START_OF_CURRENT_DAY.diff(dayStart));
            const dayEndDiff = moment.duration(END_OF_CURRENT_DAY.diff(dayStart));
            console.log(dayStartDiff.asHours(), dayEndDiff.asHours());
        }
    }

    // if (totalDays > 0) {
    //     result = totalHours - (notWorkingHours * totalDays) - (pause * totalDays);
    // } else if (totalHours > 6) {
    //     result = totalHours - pause;
    // } else {
    //     result = totalHours;
    // }
    // console.log(result);
    return result + 10;
}
