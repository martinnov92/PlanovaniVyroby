import React from 'react';
import moment from 'moment';
import { Popup } from './components/Popup';
import { Calendar } from './components/Calendar';

const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDThh:mm';

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
                worker: 'Jiří Pavlík',
                dateFrom: moment().subtract(5, 'days').hours(10).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(3, 'days').hours(14).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcd',
                label: 'Zakázka 2',
                machine: 'st310',
                worker: 'Jiří Pavlík',
                dateFrom: moment().subtract(3, 'days').hours(7).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(1, 'days').hours(13).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcde',
                label: 'Zakázka 2',
                machine: 'ft1250',
                worker: 'Jiří Pavlík',
                dateFrom: moment().subtract(3, 'days').hours(9).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(1, 'days').hours(11).minutes(0).seconds(0).toDate(),
            }],
            open: false,
            order: {
                label: '',
                machine: machines[0].id,
                worker: '',
                note: '',
                dateFrom: moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
                dateTo: moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
            },
            focusedOrder: null
        };
    }

    handleEventEnter = (e, order) => {
        this.setState({
            focusedOrder: order
        });
    }

    handleEventLeave = (e, order) => {
        this.setState({
            focusedOrder: null
        });
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
                        orders={this.state.orders}
                        onEventEnter={this.handleEventEnter}
                        onEventLeave={this.handleEventLeave}
                    /> 

                    {
                        !this.state.open
                        ? null
                        : <Popup
                            className="popup-order"
                            title="Přidání zakázky"
                            onSave={this.handleSave}
                            onClose={() => this.setState({ open: false })}
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
                                    max={moment(this.state.order.dateFrom).hours(20).format(INPUT_DATE_TIME_FORMAT)}
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

                <div>
                    {
                        !this.state.focusedOrder
                        ? null
                        : <div>
                            {JSON.stringify(this.state.focusedOrder)}
                        </div>
                    }
                </div>
            </div>
        );
    }

    handleSave = () => {
        const copy = [...this.state.orders];
        const order = {
            ...this.state.order,
            id: moment().toDate(),
            dateTo: moment(this.state.order.dateTo).toDate(),
            dateFrom: moment(this.state.order.dateFrom).toDate(),
        };
        copy.push(order);

        this.setState({
            orders: copy,
            order: {
                label: '',
                machine: '',
                worker: '',
                note: '',
                dateFrom: moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
                dateTo: moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
            },
            open: false
        });
    }
}

export default App;
