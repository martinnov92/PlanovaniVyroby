// @ts-check

import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import {
    FULL_FORMAT,
    createClassName,
    DATA_DATE_FORMAT,
} from '../../helpers';

import './calendar.css';

export class Calendar extends React.Component {
    static defaultProps = {
        orders: [],
        machines: [],
        onPinOrder: () => {},
        onEventClick: () => {},
        onEventEnter: () => {},
        onEventLeave: () => {}
    };

    constructor(props) {
        super(props);

        const startOfTheWeek = moment().startOf('week').startOf('day');

        this.state = {
            scrollLeft: 0,
            ordersToRender: [],
            calendarHolder: null,
            calendarTableWidth: 0,
            startOfTheWeek: startOfTheWeek,
            weekOfTheYear: startOfTheWeek.week(),
        };
    }

    componentDidMount() {
        // todo: zafocusovat aktuální den + vyřešit špatný zobrazení zakázek
        // ReactDOM.findDOMNode(this.currentDate).scrollIntoView();
        this.getDimensions();
        ReactDOM.findDOMNode(this.calendar).addEventListener('scroll', this.handleScroll);
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.weekOfTheYear !== this.state.weekOfTheYear ||
            this.props.orders.length !== prevProps.orders.length
        ) {
            this.renderOrders();
        }
    }

    componentWillUnmount() {
        ReactDOM.findDOMNode(this.calendar).removeEventListener('scroll', this.handleScroll);
    }

    getDimensions = () => {
        const calendarHolder = ReactDOM.findDOMNode(this.calendar);
        const calendarTableWidth = calendarHolder.firstChild.offsetWidth;

        this.setState({
            calendarHolder,
            calendarTableWidth
        }, () => {
            this.renderOrders();
        });
    }

    handleScroll = (e) => {
        this.setState({
            scrollLeft: e.target.scrollLeft
        });
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

        const {
            machines
        } = this.props;

        return (
            <React.Fragment>
                {/* CURRENT WEEK */}
                <div
                    className="text-align--center calendar-year--week"
                >
                    <button
                        className="btn text-weight--bold btn-outline-success mr-1"
                        onClick={(e) => this.handleWeekMove(e, 'prev')}
                    >
                        {"<"}
                    </button>

                    <strong>{weekOfTheYear}. týden</strong>

                    <button
                        className="btn text-weight--bold btn-outline-success ml-1"
                        onClick={(e) => this.handleWeekMove(e, 'next')}
                    >
                        {">"}
                    </button>
                </div>

                {/* TABLE */}
                <div className="calendar-wrapper">
                    <div className="calendar-column--fixed">
                        <div style={{ height: '44px', border: 0 }} />
                        {
                            machines.map((machine) => {
                                return <div
                                    key={machine.name}
                                    style={{
                                        borderLeft: `10px solid ${machine.color}`
                                    }}
                                    className="calendar--machine"
                                >
                                    <p>{machine.name}</p>
                                </div>;
                            })
                        }
                    </div>
                    <div
                        className="calendar"
                        ref={(node) => this.calendar = node}
                    >
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

                        <div
                            className="calendar-events--holder"
                            ref={(node) => this.events = node}
                            style={{
                                width: `${this.state.calendarTableWidth}px`
                            }}
                        >
                            {this.state.ordersToRender}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    renderTableBody = () => {
        const { machines } = this.props;

        const body = machines.map((machine) => {
            return <tr
                key={machine.id}
                ref={(node) => this[machine.id] = node}
            >
                {this.renderDaysCell(true)}
            </tr>;
        });

        return body;
    }

    renderDaysCell = (empty = false) => {
        const days = [];
        let day;
        let current;
        let className;

        if (empty === false) {
            // days.push(<td key="empty" className="column-fixed" />);
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
                                        colSpan={14}
                                        className={className}
                                        ref={current ? (node) => this.currentDate = node : null}
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
                    onClick={() => console.log('click', i)}
                    className="calendar-table--hours"
                    data-date={day.hours(i).minutes(0).seconds(0).format(DATA_DATE_FORMAT)}
                >
                    {empty ? null : i}
                </td>;

            hours.push(td);
        }

        return hours;
    }

    renderOrders = (e) => {
        const { orders, machines } = this.props;

        const ordersToRender = orders.map((order) => {
            const { dateFrom, dateTo } = order;
            const startDate = moment(dateFrom).format(DATA_DATE_FORMAT);
            const endDate = moment(dateTo).format(DATA_DATE_FORMAT);
            const machine = machines.find((machine) => machine.id === order.machine);

            const findRow = ReactDOM.findDOMNode(this[order.machine]);
            if (!findRow) {
                return null;
            }

            const rowClientRect = findRow.getBoundingClientRect();
            const findStartDateOnRow = findRow.querySelector(`[data-date="${startDate}"]`);
            const findEndDateOnRow = findRow.querySelector(`[data-date="${endDate}"]`);

            const { scrollLeft } = this.state;
            let startPosition;
            let endPosition;

            if (!findStartDateOnRow && findEndDateOnRow) {
                startPosition = {
                    top: rowClientRect.top + 1,
                    left: rowClientRect.left + 1,
                };
                endPosition = findEndDateOnRow.getBoundingClientRect();
            } else if (findStartDateOnRow && !findEndDateOnRow) {
                startPosition = findStartDateOnRow.getBoundingClientRect();
                endPosition = {
                    top: rowClientRect.top + 1,
                    right: rowClientRect.right,
                };
            } else if (findStartDateOnRow && findEndDateOnRow) {
                startPosition = findStartDateOnRow.getBoundingClientRect();
                endPosition = findEndDateOnRow.getBoundingClientRect();
            } else {
                return null;
            }

            const calendarHolderClientRect = this.state.calendarHolder.getBoundingClientRect();
            const style = {
                backgroundColor: machine.color,
                height: `${startPosition.height}px`,
                width: `${endPosition.right - startPosition.left}px`,
                top: `${startPosition.top - calendarHolderClientRect.top}px`,
                left: `${startPosition.left - calendarHolderClientRect.left + scrollLeft}px`,
            };

            return (
                <div
                    key={order.id}
                    className={
                        createClassName([
                            'calendar--event',
                            order.note ? 'calendar--event-note' : null
                        ])
                    }
                    onClick={(e) => this.props.onEventClick(e, order)}
                    onMouseEnter={(e) => this.props.onEventEnter(e, order)}
                    onMouseLeave={(e) => this.props.onEventLeave(e, order)}
                    style={style}
                >
                    {/* <div
                        className="calendar--pin"
                    >
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                this.props.onPinOrder(e, order);
                            }}
                        >
                            <span />
                        </a>
                    </div> */}
                    <div
                        // className="calendar--event-text"
                    >
                        <p>{order.label}</p>
                        <p>{order.worker}</p>
                    </div>
                </div>
            );
        });

        this.setState({
            ordersToRender
        });
    }
}
