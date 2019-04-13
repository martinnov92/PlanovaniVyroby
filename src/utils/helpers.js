import Moment from 'moment';
import groupBy from 'lodash/groupBy';
import { extendMoment } from 'moment-range';

const fs = window.require('fs');
const moment = extendMoment(Moment);

export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

/* eslint-disable eqeqeq */

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}

export function filterDataByDate(events, from, to) {
    return events.filter((event) => {
        const isInRange = moment(event.dateFrom).isBefore(from) && moment(event.dateTo).isAfter(to);
        const isInWeek = moment(event.dateFrom).isBetween(from, to) || moment(event.dateTo).isBetween(from, to);

        return isInRange || isInWeek;
    });
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

    const groupedOrders = [];
    for (let order in groupedByProducts) {
        const orderInfo = orderList.find((o) => o.id === order);
        /**
         * Celá zakázka
         * {
         *      _info: {
         *          done: false,
         *          color: red,
         *      },
         * }
         * 
         */
        const commission = {
            _info: {
                totalTime: 0,
                orderId: order,
                totalWorkingTime: 0,
                name: orderInfo.name,
                done: orderInfo.done,
                color: orderInfo.color,
            },
        };

        for (let product in groupedByProducts[order]) {
            /**
             * Celá zakázka -> Výrobek
             * {
             *      Výrobek: {
             *          totalTime: 0,
             *          totalCount: 0,
             *      },
             *      _info: {
             *          done: false,
             *          color: red,
             *      },
             * }
             */
            // poslední den, kdy se pracuje na výrobku
            const groupedProduct = groupedByProducts[order][product];
            const lastWorkingDate = Math.max(...groupedProduct.map((product) => {
                const d = new Date(product.dateTo);
                return d.getTime();
            }));

            commission[product] = {
                operation: [],
                totalCount: 0,
                totalWorkingTime: 0,
                totalOperationTime: 0,
                lastWorkingDate: lastWorkingDate,
                done: (groupedProduct[0] && groupedProduct[0].hasOwnProperty('done')) ? groupedProduct[0].done : false,
                plannedFinishDate: (groupedProduct[0] && !!groupedProduct[0].plannedFinishDate) ? groupedProduct[0].plannedFinishDate : null,
            };
            const groupedOrder = commission[product];

            for (let operation in groupedProduct) {
                // ! získání největšího čísla z operation
                const maxCount = Math.max.apply(null, groupedProduct.map((p) => {
                    if (p.operation) {
                        return Number(p.operation.count);
                    }

                    return 0;
                }));

                /**
                 * Celá zakázka -> Výrobek
                 * {
                 *      Výrobek: {
                 *          done: false,
                 *      },
                 *      _info: {
                 *          done: false,
                 *          color: red,
                 *      },
                 * }
                 */
                const usedOperation = {};
                const workingHoursForOperation = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, };

                if (groupedProduct[operation].operation) {
                    const totalTime = groupedProduct.reduce((prev, current) => {
                        let totalOperationTime = prev.totalOperationTime;
                        let totalWorkingTime = prev.totalWorkingTime + current.workingHours;

                        if (current.operation) {
                            let t = 0;
                            let used = usedOperation[current.operation.order];
                            const { count, time, casting, exchange, operationTime } = current.operation;
                            workingHoursForOperation[current.operation.order] += current.workingHours;

                            if (!operationTime) {
                                t = calculateOperationTime(count, time, exchange, casting);
                            } else {
                                t = operationTime;
                            }

                            if (current.operation.order == '7') {
                                // pokud objednávka obsahuje sedmou operaci, nastavím na true
                                groupedOrder.coop = true;
                            } else {
                                // console.warn('použité operace', product, usedOperation);
                                if (!used) {
                                    usedOperation[current.operation.order] = {
                                        ...current.operation,
                                        operationTime: t,
                                    };
                                    totalOperationTime += t;
                                } else {
                                    if ((Number(time) > Number(used.time)) || (Number(casting) > Number(used.casting)) || (Number(exchange) > Number(used.exchange)) || (Number(count) > Number(used.count)) || (Number(operationTime) > Number(used.operationTime))) {
                                        totalOperationTime -= used.operationTime;
                                        totalOperationTime += t;
                                        usedOperation[current.operation.order] = {
                                            ...current.operation,
                                            operationTime: t,
                                        };
                                    }
                                }
                            }
                        }

                        return {
                            totalWorkingTime,
                            totalOperationTime,
                        };
                    }, {
                        totalWorkingTime: 0,
                        totalOperationTime: 0,
                    });

                    /**
                     * Celá zakázka -> Výrobek -> Operace
                     * {
                     *      Výrobek: {
                     *          done: false,
                     *          totalTime: 200,
                     *          totalCount: 200,
                     *          operation: [{
                     *              casting: 2,
                     *              count: 2,
                     *              time: 2,
                     *              order: 1,
                     *              operationTime: CELKOVÝ ČAS OPERACE
                     *          }],
                     *      },
                     *      _info: {
                     *          done: false,
                     *          color: red,
                     *      },
                     * }
                     */
                    groupedOrder.totalCount = maxCount;
                    groupedOrder.totalWorkingTime = totalTime.totalWorkingTime;
                    groupedOrder.totalOperationTime = totalTime.totalOperationTime;

                    const gp = groupedProduct[operation];
                    if (gp.operation) {
                        // existuje na výrobku dané zakázky daná operace?
                        const index = groupedOrder.operation.findIndex((o) => o.order == gp.operation.order);
                        // const dates = groupedProduct.
                        const operation = {
                            ...gp.operation,
                            dates: [],
                            workingHoursForOperation: workingHoursForOperation[gp.operation.order],
                        };

                        if (index > -1) {
                            // pokud ano zkontroluj, jestli je jedna operace větší než druhá
                            const used = groupedOrder.operation[index];
                            const { time, casting, exchange, count, operationTime, note, } = gp.operation;

                            if (
                                (Number(time) > Number(used.time)) ||
                                (Number(casting) > Number(used.casting)) ||
                                (Number(exchange) > Number(used.exchange)) ||
                                (Number(count) > Number(used.count)) ||
                                (Number(operationTime) > Number(used.operationTime)) ||
                                note != used.note
                            ) {
                                let noteCopy = used.note;
                                // pokud je tam víc stejných operací s různými popisky, tak je spojím

                                if (note != used.note) {
                                    if (!noteCopy) {
                                        noteCopy = note;
                                    } else {
                                        noteCopy += ', ' + note;
                                    }
                                }

                                // a pokud je, tak nastav tu větší jako hlavní
                                groupedOrder.operation[index] = {
                                    ...groupedOrder.operation[index],
                                    operation,
                                    note: noteCopy,
                                };
                            }

                            groupedOrder.operation[index].dates.push(gp.dateFrom);
                        } else {
                            operation.dates.push(gp.dateFrom);
                            groupedOrder.operation.push(operation);
                        }
                    }
                }
            }

            // součet časů všech totalTime produktů
            commission._info.totalTime += Number(commission[product].totalOperationTime);
            commission._info.totalWorkingTime += Number(commission[product].totalWorkingTime);
        }

        if (commission._info.done) {
            groupedOrders.push(commission);
        } else {
            groupedOrders.unshift(commission);
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
    while (current < dateTo) {
        const currentTime = current.getHours() + (current.getMinutes() / 60);

        // kontrola jestli je daná hodina větší než pracovní doba od a menší než pracovní doba do
        if (currentTime >= workHoursFrom && currentTime < workHoursTo) {
            minutesWorked++;

            if ((currentTime > 11) && (currentTime < 11.1)) {
                isAtEleven = true;
            }

            if (minutesWorked % BREAK_AFTER_MINUTES === 0) {
                breakMinutes += pause * 60;
            }
        }

        // zvětšit čas o hodinu
        current.setTime(current.getTime() + 1000 * 60);
    }

    const isLessThenSixHoursButAtEleven = (isAtEleven && (minutesWorked < BREAK_AFTER_MINUTES));
    minutesWorked = minutesWorked - breakMinutes - (isLessThenSixHoursButAtEleven ? pause * 60 : 0);
    isAtEleven = false;

    return minutesWorked;
}

export function getCorrectDateAfterDrop(start, end, newStart) {
    const START_TIME = 7; // začátek směny
    const END_TIME = 20; // konec směny
    const NIGHT_TIME = 11; // délka noci (nepracuje se)
    const SHIFT_TIME = END_TIME - START_TIME; // délka směny

    let duration = 0;
    let result = moment(newStart);

    const endDate = moment(end);
    const startDate = moment(start);
    // console.warn('Test', startDate.toDate(), endDate.toDate(), moment(newStart).toDate());
    if (startDate.isSame(endDate, 'day')) {
        duration = (endDate.hours() + (endDate.minutes() / 60)) - (startDate.hours() + (startDate.minutes() / 60));
        // console.log('Stejný den a stejný měsíc: ', startDate.isSame(endDate, 'day'));
        // console.log("same day", startDate.date());
    } else {
        let daysDiff = Math.round(moment.duration(endDate.diff(startDate)).asDays());
        duration = (endDate.hours() + (endDate.minutes() / 60)) - START_TIME;
        duration += (daysDiff - 1) * SHIFT_TIME;
        duration += END_TIME - (startDate.hours() + (startDate.minutes() / 60));
        // console.log('daysDiff', moment.duration(endDate.diff(startDate)).asDays());
        // console.log("duration", duration);
        // console.log("startDay", startDate.date(), "endDate", endDate.date(), "roszdíl", duration);
    }

    while (duration !== 0) {
        const roof = END_TIME - (result.hours() + (result.minutes() / 60));
        // console.log("roof {0}", roof, "duration {1}", duration);

        if (roof < duration) {
            result = result.add(roof + NIGHT_TIME, 'hours');
            duration -= roof;
        } else if (roof === duration) {
            result = result.add(duration, 'hours');
            duration -= roof;
            // console.log("částečně => result = ", result.toDate());
        }
        else {
            result = result.add(duration, 'hours');
            duration = 0;
            // console.log("result = {0}, duration = {1}", result.toDate(), duration);
        }
    }

    return result.toDate();
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

export function formatMinutesToTime(totalMinutes, onlyTime = true) {
    if (!totalMinutes) {
        return `0h 0m`;
    }

    let hours = 0;
    const days = Math.floor(totalMinutes / (60 * 24));
    const minutes = Math.floor(totalMinutes % 60);

    if (onlyTime) {
        hours = Math.floor(totalMinutes / 60);

        return `${hours}h ${minutes}m`;
    }

    hours = Math.floor((totalMinutes - (days * 24 * 60)) / 60);

    return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
}

export function calculateOperationTime(count, time, exchange, casting) {
    return (Number(count) * (Number(time) + Number(exchange))) + Number(casting);
}

export function calculateRemainingOperationTime(orders = [], order = {}) {
    const totalOperationTime = orders.filter((o) => {
        if ((o.orderId == order.orderId) && (o.productName == order.productName) && (o.id !== order.id) && o.operation) {
            if (o.operation.order == order.operation.order) {
                return true;
            }
        }

        return false;
    }).reduce((prev, current) => prev + current.workingHours, 0);

    let result = 0;

    if (totalOperationTime === 0) {
        return order.operation.operationTime - order.workingHours;
    } else {
        if (totalOperationTime >= order.operation.operationTime) {
            result = totalOperationTime - order.operation.operationTime;
        } else {
            result = order.operation.operationTime - totalOperationTime;
        }
    }

    return result - order.workingHours;
}

export function saveFile(path, data) {
    const d = JSON.stringify(data, null, process.env.NODE_ENV === 'development' ? 4 : 0);

    return new Promise((resolve, reject) => {
        fs.writeFile(path, d, (err) => {
            if (err) reject(err);
            resolve('Uloženo');
        });
    });
}

export function dispatchResize() {
    setTimeout(() => {
        const event = new Event('resize');
        window.dispatchEvent(event);
    }, 0);
}

export function checkForBoolean (item) {
    let res = item;

    if (checkForBoolean == undefined) {
        return false;
    }

    if (typeof item === 'string') {
        if (item === 'false') {
            res = false;
        }

        if (item === 'true') {
            res = true;
        }
    }

    return res;
}

export function setCSSVariable(key, value, suffix = '') {
    document.documentElement.style.setProperty(key, value + suffix);
    dispatchResize();
}

export function getWarningClassName(date, done) {
    if (!date || done) {
        return null;
    }

    let className = '';
    date = moment(date).startOf('day');
    const now = moment().startOf('day');
    const differenceInDays = Math.floor(moment.duration(date.diff(now)).asDays());

    if (differenceInDays <= 0) {
        className = 'product--same-day';
    } else if (differenceInDays === 1) {
        className = 'product--day-before';
    } else if (differenceInDays > 1 && differenceInDays <= 7) {
        className = 'product--week-before';
    }

    return className;
}

// https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value/4760279#4760279
export function dynamicSort(property) {
    let sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {
        let firstValue = a[property];
        let secondValue = b[property];

        if (typeof firstValue === 'string') {
            firstValue = firstValue.toLocaleLowerCase();
        }

        if (typeof secondValue === 'string') {
            secondValue = secondValue.toLocaleLowerCase();
        }

        const result = (firstValue < secondValue) ? -1 : (firstValue > secondValue) ? 1 : 0;

        return result * sortOrder;
    }
}

// https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value/4760279#4760279
export function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    const props = arguments;

    return function (obj1, obj2) {
        let i = 0;
        let result = 0;
        const numberOfProperties = props.length;

        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }

        return result;
    }
}

export const COLUMNS_VISIBILITY = {
    '1': true,
    '2': true,
    '3': true,
    '4': true,
    '5': true,
    '6': true,
};

export const FONT_SIZE = 11;

window._debug = {
    getNetMachineTime,
    formatMinutesToTime,
    calculateOperationTime,
};

/* eslint-enable eqeqeq */
