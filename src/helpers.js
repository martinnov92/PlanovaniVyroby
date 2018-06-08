import Moment from 'moment';
import groupBy from 'lodash/groupBy';
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
            commission[product] = {
                totalCount: 0,
                totalWorkingTime: 0,
                totalOperationTime: 0,
            };

            let groupedProduct = groupedByProducts[order][product];
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
                const workingHoursForOperation = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, };
                const groupedOrder = commission[product];
                groupedOrder.done = (groupedProduct[0] && groupedProduct[0].hasOwnProperty('done')) ? groupedProduct[0].done : false;
                groupedOrder.finishDate = (groupedProduct[0] && groupedProduct[0].hasOwnProperty('finishDate')) ? groupedProduct[0].finishDate : null;

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
                     *          1: {
                     *              casting: 2,
                     *              count: 2,
                     *              time: 2,
                     *              order: 1,
                     *              operationTime: CELKOVÝ ČAS OPERACE
                     *          },
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
                        if (groupedOrder[gp.operation.order]) {
                            // pokud ano zkontroluj, jestli je jedna operace větší než druhá
                            const used = groupedOrder[gp.operation.order];
                            const { time, casting, exchange, count, operationTime, } = gp.operation;

                            if ((Number(time) > Number(used.time)) || (Number(casting) > Number(used.casting)) || (Number(exchange) > Number(used.exchange)) || (Number(count) > Number(used.count)) || (Number(operationTime) > Number(used.operationTime))) {
                                // a pokud je, tak nastav tu větší jako hlavní
                                groupedOrder[gp.operation.order] = {
                                    ...gp.operation,
                                    workingHoursForOperation: workingHoursForOperation[gp.operation.order]
                                };
                            }
                        } else {
                            groupedOrder[gp.operation.order] = {
                                ...gp.operation,
                                workingHoursForOperation: workingHoursForOperation[gp.operation.order]
                            };
                        }
                    }
                }
            }

            // součet časů všech totalTime produktů
            commission._info.totalTime += Number(commission[product].totalOperationTime);
        }

        groupedOrders.push(commission);
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

export function createStyleObject(width) {
    return {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: `${width || 0}px`,
        maxWidth: `${width || 0}px`,
    };
}

window._mn = {
    getNetMachineTime,
    formatMinutesToTime,
    calculateOperationTime,
};
