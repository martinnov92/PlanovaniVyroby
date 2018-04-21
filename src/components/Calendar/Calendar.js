import React from 'react';
import moment from 'moment';
import { createClassName } from '../../helpers';

import './calendar.css';

const FULL_FORMAT = 'D.M.YYYY dddd';

export class Calendar extends React.Component {
    constructor(props) {
        super(props);

        const startOfTheWeek = moment().startOf('week').startOf('day');

        this.state = {
            startOfTheWeek: startOfTheWeek,
            weekOfTheYear: startOfTheWeek.week(),
        };
    }

    renderDays = () => {
        const days = [<td className="column-fixed" />];

        for (let i = 0; i < 7; i++) {
            const day = moment(this.state.startOfTheWeek).add(i, 'days');
            const current = moment().startOf('day').isSame(day);
            const className = createClassName([current ? 'calendar-day--current' : null]);

            const td =
                <td
                    key={day.format(FULL_FORMAT)}
                    className={className}
                >
                    <table>
                        <tbody>
                            <tr>
                                <td
                                    colSpan={15}
                                    className="text-align--center"
                                >
                                    {day.format(FULL_FORMAT)}
                                </td>
                            </tr>
                            <tr>
                                {this.renderHours()}
                            </tr>
                        </tbody>
                    </table>
                </td>;

            days.push(td);
        }

        return days;
    }

    renderHours = () => {
        const hours = [];

        // from 7:00 to 20:00
        for (let i = 7; i <= 20; i++) {
            const td =
                <td
                    key={i}
                    className="calendar-table--hours"
                >
                    {i}
                </td>;

            hours.push(td);
        }

        return hours;
    }

    handleWeekMove = (e, move) => {
        let startOfTheWeek = moment(this.state.startOfTheWeek);

        if (move === 'next') {
            startOfTheWeek = startOfTheWeek.add(1, 'week').startOf('week');
        } else {
            startOfTheWeek = startOfTheWeek.subtract(1, 'week').startOf('week');
        }

        this.setState({
            startOfTheWeek,
            weekOfTheYear: startOfTheWeek.week(),
        });
    }

    render() {
        const {
            weekOfTheYear,
        } = this.state;

        return (
            <div>
                <div
                    className="text-align--center calendar-year--week"
                >
                    <button
                        className="btn text-weight--bold"
                        onClick={(e) => this.handleWeekMove(e, 'prev')}
                    >
                        {"<"}
                    </button>

                    <strong>{weekOfTheYear}. týden</strong>

                    <button
                        className="btn text-weight--bold"
                        onClick={(e) => this.handleWeekMove(e, 'next')}
                    >
                        {">"}
                    </button>
                </div>
                <div className="calendar">
                    <table className="calendar-table">
                        <thead>
                            <tr>
                                {this.renderDays()}
                            </tr>
                        </thead>
                        {/* body of the calendar, week */}
                        <tbody>
                            <tr>
                                <th className="column-fixed">Column 1</th>
                                <td> nějaký data</td>
                            </tr>
                            <tr>
                                <th className="column-fixed">Column 1</th>
                                <td> nějaký data</td>
                            </tr>
                            <tr>
                                <th className="column-fixed">Column 1</th>
                                <td> nějaký data</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
