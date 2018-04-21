import React from 'react';
import { Calendar } from './components/Calendar';

class App extends React.Component {
    render() {
        return (
            <div className="app">
                <div />

                <Calendar
                    workers={[]}
                    events={[]}
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

                <div />
            </div>
        );
    }
}

export default App;
