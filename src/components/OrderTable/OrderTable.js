import React from 'react';
import moment from 'moment';
import { Tooltip } from '../Tooltip';
import { ContextMenu } from '../ContextMenu';
import {
    createClassName,
    createStyleObject,
    formatMinutesToTime,
    calculateOperationTime,
    DATA_DATE_FORMAT,
} from '../../utils/helpers';

import './order-table.css';

export class OrderTable extends React.Component {
    static defaultProps = {
        orderList: [],
        groupedOrders: [],
        onCloseOrder: () => {},
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

    handleOpenContext = (orderId) => {
        this.setState({
            activeOrder: orderId,
        });
    }

    handleCloseContext = () => {
        this.setState({
            activeOrder: null,
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
                        groupedOrders.map((commission, i) => {
                            const { orderId, done, color } = commission._info;
                            const o = orderList.find((_o) => _o.id === orderId);

                            return (
                                <ContextMenu
                                    key={orderId}
                                    buttons={[
                                        {
                                            label: 'Uzavřít zakázku',
                                            onClick: (e) => this.props.onCloseOrder(e, null, orderId, false),
                                        }
                                    ]}
                                    disabled={done}
                                    style={{
                                        borderTop: 0,
                                        height: `${rowHeights[i]}px`,
                                        borderBottom: '2px solid var(--calendarDayBorderColor)',
                                    }}
                                    className={createClassName([
                                        'left-side--item',
                                        done ? 'order--finished' : null,
                                    ])}
                                    onClose={this.handleCloseContext}
                                    onOpen={() => this.handleOpenContext(orderId)}
                                >
                                    <Tooltip
                                        className="table--orders-tooltip"
                                        title={
                                            <div>
                                                <p>
                                                    Naplánováno: &nbsp;
                                                    <strong>{formatMinutesToTime(commission._info.totalWorkingTime)}</strong>
                                                </p>
                                                <p>
                                                    Celkový čas: &nbsp;
                                                    <strong>{formatMinutesToTime(commission._info.totalTime)}</strong>
                                                </p>

                                                <hr className="bg-white" />


                                            </div>
                                        }
                                    >
                                        <p style={{ backgroundColor: color, }}>
                                            { o ? o.name : '' }
                                        </p>
                                    </Tooltip>
                                </ContextMenu>
                            );
                        })
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
        } = this.state;

        const {
            groupedOrders,
            columnsVisibility,
        } = this.props;

        // vykreslit zgroupované zakázky podle orderId
        return groupedOrders.map((commission) => {
            const row = [];

            const orderKeys = Object.keys(commission);
            const { orderId, done } = commission._info;

            row.push(
                <React.Fragment
                    key={orderId}
                >
                    <tr
                        className={
                            createClassName([
                                done ? 'order--finished' : null,
                                activeOrder == orderId ? 'context-menu--open' : null,
                            ])
                        }
                        data-order={orderId}
                    >
                        <td className="table--orders-inner-table">
                            {
                                orderKeys.map((objKey, i) => {
                                    const product = commission[objKey];

                                    if (objKey.startsWith('_')) {
                                        return null;
                                    }

                                    return (
                                        <table key={objKey}>
                                            <tbody>
                                                <ContextMenu
                                                    buttons={[
                                                        {
                                                            label: 'Uzavřít výrobek',
                                                            onClick: (e) => this.props.onProductClose(e, objKey, orderId),
                                                        }
                                                    ]}
                                                    useAsTableRow={true}
                                                    disabled={product.done}
                                                    className={product.done ? 'product--finished' : null}
                                                >
                                                    <td
                                                        title={objKey}
                                                        style={createStyleObject(thWidth['order'], false)}
                                                    >
                                                        {objKey}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth['count'], false)}
                                                    >
                                                        {product.totalCount}
                                                    </td>
                                                    {
                                                        (columnsVisibility['1'] === true) || (columnsVisibility['1'] == undefined)
                                                        ? <td
                                                            style={createStyleObject(thWidth['1'])}
                                                        >
                                                            {this.renderOperationCell(product['1'])}
                                                        </td>
                                                        : null
                                                    }
                                                    {
                                                        (columnsVisibility['2'] === true) || (columnsVisibility['2'] == undefined)
                                                        ? <td
                                                            style={createStyleObject(thWidth['2'])}
                                                        >
                                                            {this.renderOperationCell(product['2'])}
                                                        </td>
                                                        : null
                                                    }
                                                    {
                                                        (columnsVisibility['3'] === true) || (columnsVisibility['3'] == undefined)
                                                        ? <td
                                                            style={createStyleObject(thWidth['3'])}
                                                        >
                                                            {this.renderOperationCell(product['3'])}
                                                        </td>
                                                        : null
                                                    }
                                                    {
                                                        (columnsVisibility['4'] === true) || (columnsVisibility['4'] == undefined)
                                                        ? <td
                                                            style={createStyleObject(thWidth['4'])}
                                                        >
                                                            {this.renderOperationCell(product['4'])}
                                                        </td>
                                                        : null
                                                    }
                                                    {
                                                        (columnsVisibility['5'] === true) || (columnsVisibility['5'] == undefined)
                                                        ? <td
                                                            style={createStyleObject(thWidth['5'])}
                                                        >
                                                            {this.renderOperationCell(product['5'])}
                                                        </td>
                                                        : null
                                                    }
                                                    {
                                                        (columnsVisibility['6'] === true) || (columnsVisibility['6'] == undefined)
                                                        ? <td
                                                            style={createStyleObject(thWidth['6'])}
                                                        >
                                                            {this.renderOperationCell(product['6'])}
                                                        </td>
                                                        : null
                                                    }
                                                    <td
                                                        style={createStyleObject(thWidth['lastWorkingDate'], false)}
                                                    >
                                                        {
                                                            product.lastWorkingDate
                                                            ? moment(product.lastWorkingDate).format(DATA_DATE_FORMAT)
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth['totalWorkingTime'], false)}
                                                    >
                                                        {formatMinutesToTime(product.totalWorkingTime)}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth['totalOperationTime'], false)}
                                                    >
                                                        {formatMinutesToTime(product.totalOperationTime)}
                                                    </td>
                                                </ContextMenu>
                                            </tbody>
                                        </table>
                                    )
                                })
                            }
                        </td>
                    </tr>
                </React.Fragment>
            );

