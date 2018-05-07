import moment from 'moment';
const fs = window.require('fs');

export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}

export function createGroupedOrders(orders, filterDone = false) {
    let o = [...orders];

    if (filterDone) {
        o = orders.filter((order) => order.done === false);
    }

    return o.reduce((prev, current) => {
        const orderExists = prev[current.orderId];

        if (!orderExists) {
            return {
                ...prev,
                [current.orderId]: {
                    [current.productName]: {
                        total: {
                            time: Number(current.operation.time),
                            count: Number(current.operation.count),
                        },
                        done: current.done,
                        [current.operation.order]: {
                            ...current,
                        }
                    }
                }
            };
        }

        return {
            ...prev,
            [current.orderId]: {
                ...prev[current.orderId],
                [current.productName]: {
                    ...prev[current.orderId][current.productName],
                    total: {
                        time: Number(prev[current.orderId][current.productName].total.time) + Number(current.operation.time),
                        count: Number(prev[current.orderId][current.productName].total.count) + Number(current.operation.count),
                    },
                    done: current.done,
                    [current.operation.order]: {
                        ...current
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
            // pokud nastala chyba, zobrazí se error
            if (err) {
                reject(err);
            }
    
            resolve('Uloženo.');
        });
    });
}
