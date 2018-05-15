import React from 'react';
import 'react-tabs/style/react-tabs.css';

export class OrdersTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tempOrder: {
                id: null,
            },
        };
    }

    handleOrderSave = (e) => {
        const orderCopy = { ...this.state.tempOrder };

        if (orderCopy.name.length === 0) {
            return alert('Název zakázky musí být vyplněn.');
        }

        this.setState({
            tempOrder: {
                id: null,
                name: '',
                new: false,
            },
        });

        this.props.onOrderSave(e, orderCopy);
    }

    handleOrderInputChange = (e) => {
        const orderCopy = {...this.state.tempOrder};
        orderCopy[e.target.name] = e.target.value;

        this.setState({
            tempOrder: orderCopy,
        });
    }

    render() {
        const {
            tempOrder,
        } = this.state;

        const {
            orders,
        } = this.props;

        return (
            <React.Fragment>
                <table
                    className="table table-bordered mt-3 table--machines"
                >
                    <thead>
                        <tr>
                            <th>#</th>
                            <th
                                style={{
                                    width: '65%'
                                }}
                            >
                                Zakázka
                            </th>
                            <th>Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            tempOrder.new
                            ? this.renderOrderTr(tempOrder)
                            : null
                        }
                        { orders.map(this.renderOrderTr) }
                    </tbody>
                </table>
            </React.Fragment>
        );
    }

    renderOrderTr = (order, index) => {
        const {
            tempOrder,
        } = this.state;

        return (
            <tr
                key={index || order.id}
            >
                <td>{isNaN(index) ? '-' : `${index + 1}.`}</td>
                <td>
                    {
                        tempOrder.id === order.id
                        ? <input
                            type="text"
                            name="id"
                            className="form-control"
                            value={tempOrder.id}
                            onChange={(e) => this.handleOrderInputChange(e, order)}
                        />
                        : order.id
                    }
                </td>
                <td>
                    {
                        tempOrder.id === order.id
                        ? <React.Fragment>
                            <button
                                onClick={this.handleOrderSave}
                                className="btn btn-success btn-sm"
                            >
                                Uložit
                            </button>

                            <button
                                className="btn btn-danger btn-sm ml-3"
                                onClick={() => this.setState({ tempOrder: { id: null } })}
                            >
                                Zrušit
                            </button>
                        </React.Fragment>
                        : <React.Fragment>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => this.setState({ tempOrder: { ...order } })}
                            >
                                Editovat
                            </button>

                            <button
                                className="btn btn-danger btn-sm ml-3"
                                onClick={(e) => this.props.onOrderDelete(e, order)}
                            >
                                Smazat
                            </button>
                        </React.Fragment>
                    }
                </td>
            </tr>
        );
    }
}
