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

    handleOrderAdd = (e) => {
        this.setState({
            tempOrder: {
                name: '',
                new: true,
                done: false,
                id: Date.now(),
                color: '#e5e5e5',
            },
        });
    }

    handleOrderInputChange = (e) => {
        const orderCopy = {...this.state.tempOrder};

        if (e.target.type === 'checkbox') {
            orderCopy[e.target.name] = e.target.checked;
        } else {
            orderCopy[e.target.name] = e.target.value;
        }

        this.setState({
            tempOrder: orderCopy,
        });
    }

    handleOrderSave = (e) => {
        const orderCopy = { ...this.state.tempOrder };

        if (orderCopy.name.length === 0) {
            return alert('Název zakázky musí být vyplněn.');
        }

        this.setState({
            tempOrder: {
                id: null,
            },
        });

        if (orderCopy.new) {
            delete orderCopy.new;
            orderCopy.id = orderCopy.name.toString().toLowerCase();
        }

        this.props.onOrderSave(e, orderCopy);
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
                <div
                    className="clearfix"
                >
                    <button
                        onClick={this.handleOrderAdd}
                        className="btn btn-success pull-right"
                    >
                        Přidat zakázku
                    </button>
                </div>

                <table
                    className="table table-bordered mt-3 table--machines"
                >
                    <thead>
                        <tr>
                            <th>#</th>
                            <th style={{ width: '45%' }}>Zakázka</th>
                            <th style={{ width: '100px' }}>Dokončená</th>
                            <th style={{ width: '50px' }}>Barva</th>
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
                            name="name"
                            placeholder="Název"
                            value={tempOrder.name}
                            className="form-control"
                            onChange={this.handleOrderInputChange}
                        />
                        : order.id
                    }
                </td>
                <td>
                    <input
                        name="done"
                        type="checkbox"
                        className="form-control"
                        disabled={tempOrder.id !== order.id}
                        onChange={this.handleOrderInputChange}
                        checked={tempOrder.id !== order.id ? order.done : tempOrder.done}
                    />
                </td>
                <td style={{ padding: 0, position: 'relative' }}>
                    {
                        tempOrder.id === order.id
                        ? <input
                            type="color"
                            name="color"
                            value={tempOrder.color}
                            className="form-control"
                            style={{
                                top: 0,
                                left: 0,
                                padding: 0,
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                backgroundColor: tempOrder.color,
                            }}
                            onChange={this.handleOrderInputChange}
                        />
                        : <div
                            style={{
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                backgroundColor: order.color,
                            }}
                        />
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
