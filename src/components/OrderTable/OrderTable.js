import React from 'react';
import moment from 'moment';
import { Tooltip } from '../Tooltip';
import { ContextMenu } from '../ContextMenu';
import {
    createClassName,
    DATA_DATE_FORMAT,
    createStyleObject,
    formatMinutesToTime,
    calculateOperationTime,
} from '../../helpers';

import './order-table.css';

const countStyle = {
    width: 90,
    minWidth: 90,
};

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

    setDimension = () => {
        const { groupedOrders } = this.props;

        try {
            const fixedHeader = this.fixedHeader.current;
            const fixedHeaderClientRect = fixedHeader.getBoundingClientRect();
    
            const fixedHeaderTh = Array.from(fixedHeader.getElementsByTagName('th')).map((node) => {
                return Number(parseFloat(window.getComputedStyle(node).width));
            });
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
                rowHeights,
                thWidth: fixedHeaderTh,
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
                className="two-columns--left-side calendar--left-side"
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
                                    onClose={() => this.setState({ activeOrder: null })}
                                    onOpen={() => this.setState({ activeOrder: orderId })}
                                >
                                    <p style={{ backgroundColor: color, }}>
                                        { o.name }
                                    </p>
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
        } = this.props;

        // vykreslit zgroupované zakázky podle orderId
        return groupedOrders.map((commission) => {
            const row = [];

            const orderKeys = Object.keys(commission);
            const { orderId, done } = commission._info;
            // sečíst všechny sloupce v tabulce kromě prvního a posledního a nastavit jako šířku pro total row
            const totalRowWidth = thWidth.slice(0, thWidth.length - 2).reduce((prev, current) => prev + current, 0);

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
                                                    <td style={createStyleObject(thWidth[0])} title={objKey}>
                                                        {objKey}
                                                    </td>
                                                    <td style={createStyleObject(thWidth[1])}>{product.totalCount}</td>
                                                    <td
                                                        style={createStyleObject(thWidth[2])}
                                                    >
                                                        {this.renderOperationCell(product['1'])}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[3])}
                                                    >
                                                        {this.renderOperationCell(product['2'])}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[4])}
                                                    >
                                                        {this.renderOperationCell(product['3'])}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[5])}
                                                    >
                                                        {this.renderOperationCell(product['4'])}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[6])}
                                                    >
                                                        {this.renderOperationCell(product['5'])}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[7])}
                                                    >
                                                        {this.renderOperationCell(product['6'])}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[8])}
                                                    >
                                                        {
                                                            product.finishDate
                                                            ? moment(product.finishDate).format(DATA_DATE_FORMAT)
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[9])}
                                                    >
                                                        {formatMinutesToTime(product.totalWorkingTime)}
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth[10])}
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
                    <tr
                        data-order={orderId}
                        className={
                            createClassName([
                                'row--total',
                                done ? 'order--finished' : null,
                                commission._info.done ? 'order--finished' : null,
                                activeOrder == orderId ? 'context-menu--open' : null,
                            ])
                        }
                    >
                        <td className="table--orders-inner-table">
                            <table className="width--100">
                                <tbody>
                                    <tr>
                                        <td style={createStyleObject(totalRowWidth)}>
                                            <strong>Celkový čas na zakázku</strong>
                                        </td>
                                        <td style={createStyleObject(thWidth[9])}>
                                            <strong>{formatMinutesToTime(commission._info.totalWorkingTime)}</strong>
                                        </td>
                                        <td style={createStyleObject(thWidth[10])}>
                                            <strong>{formatMinutesToTime(commission._info.totalTime)}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </React.Fragment>
            );

            return row;
        });
    }

    renderOperationCell = (operation) => {
        if (!operation) {
            return '-';
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
                { `${count}ks. (${formatMinutesToTime(operationTime)}) [${formatMinutesToTime(workingHoursForOperation)}] {${sign === -1 ? '+' : '-'}${formatMinutesToTime(Math.abs(calculateHoursRemainder))}}` }
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
                                <th scope="col">Název výrobku</th>
                                <th scope="col" style={countStyle}>
                                    Počet ks.
                                </th>
                                <th scope="col">1.o ks/čas (napl)</th>
                                <th scope="col">2.o ks/čas (napl)</th>
                                <th scope="col">3.o ks/čas (napl)</th>
                                <th scope="col">4.o ks/čas (napl)</th>
                                <th scope="col">5.o ks/čas (napl)</th>
                                <th scope="col">6.o ks/čas (napl)</th>
                                <th scope="col">Ukončení výroby</th>
                                <th scope="col">Naplánovaný čas</th>
                                <th scope="col">Čas na výrobek</th>
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
