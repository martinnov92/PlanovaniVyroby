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
            }]
        };
    }
    render() {
        return (
            <div className="app">
                <div />

                <div>
                    <button
                        className="btn btn-primary mr-2 float-right"
                    >
                        Přidat zakázku
                    </button>
                    <Calendar
                        orders={this.state.orders}
                        machines={[
                            {
                                name: 'Finetech'
                            },
                            {
                                name: 'Haas'
                            },
                            {
                                name: 'CNC Soustruh ST310'
                            },
                            {
                                name: 'FTU 1250'
                            }
                        ]}
                    />
                </div>

                <div />
            </div>
        );
    }
}

export default App;
