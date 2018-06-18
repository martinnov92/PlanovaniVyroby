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
        groupedOrders: [],
    };

    render() {
        const {
            order,
            machines,
            orderList,
            groupedOrders,
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

        const groupedOrder = groupedOrders.find((o) => o._info.orderId === order.orderId);
        const groupedOrderProduct = groupedOrder[order.productName];

        // výpočet zbývajícího času z groupovaných zakázek
        let remainderCurrentProduct = 0;
        if (groupedOrderProduct) {
            const groupedOperation = order.operation ? groupedOrderProduct.operation.find((operation) => operation.order == order.operation.order) : null;

            if (groupedOperation) {
                const operationTime =
                    groupedOperation.operationTime
                    ? groupedOperation.operationTime
                    : calculateOperationTime(order.operation.count, order.operation.time, order.operation.exchange, order.operation.casting);
                remainderCurrentProduct = operationTime - groupedOperation.workingHoursForOperation;
            }
        }

        const remainderCurrentEvent = totalMinutes - order.workingHours;
        const signCurrentEvent = Math.sign(remainderCurrentEvent);
        const signCurrentOrderProduct = Math.sign(remainderCurrentProduct);

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
                            ? <React.Fragment>
                                <p className="card-text">
                                    <strong>{ order.operation.order }. operace</strong>
                                    { order.operation.note ? ` - ${order.operation.note}` : '' }
                                </p>

                                <table className="table table-sm">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <p className="card-text">
                                                    { order.operation.count }ks.
                                                </p>
                                            </td>
                                            <td>{` / `}</td>
                                            <td>
                                                <p className="card-text">
                                                    { order.operation.time }min.
                                                </p>
                                            </td>
                                            <td>{` / `}</td>
                                            <td>
                                                <p className="card-text">
                                                    { order.operation.exchange }min.
                                                </p>
                                            </td>
                                            <td>{` / `}</td>
                                            <td>
                                                <p className="card-text">
                                                    { order.operation.casting }min.
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </React.Fragment>
                            : null
                        }
                        <table>
                            <tbody>
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
                                    <td>Naplánováno: &nbsp;</td>
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
                                                    (signCurrentEvent <= 0) ? 'text-primary' : 'text-danger',
                                                ])}
                                            >
                                                { signCurrentEvent < 0 ? '+' : (signCurrentEvent === 0 ? '' : '-') }{ formatMinutesToTime(Math.abs(remainderCurrentEvent)) }
                                            </strong>
                                            {` / `}
                                            <strong
                                                className={createClassName([
                                                    (signCurrentOrderProduct <= 0) ? 'text-primary' : 'text-danger',
                                                ])}
                                            >
                                                { signCurrentOrderProduct < 0 ? '+' : (signCurrentOrderProduct === 0 ? '' : '-') }{ formatMinutesToTime(Math.abs(remainderCurrentProduct)) }
                                            </strong>
                                            {` (celkový rozdíl)`}
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
