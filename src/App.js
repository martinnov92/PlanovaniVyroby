import React from 'react';
import moment from 'moment';
import { Popup } from './components/Popup';
import { Calendar } from './components/Calendar';

const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDThh:mm';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            orders: [{
                id: 'abc',
                label: 'Zakázka 1',
                machine: 'Finetech',
                worker: 'Jiří Pavlík',
                dateFrom: moment().subtract(5, 'days').hours(10).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(3, 'days').hours(14).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcd',
                label: 'Zakázka 2',
                machine: 'CNC Soustruh ST310',
                worker: 'Jiří Pavlík',
                dateFrom: moment().subtract(3, 'days').hours(7).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(1, 'days').hours(13).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcde',
                label: 'Zakázka 2',
                machine: 'FTU 1250',
                worker: 'Jiří Pavlík',
                dateFrom: moment().subtract(3, 'days').hours(9).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(1, 'days').hours(11).minutes(0).seconds(0).toDate(),
            }],
            open: false,
            order: {
                label: '',
                machine: '',
                worker: '',
                dateFrom: moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
                dateTo: moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
            }
        };
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
                        orders={this.state.orders}
                        machines={[
                            {
                                name: 'Finetech',
                                color: 'red',
                            },
                            {
                                name: 'Haas',
                                color: 'green'
                            },
                            {
                                name: 'CNC Soustruh ST310',
                                color: 'orange'
                            },
                            {
                                name: 'FTU 1250',
                                color: 'blue'
                            }
                        ]}
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
                                                id: e.target.value,
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
                                <input
                                    type="text"
                                    name="machine"
                                    className="form-control"
                                    onChange={(e) => {
                                        this.setState({
                                            order: {
                                                ...this.state.order,
                                                [e.target.name]: e.target.value
                                            }
                                        });
                                    }}
                                    value={this.state.order.machine}
                                />
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
                                />
                            </div>
                        </Popup>
                    }
                </div>

                <div />
            </div>
        );
    }

    handleSave = () => {
        const copy = [...this.state.orders];
        copy.push(this.state.order);

        this.setState({
            orders: copy,
            order: {
                label: '',
                machine: '',
                worker: '',
                dateFrom: moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
                dateTo: moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT),
            },
            open: false
        });
    }
}

export default App;
