import React from 'react';
import moment from 'moment';
import { Calendar } from './components/Calendar';

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
                dateFrom: moment().subtract(2, 'days').hours(9).minutes(0).seconds(0).toDate(),
                dateTo: moment().add(1, 'days').hours(11).minutes(0).seconds(0).toDate(),
            }],
            open: false,
            order: {
                label: '',
                machine: '',
                worker: '',
                dateFrom: moment().hours(7).minutes(0).seconds(0).toDate(),
                dateTo: moment().hours(10).minutes(0).seconds(0).toDate(),
            }
        };
    }

    render() {
        return (
            <div className="app">
                <div />

                <div>
                    <button
                        className=""
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
                        : <div
                            className="popup"
                        >
                            <header>
                                <h2
                                    className="pull-left"
                                >
                                    Přidání zakázky
                                </h2>

                                <button
                                    className="pull-right"
                                    onClick={() => this.setState({ open: false })}
                                >
                                    x
                                </button>
                            </header>

                            <section>
                                <div>
                                    <label>
                                        Název:

                                        <input
                                            type="text"
                                            name="label"
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
                                    </label>
                                </div>

                                <div>
                                    <label>
                                        Stroj:

                                        <input
                                            type="text"
                                            name="machine"
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
                                    </label>
                                </div>

                                <div>
                                    <label>
                                        Obsluha:

                                        <input
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
                                    </label>
                                </div>

                                <div>
                                    <label>
                                        Od:

                                        <input
                                            type="datetime-locale"
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
                                    </label>
                                </div>

                                <div>
                                    <label>
                                        Do:

                                        <input
                                            type="datetime-locale"
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
                                    </label>
                                </div>
                            </section>

                            <footer
                                className="text-align--right"
                            >
                                <button
                                    onClick={() => {
                                        const copy = [...this.state.orders];
                                        copy.push(this.state.order);

                                        this.setState({
                                            orders: copy,
                                            order: {
                                                label: '',
                                                machine: '',
                                                worker: '',
                                                dateFrom: moment().hours(7).minutes(0).seconds(0).toDate(),
                                                dateTo: moment().hours(10).minutes(0).seconds(0).toDate(),
                                            },
                                            open: false
                                        });
                                    }}
                                >
                                    Uložit zakázku
                                </button>
                            </footer>
                        </div>
                    }
                </div>

                <div />
            </div>
        );
    }
}

export default App;
