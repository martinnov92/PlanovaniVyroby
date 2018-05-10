import React from 'react';
import { createClassName, createGroupedOrders } from '../../helpers';
import { ContextMenu } from '../ContextMenu';
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
            scrollLeft: 0,
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
        const fixedHeader = this.fixedHeader.current.getBoundingClientRect();
        const height = this.tableWrapper.current.getBoundingClientRect().height - fixedHeader.height;

        this.setState({
            width: fixedHeader.width,
            height,
        });
    }

    renderTableBody = (events) => {
        const {
            orderList,
            filterFinishedOrders,
        } = this.props;

        // zgrupovat zakázky podle orderId
        const orders = createGroupedOrders(events, orderList, filterFinishedOrders);
        return Object.keys(orders).map((key) => {
            const row = [];
            const order = orders[key];
            const keys = Object.keys(order);

            for (let i = 0; i < keys.length; i++) {
                const product = order[keys[i]];

                row.push(
                    <ContextMenu
                        key={keys[i]}
                        buttons={[
                            {
                                label: 'Uzavřít zakázku',
                                onClick: (e) => this.props.onCloseOrder(e, key, order),
                            }
                        ]}
                        useAsTableRow={true}
                        disabled={product.done}
                        className={product.done ? 'order--finished' : null}
                    >
                        <td>
                            <span
                                style={{
                                    backgroundColor: product.color
                                }}
                            >
                                {key}
                            </span>
                        </td>
                        <td>{keys[i]}</td>
                        <td>{product.total.count}</td>
                        <td>
                            {
                                product['1']
                                ? `${product['1'].count} (${product['1'].time})`
                                : '-'
                            }
                        </td>
                        <td>
                            {
                                product['2']
                                ? `${product['2'].count} (${product['2'].time})`
                                : '-'
                            }
                        </td>
                        <td>
                            {
                                product['3']
                                ? `${product['3'].count} (${product['3'].time})`
                                : '-'
                            }
                        </td>
                        <td>
                            {
                                product['4']
                                ? `${product['4'].count} (${product['4'].time})`
                                : '-'
                            }
                        </td>
                        <td>
                            {
                                product['5']
                                ? `${product['5'].count} (${product['5'].time})`
                                : '-'
                            }
                        </td>
                        <td>
                            {
                                product['6']
                                ? `${product['6'].count} (${product['6'].time})`
                                : '-'
                            }
                        </td>
                        <td>{product.total.time}</td>
                        <td>
                            {product.total.time} * {product.total.count} = {((product.total.time * product.total.count) / 60).toFixed(1)}h
                        </td>
                    </ContextMenu>
                );
            }

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
                        transform: `translateX(${this.state.scrollLeft * -1}px)`
                    }}
                >
                    <thead>
                        <tr>
                            <th scope="col">Zakázka</th>
                            <th scope="col">Název výrobku</th>
                            <th scope="col">Počet kusů</th>
                            <th scope="col">1.o Čas/ks (napl)</th>
                            <th scope="col">2.o Čas/ks (napl)</th>
                            <th scope="col">3.o Čas/ks (napl)</th>
                            <th scope="col">4.o Čas/ks (napl)</th>
                            <th scope="col">5.o Čas/ks (napl)</th>
                            <th scope="col">6.o Čas/ks (napl)</th>
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
