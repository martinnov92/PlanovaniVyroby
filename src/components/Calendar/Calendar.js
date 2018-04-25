// @ts-check

import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import isEqual from 'lodash/isEqual';
import { ContextMenu } from '../ContextMenu';
import {
    FULL_FORMAT,
    createClassName,
    DATA_DATE_FORMAT,
} from '../../helpers';

import './calendar.css';

export class Calendar extends React.Component {
    static defaultProps = {
        events: [],
        machines: [],
        onEventDrop: () => {},
        onEventClick: () => {},
        onEventEnter: () => {},
        onEventLeave: () => {}
    };

    constructor(props) {
        super(props);

        const startOfTheWeek = moment().startOf('week').startOf('day');

        this.scrollLeft = 0;
        this.state = {
            lockScroll: false,
            eventsToRender: [],
            draggingEvent: null,
            renderTableBody: [],
            calendarHolder: null,
            dragActiveCell: null,
            selectedEvent: null,
            calendarTableWidth: 0,
            startOfTheWeek: startOfTheWeek,
            weekOfTheYear: startOfTheWeek.week(),
        };
    }

    componentDidMount() {
        // todo: zafocusovat aktuální den + vyřešit špatný zobrazení zakázek
        // ReactDOM.findDOMNode(this.currentDate).scrollIntoView();
        this.getDimensions();
        this.renderTableBody();
        // document.addEventListener('drop', this.o)
        ReactDOM.findDOMNode(this.calendar).addEventListener('scroll', this.handleScroll);
    }

