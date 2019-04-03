import React from 'react';
import moment from 'moment';
import { OrderName, OrderRow } from './';
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

    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            thWidth: [],
            scrollTop: 0,
            scrollLeft: 0,
            rowHeights : [],
            activeOrder: null,
            fixedHeaderHeight: 0,
            plannedFinishDateValue: '',
            editPlannedFinishDateRow: null,
        };

        this.tableWrapper = React.createRef();
    }

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

    renderFixedColumn = () => {
        const { rowHeights, fixedHeaderHeight, } = this.state;
        const {
            orderList,
            groupedOrders,
        } = this.props;

        return (
            <div
                className="two-columns--left-side"
            >
                <div
                    className="column--fixed-header"
                    style={{
                        height: `${fixedHeaderHeight}px`,
                    }}
                >
                    <p>Zakázka</p>
                </div>

                <div
                    className="table--orders-first-column lock--scroll"
                    style={{
                        height: `calc(100% - ${fixedHeaderHeight}px)`,
                    }}
                >
                    <div
                        style={{
                            marginTop: 1,
                            transform: `translate3d(0, ${(this.state.scrollTop * -1)}px, 0)`,
                        }}
                    >
                    {
                        groupedOrders.map((commission, i) => (
                            <OrderName
                                i={i}
                                orderList={orderList}
                                commission={commission}
                                rowHeights={rowHeights}
                                key={commission._info.orderId}
                                onContextMenu={this.props.onContextMenu}
                            />
                        ))
                    }
                    </div>
                </div>
            </div>
        );
    }

    renderTableBody = () => {
        const {
            thWidth,
            activeOrder,
            plannedFinishDateValue,
            editPlannedFinishDateRow,
        } = this.state;

        const { groupedOrders, columnsVisibility, moveToDate } = this.props;

        // vykreslit zgroupované zakázky podle orderId
        return groupedOrders.map((commission) => (
            <OrderRow
                key={commission._info.orderId}
                thWidth={thWidth}
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
        ));
    }

    render() {
        const { columnsVisibility } = this.props;

        const classNames = createClassName([
            'table',
            'table-bordered',
            this.props.className,
        ]);

        return (
            <div className="table--orders element--block shadow--light mt-3">
                <table className={classNames}>
                    <thead>
                        <tr>
                            <th
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
                    </thead>
                    <tbody>
                        {this.renderTableBody()}
                    </tbody>
                </table>
            </div>
        );
    }

    // render() {
    //     const divStyle = {};
    //     const tableStyle = {};

    //     const classNames = createClassName([
    //         'table',
    //         'table-bordered',
    //         this.props.className,
    //     ]);

    //     const classNamesHeader = createClassName([
    //         'table',
    //         'table-bordered',
    //         'table-header--fixed',
    //     ]);

    //     if (this.state.height > 0) {
    //         tableStyle.width = this.state.width;
    //         divStyle.height = `${this.state.height}px`;
    //     }

    //     const { columnsVisibility } = this.props;

    //     return (
    //         <div
    //             className="two-columns--one-fixed table--orders element--block shadow--light mt-3"
    //             ref={this.tableWrapper}
    //         >
    //             { this.renderFixedColumn() }

    //             <div className="two-columns--right-side lock--scroll">
    //                 <table
    //                     ref={this.fixedHeader}
    //                     className={classNamesHeader}
    //                     style={{
    //                         transform: `translate3d(${this.state.scrollLeft * -1}px, 0, 0)`
    //                     }}
    //                 >
    //                     <thead>
    //                         <tr>
    //                             <th
    //                                 scope="col"
    //                                 data-column="order"
    //                                 className="table--orders-100"
    //                             >
    //                                 Výrobek
    //                             </th>
    //                             <th
    //                                 scope="col"
    //                                 data-column="count"
    //                                 className="table--orders-55"
    //                             >
    //                                 Ks.
    //                             </th>
    //                             {
    //                                 OPERATION_COLUMNS.map((column) => {
    //                                     // eslint-disable-next-line eqeqeq
    //                                     if ((columnsVisibility[column] === true) || (columnsVisibility[column] == undefined)) {
    //                                         return (
    //                                             <th
    //                                                 scope="col"
    //                                                 key={column}
    //                                                 data-column={column}
    //                                                 className="table--orders-operation-column"
    //                                             >
    //                                                 {column}.o ks/čas
    //                                             </th>
    //                                         )
    //                                     }

    //                                     return null;
    //                                 })
    //                             }
    //                             <th
    //                                 scope="col"
    //                                 data-column="lastWorkingDate"
    //                                 className="table--orders-9_5em"
    //                             >
    //                                 Ukončení
    //                             </th>
    //                             <th
    //                                 scope="col"
    //                                 data-column="plannedFinishDate"
    //                                 className={this.state.editPlannedFinishDateRow ? 'table--orders-finishdate-column' : 'table--orders-9_5em'}
    //                             >
    //                                 Termín
    //                             </th>
    //                             <th
    //                                 scope="col"
    //                                 data-column="totalOperationTime"
    //                             >
    //                                 Čas na výrobek
    //                             </th>
    //                         </tr>
    //                     </thead>
    //                 </table>

    //                 <div
    //                     style={divStyle}
    //                     ref={this.scrollableDiv}
    //                     className={
    //                         createClassName([
    //                             'table--scrollable',
    //                             this.state.activeOrder ? 'lock--scroll': null,
    //                         ])
    //                     }
    //                 >
    //                     <table
    //                         className={classNames}
    //                         style={tableStyle}
    //                     >
    //                         <tbody>
    //                             {this.renderTableBody()}
    //                         </tbody>
    //                     </table>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // } 
}
