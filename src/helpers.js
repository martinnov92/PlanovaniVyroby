import Moment from 'moment';
import groupBy from 'lodash/groupBy';
import isEqual from 'lodash/isEqual';
import { extendMoment } from 'moment-range';

const fs = window.require('fs');
const moment = extendMoment(Moment);

export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}

export function createGroupedOrders(orders, orderList, displayFinishedOrders = false) {
    if (displayFinishedOrders) {
        orderList = orderList.filter((order) => order.done === false);
    }

    orders = orders.filter((o) => orderList.findIndex((l) => (l.id === o.orderId)) > -1);
    const groupedByOrders = groupBy(orders, (o) => o.orderId);
    const groupedByProducts = {};
    for (let order in groupedByOrders) {
        groupedByProducts[order] = groupBy(groupedByOrders[order], (n) => n.productName);
    }

    const groupedOrders = {};
    for (let order in groupedByProducts) {
        const orderInfo = orderList.find((o) => o.id === order);
        groupedOrders[order] = {
            _info: {
                done: orderInfo.done,
                color: orderInfo.color,
            },
        };

        for (let product in groupedByProducts[order]) {
            groupedOrders[order][product] = {};

            for (let operation in groupedByProducts[order][product]) {
                const groupedProduct = groupedByProducts[order][product];
                // ! získání největšího čísla z operation
                const maxCount = Math.max.apply(null, groupedProduct.map((p) => {
                    if (p.operation) {
                        return Number(p.operation.count);
                    }

                    return 0;
                }));
                console.log(groupedProduct);
                const usedOperation = {};
                const totalTime = groupedProduct.reduce((prev, current) => {
                    let total = prev;

                    if (current.operation) {
                        let t = 0;
                        const { count, time, casting, exchange, operationTime } = current.operation;

                        if (!operationTime) {
                            t = calculateOperationTime(count, time, exchange, casting);
                        } else {
                            t = operationTime;
                        }
                        console.warn('použité operace', product, usedOperation);
                        if (!usedOperation[current.operation.order]) {
                            usedOperation[current.operation.order] = current.operation;
                            total += t;
                        } else {
                            const used = usedOperation[current.operation.order];
                            if (used.time != time || used.casting != casting || used.exchange != exchange || used.count !== count) {
                                console.warn('něco není stejné', used, current.operation);
                                // total = t + 
                            } else {
                                console.wanr('stejné objekty');
                            }
                        }
                    }

                    return total;
                }, 0);

                groupedOrders[order][product] = {
                    ...groupedOrders[order][product],
                    done: (groupedProduct[0] && groupedProduct[0].hasOwnProperty('done')) ? groupedProduct[0].done : false,
                };

                if (groupedProduct[operation].operation) {
                    groupedOrders[order][product] = {
                        ...groupedOrders[order][product],
                        totalCount: maxCount,
                        totalTime: totalTime,
                    };

                    const gp = groupedProduct[operation];
                    if (gp.operation && (gp.operation.time != 0 || gp.operation.exchange != 0 || gp.operation.casting != 0)) {
                        groupedOrders[order][product][groupedProduct[operation].operation.order] = groupedProduct[operation].operation;
                    }
                }
            }
        }
    }

    return groupedOrders;
}

export function getNetMachineTime(dateFrom, dateTo, workHoursFrom = 7, workHoursTo = 20, pause = 0.5) {
    let result = 0;
    let breakMinutes = 0;
    let minutesWorked = 0;
    let isAtEleven = false;
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
        const currentTime = current.getHours() + (current.getMinutes() / 60);

        // kontrola jestli je daná hodina větší než pracovní doba od a menší než pracovní doba do
        if (currentTime >= workHoursFrom && currentTime <= workHoursTo) {
            if ((currentTime > 11) && (currentTime < 11.1)) {
                isAtEleven = true;
            }

            minutesWorked++;
        }

        if (minutesWorked % BREAK_AFTER_MINUTES === 0) {
            breakMinutes += pause * 60;
        }
        
        // zvětšit čas o hodinu
        current.setTime(current.getTime() + 1000 * 60);
    }

    const isLessThenSixHoursButAtEleven = (isAtEleven && (minutesWorked < BREAK_AFTER_MINUTES));
    minutesWorked = minutesWorked - breakMinutes - (isLessThenSixHoursButAtEleven ? pause * 60 : 0);
    isAtEleven = false;

    return Math.floor(minutesWorked / 10) * 10;
}

export function filterDataByDate(events, from, to) {
    return events.filter((event) => {
        const isInRange = moment(event.dateFrom).isBefore(from) && moment(event.dateTo).isAfter(to);
        const isInWeek = moment(event.dateFrom).isBetween(from, to) || moment(event.dateTo).isBetween(from, to);

        return isInRange || isInWeek;
    });
}

export function getCorrectDateAfterDrop(originalDateFrom, originalDateTo, dateFrom) {
    const NIGHT_TIME = 11;

    dateFrom = moment(dateFrom);
    originalDateTo = moment(originalDateTo);
    originalDateFrom = moment(originalDateFrom);

    let hoursDiff = moment.duration(originalDateTo.diff(originalDateFrom)).asHours();
    let sign = Math.sign(hoursDiff);

    if (originalDateTo.isAfter(moment(originalDateFrom).hours(20))) {
        hoursDiff = (hoursDiff > NIGHT_TIME) ? (hoursDiff - NIGHT_TIME) : hoursDiff;
    }

    let finalDateTo = moment(dateFrom).add((hoursDiff * sign), 'hours');
    let sameDay = moment(dateFrom).isSame(finalDateTo, 'day');

    // pokud se událost přesunula během jednoho dne, vrátím dateTo (ve správném formátu, který se uloží)
    if (sameDay && finalDateTo.hours() < 20) {
        return finalDateTo.format();
    } else {
        // odečíst čas před osmou
        const diffUntilShiftEnds = moment.duration(moment(dateFrom).hours(20).diff(dateFrom)).asHours();
        hoursDiff -= diffUntilShiftEnds;

        const newDateFrom = moment(dateFrom).add(1, 'days').hours(7);
        const finalDateTo = moment(dateFrom).add(1, 'days').hours(7).add(hoursDiff, 'hours');
        return getCorrectDateAfterDrop(newDateFrom, finalDateTo, newDateFrom);
    }
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

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes - (days * 24 * 60)) / 60);
    const minutes = Math.floor(totalMinutes % 60);
    // const secs = Math.floor((totalMinutes * 60) - (hours * 3600) - (minutes * 60));

    return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
    // return days > 0 ? `${days}d ${hours}h ${minutes}m${secs ? ' ' + secs + 's' : ''}` : `${hours}h ${minutes}m${secs ? ' ' + secs + 's' : ''}`;
}

export function calculateOperationTime(count, time, exchange, casting) {
    return (Number(count) * (Number(time) + Number(exchange))) + Number(casting);
}

export function saveFile(path, data) {
    const d = JSON.stringify(data, null, 4);

    return new Promise((resolve, reject) => {
        fs.writeFile(path, d, (err) => {
            if (err) reject(err);
            resolve('Uloženo');
        });
    });
}