    componentDidUpdate(prevProps, prevState) {
        const dragging = prevState.draggingEvent !== this.state.draggingEvent;
        const events = !isEqual(this.props.events, prevProps.events);
        const selectedEvent = prevState.selectedEvent !== this.state.selectedEvent;
        const weekOfTheYear = prevState.weekOfTheYear !== this.state.weekOfTheYear;

        if (weekOfTheYear) {
            this.renderTableBody();
        }

        if (dragging || selectedEvent || events) {
            this.renderEvents();
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
            this.renderEvents();
        });
    }

    handleScroll = (e) => {
        this.scrollLeft = e.target.scrollLeft;
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

    selectEvent = (e, event) => {
        this.setState({
            selectedEvent: event,
        });
    }

    handleDragStart = (e, event) => {
        setTimeout(() => {
            this.setState({
                draggingEvent: event
            });
        }, 0);

        const stringifyEvent = JSON.stringify(event);
        e.dataTransfer.setData('event', stringifyEvent);
    }

    handleDrag = (e, event) => {
        // console.log('handle');
    }

    handleDragEnter = (e) => {
        const date = e.target.dataset && e.target.dataset.date ? e.target.dataset.date : null;
        console.log('drag enter');
        // this.setState({
        //     dragActiveCell: date,
        // });

        e.target.classList.add('calendar--event-dragging--over');
    }

    handleDragOver = (e) => {
        e.preventDefault();
        // console.log('over');
    }

    handleDragLeave = (e) => {
        console.log('leave');
        e.target.classList.remove('calendar--event-dragging--over');
    }

    handleDragEnd = (e) => {
        this.setState({
            draggingEvent: null,
        });
    }

    handleDrop = (e) => {
        e.preventDefault();

        this.setState({
            draggingEvent: null,
        });

        // get event and get new date from drop
        const parsedEvent = JSON.parse(e.dataTransfer.getData('event'));
        const dateOnDrop = moment(e.target.dataset.date, DATA_DATE_FORMAT);

        // get differenc in hours between dateFrom to dateTo from original event
        const momentDateTo = moment(parsedEvent.dateTo);
        const momentDateFrom = moment(parsedEvent.dateFrom);
        const hoursDifference = Math.ceil(moment.duration(momentDateTo.diff(momentDateFrom)).asHours());
        const sign = Math.sign(hoursDifference);

        // set new dateFrom and dateTo on object and pass it to parent component
        const dateFrom = dateOnDrop.toDate();
        const dateTo = dateOnDrop.add(hoursDifference * sign, 'hours').toDate();

        const newEvent = {
            ...parsedEvent,
            dateFrom: dateFrom,
            dateTo: dateTo,
        };

        this.props.onEventDrop(newEvent);
    }

    render() {
        const {
            lockScroll,
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
                    <div
                        className="btn-group"
                        role="group"
                    >
                        <button
                            className="btn text-weight--bold btn-success"
                            onClick={(e) => this.handleWeekMove(e, 'prev')}
                        >
                            {"<"}
                        </button>

                        <button className="btn btn-secondary">{weekOfTheYear}. týden</button>

                        <button
                            className="btn text-weight--bold btn-success"
                            onClick={(e) => this.handleWeekMove(e, 'next')}
                        >
                            {">"}
                        </button>
                    </div>
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
                        className={createClassName([
                            'calendar',
                            lockScroll ? 'lock--scroll' : null
                        ])}
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
                                {this.state.renderTableBody}
                            </tbody>
                        </table>

                        <div
                            className="calendar-events--holder"
                            ref={(node) => this.events = node}
                            style={{
                                width: `${this.state.calendarTableWidth}px`
                            }}
                        >
                            {this.state.eventsToRender}
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

        this.setState({
            renderTableBody: body,
        }, () => {
            this.renderEvents();
        });
    }

    renderDaysCell = (empty = false) => {
        const days = [];
        let day;
        let current;
        let className;

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
                                        colSpan={28}
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
        const {
            dragActiveCell
        } = this.state;

        if (empty === false) {
            for (let i = 7; i <= 20; i++) {
                let td = <td key={i} colSpan={2} className={createClassName(['calendar-table--hours'])}>{i}</td>;
                hours.push(td);
            }

            return hours;
        }

        // from 7:00 to 20:00
        for (let i = 7; i <= 20; i++) {
            const emptyTdAttrs = {
                onDrop: this.handleDrop,
                onDragOver: this.handleDragOver,
                onDragEnter: this.handleDragEnter,
                onDragLeave: this.handleDragLeave,
            };

            const fullHour = day.hours(i).minutes(0).seconds(0).format(DATA_DATE_FORMAT);
            const hourAndHalf = day.hours(i).minutes(30).seconds(0).format(DATA_DATE_FORMAT);
            const cellOver = (dragActiveCell === fullHour) || (dragActiveCell === hourAndHalf);
            const emptyCellclassNames = createClassName([
                'calendar-table--empty-hours',
                // cellOver ? 'calendar--event-dragging--over' : null,
            ]);
            console.warn('kreslím');
            const td = <React.Fragment key={i}>
                <td
                    data-date={fullHour}
                    className={emptyCellclassNames}
                    onClick={() => console.log('click', i)}
                    {...emptyTdAttrs}
                />
                <td
                    data-date={hourAndHalf}
                    className={emptyCellclassNames}
                    onClick={() => console.log('click', i)}
                    {...emptyTdAttrs}
                />
            </React.Fragment>;

            hours.push(td);
        }

        return hours;
    }

    renderEvents = (e) => {
        const {
            selectedEvent,
            draggingEvent,
        } = this.state;
        const { events, machines } = this.props;

        const eventsToRender = events.map((event) => {
            const { dateFrom, dateTo } = event;
            const startDate = moment(dateFrom).format(DATA_DATE_FORMAT);
            const endDate = moment(dateTo).format(DATA_DATE_FORMAT);
            const machine = machines.find((machine) => machine.id === event.machine);

            const findRow = ReactDOM.findDOMNode(this[event.machine]);
            if (!findRow) {
                return null;
            }

            const rowClientRect = findRow.getBoundingClientRect();
            const findStartDateOnRow = findRow.querySelector(`[data-date="${startDate}"]`);
            const findEndDateOnRow = findRow.querySelector(`[data-date="${endDate}"]`);

            const { scrollLeft } = this;
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
                // TODO: kontrola objednávek přes více týdnů
                return null;
            }

            const calendarHolderClientRect = this.state.calendarHolder.getBoundingClientRect();
            let style = {
                backgroundColor: machine.color,
                height: `${startPosition.height}px`,
                width: `${endPosition.right - startPosition.left}px`,
                top: `${startPosition.top - calendarHolderClientRect.top}px`,
                left: `${startPosition.left - calendarHolderClientRect.left + scrollLeft}px`,
            };

            return (
                <ContextMenu
                    key={event.id}
                    onOpen={() => this.setState({ lockScroll: true })}
                    onClose={() => this.setState({ lockScroll: false })}
                    buttons={[
                        {
                            label: 'Upravit',
                            onClick: () => this.props.onEventClick(e, event),
                        }
                    ]}
                >
                    <div
                        className={
                            createClassName([
                                'calendar--event',
                                event.note ? 'calendar--event-note' : null,
                                draggingEvent && draggingEvent.id === event.id ? 'calendar--event-dragging' : null,
                                selectedEvent && selectedEvent.id === event.id ? 'calendar--event-selected' : null,
                            ])
                        }
                        style={style}
                        draggable={true}
                        onDragEnd={this.handleDragEnd}
                        onDrag={(e) => this.handleDrag(e, event)}
                        onClick={(e) => this.selectEvent(e, event)}
                        onDragStart={(e) => this.handleDragStart(e, event)}
                        onMouseEnter={(e) => this.props.onEventEnter(e, event)}
                        onMouseLeave={(e) => this.props.onEventLeave(e, event)}
                    >
                        <div>
                            <p>
                                <strong>
                                    {event.label}
                                </strong>
                            </p>
                            <p>{event.worker}</p>
                        </div>
                    </div>
                </ContextMenu>
            );
        });

        this.setState({
            eventsToRender
        });
    }
}
