import React from 'react';
import moment from 'moment';
import {
    createClassName, 
    DATA_DATE_FORMAT,
    formatMinutesToTime,
    calculateOperationTime,
} from '../../utils/helpers';

export class OrderCard extends React.Component {
    static defaultProps = {
        order: {},
        machines: [],
        orderList: [],
    };

    render() {
        const {
            order,
            machines,
            orderList,
        } = this.props;

        let totalMinutes = 0;
        const classNames = createClassName([
            order ? 'card--active' : null,
            'card shadow--light calendar--event-card',
        ]);
        const mainOrder = orderList.find((o) => o.id === (order && order.orderId));
        const machine = machines.find((machine) => machine.id === (order && order.machine));

        try {
            if (order.operation && order.operation.operationTime) {
                totalMinutes = order.operation.operationTime;
            } else {
                const { count, time, exchange, casting } = order.operation;
                totalMinutes = calculateOperationTime(count, time, exchange, casting);
            }
        } catch (err) {}

        const remainder = totalMinutes - order.workingHours;
        const sign = Math.sign(remainder);

        return (
            <div
                style={{
                    borderTop: `10px solid ${mainOrder && mainOrder.color}`
                }}
                className={classNames}
            >
                <div className="card-body">
                {
                    order
                    ? <React.Fragment>
                        <h5 className="card-title">
                            <strong>{ mainOrder ? mainOrder.name : 'Bez zakázky' }</strong>
                            <strong className="text-muted">{ order.productName ? ` / ${order.productName}` : '' }</strong>
                        </h5>
                        <h6 className="card-text">
                            <strong>{ machine ? machine.name : 'Bez stroje' }</strong>
                            <strong className="text-muted">
                                { order.worker ? ` / ${order.worker}` : ''}
                            </strong>
                        </h6>
                        {
                            order.operation
                            ? <p className="card-text">
                                <strong>{ order.operation.order }. operace</strong>
                                { order.operation.note ? ` - ${order.operation.note}` : '' }
                            </p>
                            : null
                        }
                        <table>
                            <tbody>
                                {
                                    order.operation
                                    ? <React.Fragment>
                                        <tr>
                                            <td>Počet kusů: &nbsp;</td>
                                            <td>
                                                <p className="card-text">
                                                    { order.operation.count }ks.
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Čas na kus: &nbsp;</td>
                                            <td>
                                                <p className="card-text">
                                                    { order.operation.time }min.
                                                </p>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                    : null
                                }
                                <tr>
                                    <td>Začátek: &nbsp;</td>
                                    <td>
                                        <p className="card-text">
                                            { moment(order.dateFrom).format(DATA_DATE_FORMAT) }
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Konec: &nbsp;</td>
                                    <td>
                                        <p className="card-text">
                                            { moment(order.dateTo).format(DATA_DATE_FORMAT) }
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Čas na výrobu: &nbsp;</td>
                                    <td>
                                        <p className="card-text">
                                            { formatMinutesToTime(totalMinutes) }
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Naplánováné: &nbsp;</td>
                                    <td>
                                        <p className="card-text">
                                            { formatMinutesToTime(order.workingHours) }
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Rozdíl: &nbsp;</td>
                                    <td>
                                        <p className="card-text">
                                            <strong
                                                className={createClassName([
                                                    (sign === -1) ? 'text-primary' : 'text-danger',
                                                ])}
                                            >
                                                { sign < 0 ? '+' : (sign === 0 ? '' : '-') }{ formatMinutesToTime(Math.abs(remainder)) }
                                            </strong>
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="card-text">
                            {order.note}
                        </p>
                    </React.Fragment>
                    : null
                }
                </div>
            </div>
        );
    }
}
