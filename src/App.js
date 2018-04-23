import React from 'react';
import moment from 'moment';
import { Popup } from './components/Popup';
import { Calendar } from './components/Calendar';

import {
    DATA_DATE_FORMAT,
    INPUT_DATE_TIME_FORMAT
} from './helpers';

const machines = [
    {
        id: 'finetech',
        name: 'Finetech',
        color: '#fb1'
    },
    {
        id: 'haas',
        name: 'Haas',
        color: '#1ce'
    },
    {
        id: 'st310',
        name: 'CNC Soustruh ST310',
        color: '#C01025'
    },
    {
        id: 'ft1250',
        name: 'FTU 1250',
        color: '#ACCE55'
    }
];

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            orders: [{
                id: 'abc',
                label: 'Zakázka 1',
                machine: 'finetech',
                worker: 'Petr',
                note: 'Poznámka k zakázce',
                dateFrom: moment().subtract(5, 'days').hours(10).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(3, 'days').hours(14).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcd',
                label: 'Zakázka 2',
                machine: 'st310',
                worker: 'Pavel',
                note: 'Poznámka k opravě',
                dateFrom: moment().add(1, 'days').hours(7).minutes(0).seconds(0).toDate(),
                dateTo: moment().add(2, 'days').hours(13).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcde',
                label: 'Zakázka 3',
                machine: 'ft1250',
                worker: 'Roman',
                note: 'Spěchá',
                dateFrom: moment().add(2, 'days').hours(9).minutes(0).seconds(0).toDate(),
                dateTo: moment().add(4, 'days').hours(11).minutes(0).seconds(0).toDate(),
            }],
            open: false,
            order: {
                id: null,
                label: '',
                machine: machines[0].id,
                worker: '',
                note: '',
                dateFrom: moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
                dateTo: moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
            },
            pinOrders: [],
        };
    }

    handlePinOrder = (e, order) => {
        const pinOrdersCopy = [...this.state.pinOrders];

        if (pinOrdersCopy.length <= 3) {
            pinOrdersCopy.push(order);

            this.setState({
                pinOrders: pinOrdersCopy
            });
        }
    }

    handleEventClick = (e, order) => {
        const copyOrder = {
            ...order,
            dateFrom: moment(order.dateFrom).format(INPUT_DATE_TIME_FORMAT),
            dateTo: moment(order.dateTo).format(INPUT_DATE_TIME_FORMAT),
        };

        this.setState({
            order: copyOrder,
            open: true,
        });
    }

    handleEventEnter = (e, order) => {
        this.setState({
            pinOrders: [order]
        });
    }

    handleEventLeave = (e, order) => {
        this.setState({
            pinOrders: []
        });
    }

    handleEventDrop = (order) => {
        const ordersCopy = [...this.state.orders];
        const findIndex = ordersCopy.findIndex((o) => o.id === order.id);
        ordersCopy.splice(findIndex, 1, order);

        this.setState({
            orders: ordersCopy,
        });
    }

    handleSave = () => {
        const copy = [...this.state.orders];
        const order = {
            ...this.state.order,
            dateTo: moment(this.state.order.dateTo).toDate(),
            dateFrom: moment(this.state.order.dateFrom).toDate(),
        };
        
        if (!this.state.order.id) {
            order.id = moment().toDate();
            copy.push(order);
        } else {
            const findIndex = copy.findIndex((o) => o.id === order.id);
            copy.splice(findIndex, 1, order);
        }

        this.setState({
            orders: copy,
            open: false
        });
        this.resetOrderState();
    }

    handleDelete = () => {
        const { order } = this.state;
        const orders = [...this.state.orders];
        const findIndex = orders.findIndex((o) => o.id === order.id);

        if (findIndex < 0) {
            return;
        }

        orders.splice(findIndex, 1);
        this.setState({
            orders: orders,
            open: false,
        });
        this.resetOrderState();
    };

    handleClose = () => {
        this.setState({
            open: false,
        });
        this.resetOrderState();
    }

    render() {
        return (
            <div className="app">
                <div />

                <div>
                    <button
                        className="btn btn-outline-success pull-right mr-2"
                        onClick={() => this.setState({ open: true })}
                    >
                        Přidat zakázku
                    </button>

                    <Calendar
                        machines={machines}
                        events={this.state.orders}
                        onEventDrop={this.handleEventDrop}
                        onEventClick={this.handleEventClick}
                        onEventEnter={this.handleEventEnter}
                        onEventLeave={this.handleEventLeave}
                    /> 

                    {
                        !this.state.open
                        ? null
                        : <Popup
                            className="popup-order"
                            title="Přidání zakázky"
                            footerButtons={() => {
                                return <React.Fragment>
                                    {
                                        this.state.order.id
                                        ? <button
                                            className="btn btn-sm btn-danger"
                                            onClick={this.handleDelete}
                                        >
                                            Smazat
                                        </button>
                                        : null
                                    }
                                    
                                    <button
                                        className="btn btn-sm btn-success ml-2"
                                        onClick={this.handleSave}
                                    >
                                        Uložit
                                    </button>
                                </React.Fragment>
                            }}
                            onClose={this.handleClose}
                        >
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Název</span>
                                </div>
                                <input
                                    type="text"
                                    name="label"
                                    className="form-control"
                                    onChange={(e) => {
                                        this.setState({
                                            order: {
                                                ...this.state.order,
                                                [e.target.name]: e.target.value
                                            }
                                        });
                                    }}
                                    value={this.state.order.label}
                                />
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Stroj</span>
                                </div>
                                <select
                                    name="machine"
                                    className="custom-select"
                                    onChange={(e) => {
                                        this.setState({
                                            order: {
                                                ...this.state.order,
                                                [e.target.name]: e.target.value
                                            }
                                        });
                                    }}
                                    value={this.state.order.machine.id}
                                >
                                    {machines.map((machine) => {
                                        return <option
                                            key={machine.id}
                                            value={machine.id}
                                        >
                                            {machine.name}
                                        </option>
                                    })}
                                </select>
                            </div>

                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Obsluha</span>
                                </div>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="worker"
                                    onChange={(e) => {
                                        this.setState({
                                            order: {
                                                ...this.state.order,
                                                [e.target.name]: e.target.value
                                            }
                                        });
                                    }}
                                    value={this.state.order.worker}
                                />
                            </div>

                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Od</span>
                                </div>
                                <input
                                    className="form-control"
                                    type="datetime-local"
                                    name="dateFrom"
                                    required={true}
                                    onChange={(e) => {
                                        this.setState({
                                            order: {
                                                ...this.state.order,
                                                [e.target.name]: e.target.value
                                            }
                                        });
                                    }}
                                    value={this.state.order.dateFrom}
                                />
                            </div>

                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Do</span>
                                </div>
                                <input
                                    className="form-control"
                                    type="datetime-local"
                                    name="dateTo"
                                    onChange={(e) => {
                                        this.setState({
                                            order: {
                                                ...this.state.order,
                                                [e.target.name]: e.target.value
                                            }
                                        });
                                    }}
                                    value={this.state.order.dateTo}
                                />
                            </div>

                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Poznámka</span>
                                </div>
                                <textarea
                                    className="form-control"
                                    name="note"
                                    onChange={(e) => {
                                        this.setState({
                                            order: {
                                                ...this.state.order,
                                                [e.target.name]: e.target.value
                                            }
                                        });
                                    }}
                                    value={this.state.order.note}
                                />
                            </div>
                        </Popup>
                    }
                </div>

                <div
                    className="orders--detail"
                >
                    {this.renderPinOrders()}
                </div>
            </div>
        );
    }

    renderPinOrders = () => {
        const { pinOrders } = this.state;

        if (pinOrders.length > 0) {
            return pinOrders.map((order) => {
                const machine = machines.find((machine) => machine.id === order.machine);

                return <div
                    key={order.id}
                    style={{
                        borderTop: `10px solid ${machine.color}`
                    }}
                    className="card"
                >
                    <div className="card-body">
                        <h5 className="card-title">
                            <strong>{order.label}</strong>
                        </h5>
                        <h6 className="card-subtitle mb-2 text-muted">
                            <strong>{order.worker}</strong>
                        </h6>
                        <p className="card-text">
                            {order.note}
                        </p>
                        <p className="card-text">
                            {machine.name}
                        </p>
                        <p className="card-text">
                            <strong>{moment(order.dateFrom).format(DATA_DATE_FORMAT)}</strong>
                            {" - "}
                            <strong>{moment(order.dateTo).format(DATA_DATE_FORMAT)}</strong>
                        </p>
                    </div>
                </div>
            });
        }

        return null;
    }

    resetOrderState = () => {
        this.setState({
            order: {
                label: '',
                machine: machines[0].id,
                worker: '',
                note: '',
                dateFrom: moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
                dateTo: moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
            }
        });
    }
}

export default App;
