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

export class OrderTable extends React.Component {
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

        this.fixedHeader = React.createRef();
        this.tableWrapper = React.createRef();
        this.scrollableDiv = React.createRef();
    }

    componentDidMount() {
        this.setDimension();
        window.addEventListener('resize', this.setDimension);
        this.scrollableDiv.current.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        this.setState({
            scrollTop: this.scrollableDiv.current.scrollTop,
            scrollLeft: this.scrollableDiv.current.scrollLeft,
        });
    }

    setDimension = () => {
        const { groupedOrders } = this.props;

        try {
            const fixedHeader = this.fixedHeader.current;
            const fixedHeaderClientRect = fixedHeader.getBoundingClientRect();
            const fixedHeaderTh = Array.from(fixedHeader.getElementsByTagName('th'));
            const thWidth = {};

            for (let column of fixedHeaderTh) {
                thWidth[column.dataset.column] = Number(parseFloat(window.getComputedStyle(column).width));
            }

            const height = this.tableWrapper.current.getBoundingClientRect().height - fixedHeaderClientRect.height;

            const rowHeights = groupedOrders.map((commission) => {
                const rows = Array.from(this.scrollableDiv.current.querySelectorAll(`[data-order="${commission._info.orderId}"]`));

                return rows.reduce((acc, current) => {
                    if (current) {
                        return Number(parseFloat(window.getComputedStyle(current).height)) + acc;
                    }
    
                    return acc;
                }, 0);
            });

            this.setState({
                height,
                thWidth,
                rowHeights,
                width: fixedHeader.width,
                fixedHeaderHeight: fixedHeaderClientRect.height,
            });
        } catch (err) {}
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
        const divStyle = {};
        const tableStyle = {};

        const classNames = createClassName([
            'table',
            'table-bordered',
            this.props.className,
        ]);

        const classNamesHeader = createClassName([
            'table',
            'table-bordered',
            'table-header--fixed',
        ]);

        if (this.state.height > 0) {
            tableStyle.width = this.state.width;
            divStyle.height = `${this.state.height}px`;
        }

        const { columnsVisibility } = this.props;

        return (
            <div
                className="two-columns--one-fixed table--orders element--block shadow--light mt-3"
                ref={this.tableWrapper}
            >
                { this.renderFixedColumn() }

                <div className="two-columns--right-side lock--scroll">
                    <table
                        ref={this.fixedHeader}
                        className={classNamesHeader}
                        style={{
                            transform: `translate3d(${this.state.scrollLeft * -1}px, 0, 0)`
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    data-column="order"
                                    className="table--orders-100"
                                >
                                    Výrobek
                                </th>
                                <th
                                    scope="col"
                                    data-column="count"
                                    className="table--orders-55"
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
                                                    className="table--orders-operation-column"
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
                                    className="table--orders-9_5em"
                                >
                                    Ukončení
                                </th>
                                <th
                                    scope="col"
                                    data-column="plannedFinishDate"
                                    className={this.state.editPlannedFinishDateRow ? 'table--orders-finishdate-column' : 'table--orders-9_5em'}
                                >
                                    Termín
                                </th>
                                <th
                                    scope="col"
                                    data-column="totalOperationTime"
                                >
                                    Čas na výrobek
                                </th>
                            </tr>
                        </thead>
                    </table>

                    <div
                        style={divStyle}
                        ref={this.scrollableDiv}
                        className={
                            createClassName([
                                'table--scrollable',
                                this.state.activeOrder ? 'lock--scroll': null,
                            ])
                        }
                    >
                        <table
                            className={classNames}
                            style={tableStyle}
                        >
                            <tbody>
                                {this.renderTableBody()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } 
}
