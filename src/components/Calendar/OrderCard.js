import React from 'react';
import moment from 'moment';
import {
    createClassName, 
    DATA_DATE_FORMAT,
    formatMinutesToTime,
} from '../../helpers';

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

        if (order.hasOwnProperty('operation')) {
            totalMinutes = order.operation.time * order.operation.count;
        }

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
                            <strong>{mainOrder ? mainOrder.id : 'Bez zakázky'}</strong>
                        </h5>
                        <h6 className="card-subtitle mb-2">
                            <strong>{order.productName}</strong>
                        </h6>
                        <h6 className="card-subtitle mb-2 text-muted">
                            <strong>{order.worker}</strong>
                        </h6>
                        <p className="card-text">
                            {machine ? machine.name : 'Bez stroje'}
                        </p>
                        {
                            order.operation
                            ? <React.Fragment>
                                <p className="card-text">
                                    {order.operation.order}. operace
                                </p>
                                <p className="card-text">
                                    {order.operation.count}ks
                                </p>
                                <p className="card-text">
                                    {order.operation.time}min/kus
                                </p>
                            </React.Fragment>
                            : null
                        }
                        <p className="card-text">
                            Celkem: {totalMinutes}min ({(totalMinutes / 60).toFixed(1)}hod)
                        </p>
                        <p className="card-text">
                            {order.note}
                        </p>
                        <p className="card-text">
                            {moment(order.dateFrom).format(DATA_DATE_FORMAT)}
                            {" - "}
                            {moment(order.dateTo).format(DATA_DATE_FORMAT)}
                            <strong> ({formatMinutesToTime(order.workingHours)})</strong>
                        </p>
                    </React.Fragment>
                    : null
                }
                </div>
            </div>
        );
    }
}
