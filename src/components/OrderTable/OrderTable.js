import React from 'react';
import moment from 'moment';
import { OrderRow } from './';
import {
    dispatchResize,
    createClassName,
    INPUT_DATE_TIME_FORMAT,
} from '../../utils/helpers';

import './order-table.css';

export const OPERATION_COLUMNS = ['1', '2', '3', '4', '5', '6'];

// TODO: vyseparovat řádky/bunky do komponent

const fixedHeaderCell = {
    zIndex: 20,
};

export class OrderTable extends React.PureComponent {
    static defaultProps = {
        orderList: [],
        groupedOrders: [],
        moveToDate: () => {},
        onCloseOrOpenItem: () => {},
    };

    state = {
        activeOrder: null,
        plannedFinishDateValue: '',
        editPlannedFinishDateRow: null,
    };

    editPlannedFinishDate = (key, product) => {
        const date = !!product.plannedFinishDate ? moment(product.plannedFinishDate).format(INPUT_DATE_TIME_FORMAT) : '';

        this.setState({
            plannedFinishDateValue: date,
            editPlannedFinishDateRow: key,
        }, dispatchResize);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    handleBlur = (orderId, productName) => {
        // convert input date time format to UTC format and send to App component to save it to file
        const { plannedFinishDateValue } = this.state;

        if (moment(plannedFinishDateValue).isValid()) {
            const date = moment(plannedFinishDateValue).format();
            this.props.handlePlannedDateSave(orderId, productName, date);
        } else {
            this.props.handlePlannedDateSave(orderId, productName, '');
        }

        this.setState({
            plannedFinishDateValue: '',
            editPlannedFinishDateRow: null,
        });
    }

    renderTableHead() {
        const { columnsVisibility } = this.props;

        return (
            <tr>
                <th
                    scope="col"
                    style={fixedHeaderCell}
                    className="table--orders__fixed--column table--orders__fixed--row"
                >
                    Zakázka
                </th>
                <th
                    scope="col"
                    data-column="order"
                    className="table--orders__fixed--row table--orders-100"
                >
                    Výrobek
                </th>
                <th
                    scope="col"
                    data-column="count"
                    className="table--orders__fixed--row table--orders-55"
                >
                    Ks.
                </th>
                {
                    OPERATION_COLUMNS.map((column) => {
                        // eslint-disable-next-line eqeqeq
                        if ((columnsVisibility[column] === true) || (columnsVisibility[column] == undefined)) {
                            return (
                                <th
                                    scope="col"
                                    key={column}
                                    data-column={column}
                                    className="table--orders__fixed--row table--orders-operation-column"
                                >
                                    {column}.o ks/čas
                                </th>
                            )
                        }

                        return null;
                    })
                }
                <th
                    scope="col"
                    data-column="lastWorkingDate"
                    className="table--orders__fixed--row table--orders-9_5em"
                >
                    Ukončení
                </th>
                <th
                    scope="col"
                    data-column="plannedFinishDate"
                    className={
                        createClassName([
                            'table--orders__fixed--row',
                            this.state.editPlannedFinishDateRow ? 'table--orders-finishdate-column' : 'table--orders-9_5em'
                        ])
                    }
                >
                    Termín
                </th>
                <th
                    scope="col"
                    data-column="totalOperationTime"
                    className="table--orders__fixed--row"
                >
                    Čas na výrobek
                </th>
            </tr>
        )
    }

    renderTableBody() {
        const {
            activeOrder,
            plannedFinishDateValue,
            editPlannedFinishDateRow,
        } = this.state;

        const { groupedOrders, columnsVisibility, orderList, moveToDate } = this.props;

        // vykreslit zgroupované zakázky podle orderId
        return groupedOrders.map((commission) => {
            return (
                <OrderRow
                    key={commission._info.orderId}
                    orderList={orderList}
                    commission={commission}
                    activeOrder={activeOrder}
                    columnsVisibility={columnsVisibility}
                    plannedFinishDateValue={plannedFinishDateValue}
                    editPlannedFinishDateRow={editPlannedFinishDateRow}

                    moveToDate={moveToDate}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onContextMenu={this.props.onContextMenu}
                    editPlannedFinishDate={this.editPlannedFinishDate}
                />
            )
        });
    }

    render() {
        const classNames = createClassName([
            'table',
            'table-bordered',
            this.props.className,
        ]);

        return (
            <div className="table--orders element--block shadow--light mt-3">
                <table className={classNames}>
                    <thead>
                        {this.renderTableHead()}
                    </thead>
                    <tbody>
                        {this.renderTableBody()}
                    </tbody>
                </table>
            </div>
        );
    }
}
