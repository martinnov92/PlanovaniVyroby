import Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);
const fs = window.require('fs');

export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}

export function createGroupedOrders(orders, orderList, displayFinishedOrders = false) {
    let o = [...orders];
    let list = [...orderList]; 

    if (displayFinishedOrders) {
        list = orderList.filter((order) => order.done === false);
    }

    return o.filter((o) => list.findIndex((l) => l.id === o.orderId) > -1).reduce((prev, current) => {
        const orderExists = prev[current.orderId];
        const order = list.find((l) => l.id === current.orderId);

        if (!orderExists) {
            return {
                ...prev,
                [current.orderId]: {
                    [current.productName]: {
                        total: {
                            time: Number(current.operation.time),
                            count: Number(current.operation.count),
                        },
                        done: order.done,
                        color: order.color,
                        [current.operation.order]: {
                            time: Number(current.operation.time),
                            count: Number(current.operation.count),
                        }
                    }
                }
            };
        }

        const prevItem = prev[current.orderId][current.productName];
        return {
            ...prev,
            [current.orderId]: {
                ...prev[current.orderId],
                [current.productName]: {
                    ...prevItem,
                    total: {
                        time: Number(prevItem ? prevItem.total.time : 0) + Number(current.operation.time),
                        count: Number(prevItem ? prevItem.total.count : 0) + Number(current.operation.count),
                    },
                    done: order.done,
                    color: order.color,
                    [current.operation.order]: {
                        time: Number(prevItem && prevItem[current.operation.order] ? prevItem[current.operation.order].time : 0) + Number(current.operation.time),
                        count: Number(prevItem && prevItem[current.operation.order] ? prevItem[current.operation.order].count : 0) + Number(current.operation.count),
                    }
                }
            }
        };
    }, {});
}

export function getNetMachineTime(dateFrom, dateTo, workHoursFrom = 7, workHoursTo = 20, pause = 0.5) {
    let result = 0;
    let breakMinutes = 0;
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
    while (current <= dateTo) {
        // TODO: pokud je zakázka v 11 hodin - odečíst čas na oběd (v tom případě neodečítát 30 min pokud je zakázka 6 hod. dlouhá)
        const currentTime = current.getHours() + (current.getMinutes() / 60);

        // kontrola jestli je daná hodina větší než pracovní doba od a menší než pracovní doba do
        if (currentTime >= workHoursFrom && currentTime <= workHoursTo) {
            minutesWorked++;
        }

        if (minutesWorked % BREAK_AFTER_MINUTES === 0) {
            breakMinutes += pause * 60;
        }

        // zvětšit čas o hodinu
        current.setTime(current.getTime() + 1000 * 60);
    }

    minutesWorked -= breakMinutes;
    return Math.floor(minutesWorked / 10) * 10;
}

export function filterDataByDate(events, from, to) {
    return events.filter((event) => {
        const isInRange = moment(event.dateFrom).isBefore(from) && moment(event.dateTo).isAfter(to);
        const isInWeek = moment(event.dateFrom).isBetween(from, to) || moment(event.dateTo).isBetween(from, to);

        return isInRange || isInWeek;
    });
}

export function isDateRangeOverlaping(arr, order) {
    const orderDateFrom = moment(order.dateFrom);
    const orderDateTo = moment(order.dateTo);
    const rangeOrder = moment.range(orderDateFrom, orderDateTo);

    for (let i = 0; i < arr.length; i++) {
        const o = arr[i];
        const sameMachine = order.machine === o.machine;

        const existingOrderDateFrom = moment(o.dateFrom);
        const existingOrderDateTo = moment(o.dateTo);
        const existingRange = moment.range(existingOrderDateFrom, existingOrderDateTo);

        if (existingRange.overlaps(rangeOrder, { adjacent: false }) && sameMachine && order.id !== o.id) {
            return true;
        }
    }

    return false;
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

export function saveFile(path, data) {
    const d = JSON.stringify(data, null, 4);

    return new Promise((resolve, reject) => {
        fs.writeFile(path, d, (err) => {
            if (err) reject(err);
            resolve('Uloženo.');
        });
    });
}
