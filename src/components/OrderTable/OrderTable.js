import React from 'react';
import isEqual from 'lodash/isEqual';
import { Tooltip } from '../Tooltip';
import { ContextMenu } from '../ContextMenu';
import { createClassName, createGroupedOrders, formatMinutesToTime } from '../../helpers';

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
            thWidth: [],
            scrollLeft: 0,
            scrollableWidth: 0,
        };

        this.fixedHeader = React.createRef();
        this.tableWrapper = React.createRef();
        this.scrollableDiv = React.createRef();
    }

    componentDidMount() {
        this.setDimension();
        window.addEventListener('resize', this.setDimension)
        this.scrollableDiv.current.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        this.setState({
            scrollLeft: this.scrollableDiv.current.scrollLeft,
        });
    }

    setDimension = () => {
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
    }

    renderTableBody = (events) => {
        const {
            thWidth,
        } = this.state;

        const {
            orderList,
            filterFinishedOrders,
        } = this.props;

        // zgrupovat zakázky podle orderId
        const orders = createGroupedOrders(events, orderList, filterFinishedOrders);
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
                                            <tr>
                                                <td style={createStyleObject(thWidth[1])} title={productKey}>
                                                    {productKey}
                                                </td>
                                                <td style={createStyleObject(thWidth[2])}>{product.totalCount}</td>
                                                <td
                                                    style={createStyleObject(thWidth[3])}
                                                >
                                                    {
                                                        product['1']
                                                        ? <Tooltip
                                                            className={`cursor--default`}
                                                            title={`Čas na kus: ${product['1'] ? product['1'].time : '-'} min.\nNahazování: ${product['1'] ? product['1'].casting : '-'} min.\nVýměna: ${product['1'] ? product['1'].exchange : '-'} min.`}
                                                        >
                                                            {product['1'].count}ks. ({product['1'].time} min.)
                                                        </Tooltip>
                                                        : '-'
                                                    }
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[4])}
                                                >
                                                    {
                                                        product['2']
                                                        ? <Tooltip
                                                            className={`cursor--default`}
                                                            title={`Čas na kus: ${product['2'] ? product['2'].time : '-'} min.\nNahazování: ${product['2'] ? product['2'].casting : '-'} min.\nVýměna: ${product['2'] ? product['2'].exchange : '-'} min.`}
                                                        >
                                                            {product['2'].count}ks. ({product['2'].time} min.)
                                                        </Tooltip>
                                                        : '-'
                                                    }
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[5])}
                                                >
                                                    {
                                                        product['3']
                                                        ? <Tooltip
                                                            className={`cursor--default`}
                                                            title={`Čas na kus: ${product['3'] ? product['3'].time : '-'} min.\nNahazování: ${product['3'] ? product['3'].casting : '-'} min.\nVýměna: ${product['3'] ? product['3'].exchange : '-'} min.`}
                                                        >
                                                            {product['3'].count}ks. ({product['3'].time} min.)
                                                        </Tooltip>
                                                        : '-'
                                                    }
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[6])}
                                                >
                                                    {
                                                        product['4']
                                                        ? <Tooltip
                                                            className={`cursor--default`}
                                                            title={`Čas na kus: ${product['4'] ? product['4'].time : '-'} min.\nNahazování: ${product['4'] ? product['4'].casting : '-'} min.\nVýměna: ${product['4'] ? product['4'].exchange : '-'} min.`}
                                                        >
                                                            {product['4'].count}ks. ({product['4'].time} min.)
                                                        </Tooltip>
                                                        : '-'
                                                    }
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[7])}
                                                >
                                                    {
                                                        product['5']
                                                        ? <Tooltip
                                                            className={`cursor--default`}
                                                            title={`Čas na kus: ${product['5'] ? product['5'].time : '-'} min.\nNahazování: ${product['5'] ? product['5'].casting : '-'} min.\nVýměna: ${product['5'] ? product['5'].exchange : '-'} min.`}
                                                        >
                                                            {product['5'].count}ks. ({product['5'].time} min.)
                                                        </Tooltip>
                                                        : '-'
                                                    }
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[8])}
                                                >
                                                    {
                                                        product['6']
                                                        ? <Tooltip
                                                            className={`cursor--default`}
                                                            title={`Čas na kus: ${product['6'] ? product['6'].time : '-'} min.\nNahazování: ${product['6'] ? product['6'].casting : '-'} min.\nVýměna: ${product['6'] ? product['6'].exchange : '-'} min.`}
                                                        >
                                                            {product['6'].count}ks. ({product['6'].time} min.)
                                                        </Tooltip>
                                                        : '-'
                                                    }
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[9])}
                                                >
                                                    {product.totalTime}
                                                </td>
                                                <td
                                                    style={createStyleObject(thWidth[10])}
                                                >
                                                    <Tooltip
                                                        className={`cursor--default`}
                                                        title={`Čas na zakázku: <br /> ${product.totalTime}m * ${product.totalCount}ks. = ${formatMinutesToTime(product.totalTime * product.totalCount)}`}
                                                    >
                                                        {formatMinutesToTime(product.totalTime * product.totalCount)}
                                                    </Tooltip>
                                                </td>
                                            </tr>
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
                            <th scope="col">Čas na kus</th>
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
                            {this.renderTableBody(this.props.events)}
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
