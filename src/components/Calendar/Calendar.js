import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
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

        console.log(ReactDOM);
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
                {/* CURRENT WEEK */}
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

                {/* TABLE */}
                <div className="calendar">
                    <table className="calendar-table">
                        <thead>
                            <tr>
                                {this.renderDaysCell(false)}
                            </tr>
                        </thead>
                        {/* body of the calendar, week */}
                        <tbody className="calendar-table--body">
                            {this.renderTableBody()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    renderTableBody = () => {
        const { machines } = this.props;

        return machines.map((machine) => {
            return <tr
                key={machine.name}
                ref={(node) => this[machine.name] = node}
            >
                <th
                    className="column-fixed"
                >
                    <p>{machine.name}</p>
                </th>
                {this.renderDaysCell(true)}
            </tr>;
        });
    }

    renderDaysCell = (empty = false) => {
        const days = [];
        let day;
        let current;
        let className;

        if (empty === false) {
            days.push(<td key="empty" className="column-fixed" />);
        }

        for (let i = 0; i < 7; i++) {
            day = moment(this.state.startOfTheWeek).add(i, 'days');

            if (empty === false) {
                current = moment().startOf('day').isSame(day);
                className = createClassName(['text-align--center', current ? 'calendar-day--current' : null]);
            }

            const td =
                <td
                    key={day.format(FULL_FORMAT)}
                >
                    <table>
                        <tbody>
                            {
                                empty
                                ? null
                                : <tr>
                                    <td
                                        colSpan={15}
                                        className={className}
                                    >
                                        <strong>{day.format(FULL_FORMAT)}</strong>
                                    </td>
                                </tr>
                            }
                            <tr>
                                {this.renderHoursEmptyCell(empty, day)}
                            </tr>
                        </tbody>
                    </table>
                </td>;

            days.push(td);
        }

        return days;
    }

    renderHoursEmptyCell = (empty = false, day) => {
        const hours = [];

        // from 7:00 to 20:00
        for (let i = 7; i <= 20; i++) {
            const td =
                <td
                    key={i}
                    className="calendar-table--hours"
                    data-date={day.toDate()}
                    date-time={i}
                >
                    {empty ? null : i}
                </td>;

            hours.push(td);
        }

        return hours;
    }
}