            return row;
        });
    }

    renderOperationCell = (operation) => {
        if (!operation) {
            return <div> - </div>;
        }

        const {
            time,
            count,
            casting,
            exchange,
            workingHoursForOperation = 0,
        } = operation;

        let operationTime = 0;

        if (operation.operationTime) {
            operationTime = operation.operationTime;
        } else {
            operationTime = calculateOperationTime(count, time, exchange, casting);
        }

        const calculateHoursRemainder = operationTime - workingHoursForOperation;
        const sign = Math.sign(calculateHoursRemainder);

        return (
            <Tooltip
                className={`cursor--default`}
                title={
                    <div>
                        <p>Čas na kus: {time} min.</p>
                        <p>Výměna: {exchange} min.</p>

                        <hr className="bg-white" />
                        <p>Nahazování: {casting} min.</p>
                        <hr className="bg-white" />

                        <p>Celkem na operaci: {formatMinutesToTime(operationTime)}</p>
                        <p>Naplánováno: {formatMinutesToTime(workingHoursForOperation)}</p>
                        <p>Zbývá: {sign === -1 ? '+' : (sign === 0 ? '' : '-')}{formatMinutesToTime(Math.abs(calculateHoursRemainder))}</p>
                    </div>
                }
            >
                <strong>{count} ks. </strong>
                <span>({formatMinutesToTime(operationTime)})</span>
                <span>[{formatMinutesToTime(workingHoursForOperation)}]</span>
                {
                    sign !== 0
                    ? <span
                        className={createClassName([
                            sign === -1 ? 'text-primary' : 'text-danger',
                        ])}
                    >
                        {`{`}{sign === -1 ? '+' : '-'}{formatMinutesToTime(Math.abs(calculateHoursRemainder))}{`}`}
                    </span>
                    : '{' + formatMinutesToTime(Math.abs(calculateHoursRemainder)) + '}'
                }
            </Tooltip>
        );
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
                                    (columnsVisibility['1'] === true) || (columnsVisibility['1'] == undefined)
                                    ? <th
                                        scope="col"
                                        data-column="1"
                                        className="table--orders-operation-column"
                                    >
                                        1.o ks/čas
                                    </th>
                                    : null
                                }
                                {
                                    (columnsVisibility['2'] === true) || (columnsVisibility['2'] == undefined)
                                    ? <th
                                        scope="col"
                                        data-column="2"
                                        className="table--orders-operation-column"
                                    >
                                        2.o ks/čas
                                    </th>
                                    : null
                                }
                                {
                                    (columnsVisibility['3'] === true) || (columnsVisibility['3'] == undefined)
                                    ? <th
                                        scope="col"
                                        data-column="3"
                                        className="table--orders-operation-column"
                                    >
                                        3.o ks/čas
                                    </th>
                                    : null
                                }
                                {
                                    (columnsVisibility['4'] === true) || (columnsVisibility['4'] == undefined)
                                    ? <th
                                        scope="col"
                                        data-column="4"
                                        className="table--orders-operation-column"
                                    >
                                        4.o ks/čas
                                    </th>
                                    : null
                                }
                                {
                                    (columnsVisibility['5'] === true) || (columnsVisibility['5'] == undefined)
                                    ? <th
                                        scope="col"
                                        data-column="5"
                                        className="table--orders-operation-column"
                                    >
                                        5.o ks/čas
                                    </th>
                                    : null
                                }
                                {
                                    (columnsVisibility['6'] === true) || (columnsVisibility['6'] == undefined)
                                    ? <th
                                        scope="col"
                                        data-column="6"
                                        className="table--orders-operation-column"
                                    >
                                        6.o ks/čas
                                    </th>
                                    : null
                                }
                                <th
                                    scope="col"
                                    data-column="lastWorkingDate"
                                    className="table--orders-125"
                                >
                                    Ukončení
                                </th>
                                <th
                                    scope="col"
                                    data-column="totalWorkingTime"
                                >
                                    Naplánováno
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
