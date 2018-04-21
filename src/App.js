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
            open: false
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
                                <h2>Přidání zakázky</h2>
                            </header>

                            <section>

                            </section>

                            <footer
                                className="text-align--right"
                            >
                                <button
                                    onClick={this.saveOrder}
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
