import React from 'react';
import isEqual from 'lodash/isEqual';
import { Tooltip } from '../Tooltip';
import { ContextMenu } from '../ContextMenu';
import {
    createClassName,
    createGroupedOrders,
    formatMinutesToTime,
    calculateOperationTime,
} from '../../helpers';

import './order-table.css';

export class OrderTable extends React.Component {
    static defaultProps = {
        events: [],
        orderList: [],
        onCloseOrder: () => {},
        filterFinishedOrders: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            orders: [],
            events: [],
            thWidth: [],
            orderList: [],
            scrollLeft: 0,
            scrollableWidth: 0,
            filterFinishedOrders: true,
        };

        this.fixedHeader = React.createRef();
        this.tableWrapper = React.createRef();
        this.scrollableDiv = React.createRef();
    }

    componentDidMount() {
        this.setDimension();
        window.addEventListener('resize', this.setDimension)
        this.scrollableDiv.current.addEventListener('scroll', this.handleScroll);

        // vytvoření sdružených zakázek po načtení komponenty
        this.saveEventsToState(this.props.events, this.props.orderList, this.props.filterFinishedOrders);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const equalEvents = isEqual(nextProps.events, prevState.events);
        const equalOrderList = isEqual(nextProps.orderList, prevState.orderList);

        // vytvoření sdružených zakázek, pokud se změní obsah nextPropsů, aby zbytečně nedocházelo ke spuštění createGroupedOrders
        // jako předtím
        if (!equalEvents || !equalOrderList || prevState.filterFinishedOrders !== nextProps.filterFinishedOrders) {
            const orders = createGroupedOrders(nextProps.events, nextProps.orderList, nextProps.filterFinishedOrders);

            return {
                orders,
                events: nextProps.events,
                orderList: nextProps.orderList,
                filterFinishedOrders: nextProps.filterFinishedOrders,
            };
        }

        return null;
    }

    saveEventsToState = (events, orderList, filterFinishedOrders) => {
        const orders = createGroupedOrders(events, orderList, filterFinishedOrders);

        this.setState({
            orders,
            events,
            orderList,
            filterFinishedOrders,
        });
    }

    handleScroll = () => {
        this.setState({
            scrollLeft: this.scrollableDiv.current.scrollLeft,
        });
    }

    setDimension = () => {
        try {
            const fixedHeader = this.fixedHeader.current;
            const fixedHeaderClientRect = fixedHeader.getBoundingClientRect();
    
            const fixedHeaderTh = Array.from(fixedHeader.getElementsByTagName('th')).map((node) => node.offsetWidth);
            const height = this.tableWrapper.current.getBoundingClientRect().height - fixedHeaderClientRect.height;
            const scrollableWidth = this.scrollableDiv.current.offsetWidth - this.scrollableDiv.current.scrollWidth;
    
            this.setState({
                height,
                scrollableWidth,
                thWidth: fixedHeaderTh,
                width: fixedHeader.width,
            });
        } catch (err) {}
    }

    renderTableBody = () => {
        const {
            orders,
            thWidth,
        } = this.state;

        const {
            orderList,
        } = this.props;

        // zgrupovat zakázky podle orderId
        return Object.keys(orders).map((key) => {
            const row = [];
            const order = orders[key];
            const o = orderList.find((_o) => _o.id === key);

            row.push(
                <ContextMenu
                    key={key}
                    buttons={[
                        {
                            label: 'Uzavřít zakázku',
                            onClick: (e) => this.props.onCloseOrder(e, key, order),
                        }
                    ]}
                    useAsTableRow={true}
                    disabled={order._info.done}
                    className={order._info.done ? 'order--finished' : null}
                >
                    <td
                        className="table--orders-first-column"
                        style={createStyleObject(thWidth[0])}
                    >
                        <span
                            style={{
                                backgroundColor: order._info.color
                            }}
                        >
                            {o.name}
                        </span>
                    </td>
                    <td className="table--orders-inner-table">
                        {
                            Object.keys(orders[key]).map((productKey) => {
                                const product = orders[key][productKey];

                                if (productKey.startsWith('_')) {
                                    return null;
                                }

                                return (
                                    <table key={productKey}>
                                        <tbody>
                                            <ContextMenu
                                                buttons={[
                                                    {
                                                        label: 'Uzavřít výrobek',
                                                        onClick: (e) => this.props.onProductClose(e, productKey, key),
                                                    }
                                                ]}
                                                useAsTableRow={true}
                                                disabled={product.done}
                                                className={product.done ? 'product--finished' : null}
                                            >
                                                <td style={createStyleObject(thWidth[1])} title={productKey}>
                                                    {productKey}
                                                </td>
                                                <td style={createStyleObject(thWidth[2])}>{product.totalCount}</td>
                                                <td
                                                    style={createStyleObject(thWidth[3])}
                                                >
                                                    {this.renderOperationCell(product['1'])}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[4])}
                                                >
                                                    {this.renderOperationCell(product['2'])}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[5])}
                                                >
                                                    {this.renderOperationCell(product['3'])}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[6])}
                                                >
                                                    {this.renderOperationCell(product['4'])}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[7])}
                                                >
                                                    {this.renderOperationCell(product['5'])}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[8])}
                                                >
                                                    {this.renderOperationCell(product['6'])}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[9])}
                                                >
                                                    {/* {product.totalTime} */}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[10])}
                                                >
                                                    {formatMinutesToTime(product.totalTime)}
                                                </td>
                                            </ContextMenu>
                                        </tbody>
                                    </table>
                                )
                            })
                        }
                    </td>
                </ContextMenu>
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
        } = operation;

        let operationTime = 0;

        if (operation.operationTime) {
            operationTime = operation.operationTime;
        } else {
            operationTime = calculateOperationTime(count, time, exchange, casting);
        }

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
                        <p>Naplánováno: DODĚLAT</p>
                        <p>Zbývá: DODĚLAT</p>
                    </div>
                }
            >
                { `${count}ks. (${formatMinutesToTime(operationTime)})` }
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
            divStyle.height = this.state.height;
        }

        return (
            <div
                className="table--orders element--block shadow--light mt-3"
                ref={this.tableWrapper}
            >
                <table
                    ref={this.fixedHeader}
                    className={classNamesHeader}
                    style={{
                        width: `calc(100% - ${this.state.scrollableWidth}px)`,
                        transform: `translateX(${this.state.scrollLeft * -1}px)`
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                scope="col"
                                className="table--orders-first-column"
                            >
                                Zakázka
                            </th>
                            <th scope="col">Název výrobku</th>
                            <th scope="col">Počet kusů</th>
                            <th scope="col">1.o ks/čas (napl)</th>
                            <th scope="col">2.o ks/čas (napl)</th>
                            <th scope="col">3.o ks/čas (napl)</th>
                            <th scope="col">4.o ks/čas (napl)</th>
                            <th scope="col">5.o ks/čas (napl)</th>
                            <th scope="col">6.o ks/čas (napl)</th>
                            <th scope="col">Napl. čas na zakázku</th>
                            <th scope="col">Čas na zakázku</th>
                        </tr>
                    </thead>
                </table>

                <div
                    style={divStyle}
                    ref={this.scrollableDiv}
                    className="table--scrollable"
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
        );
    } 
}

function createStyleObject(width) {
    return {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: `${width || 0}px`,
        maxWidth: `${width || 0}px`,
    };
}
