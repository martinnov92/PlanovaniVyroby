// @ts-check

import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import isEqual from 'lodash/isEqual';
import { CalendarEvent, CalendarCell } from './';
import {
    FULL_FORMAT,
    createClassName,
    DATA_DATE_FORMAT,
} from '../../helpers';

import './calendar.css';

export class Calendar extends React.Component {
    static defaultProps = {
        pause: 11,
        events: [],
        machines: [],
        currentWeek: 1,
        onEventDrop: () => {},
        onEventClick: () => {},
        onEventEnter: () => {},
        onEventLeave: () => {}
    };

    constructor(props) {
        super(props);

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
            selectedEventElement: null,
        };
    }

    componentDidMount() {
        // todo: zafocusovat aktuální den + vyřešit špatný zobrazení zakázek
        // ReactDOM.findDOMNode(this.currentDate).scrollIntoView();
        this.getDimensions();
        this.renderTableBody();
        // document.addEventListener('drop', this.o)
        document.addEventListener('click', this.handleClickOutside);
        ReactDOM.findDOMNode(this.calendar).addEventListener('scroll', this.handleScroll);
    }

    componentDidUpdate(prevProps, prevState) {
        const dragging = prevState.draggingEvent !== this.state.draggingEvent;
        const events = !isEqual(this.props.events, prevProps.events);
        const selectedEvent = prevState.selectedEvent !== this.state.selectedEvent;
        const currentWeek = prevProps.currentWeek !== this.props.currentWeek;

        if (currentWeek) {
            // TODO: zkusit vytvořit cell komponentu a potom vytáhnout rendertable body ze statu, vyzkoušet jestli se bude překreslovat
            // normálně něbo pomale
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
        const calendarHolder = this.calendar;
        const calendarTableWidth = calendarHolder.firstChild.offsetWidth;

        this.setState({
            calendarHolder,
            calendarTableWidth
        }, () => {
            this.renderEvents();
        });
    }

    handleClickOutside = (e) => {
        const {
            selectedEventElement,
        } = this.state;
        
        if (!selectedEventElement) {
            return;
        }

        const isInEvent = selectedEventElement.contains(e.target);
        if (isInEvent) {
            return;
        }

        this.setState({
            selectedEvent: null,
            selectedEventElement: null,
        });
    }

    handleScroll = (e) => {
        this.scrollLeft = e.target.scrollLeft;
    }

    selectEvent = (e, event) => {
        this.setState({
            selectedEvent: event,
            selectedEventElement: e.target,
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
        e.target.classList.add('calendar--event-dragging--over');
    }

    handleDragOver = (e) => {
        e.preventDefault();
        // console.log('over');
    }

    handleDragLeave = (e) => {
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
        const resizeType = e.dataTransfer.getData('eventResize');
        const dateOnDrop = moment(e.target.dataset.date, DATA_DATE_FORMAT);

        let dateFrom = parsedEvent.dateFrom;
        let dateTo = parsedEvent.dateTo;

        if (resizeType === 'dateFrom') {
            dateFrom = dateOnDrop.toDate();
        } else if (resizeType === 'dateTo') {
            dateTo = dateOnDrop.toDate();
        } else {
            // get differenc in hours between dateFrom to dateTo from original event
            const momentDateTo = moment(parsedEvent.dateTo);
            const momentDateFrom = moment(parsedEvent.dateFrom);
            const hoursDifference = Math.ceil(moment.duration(momentDateTo.diff(momentDateFrom)).asHours());
            const sign = Math.sign(hoursDifference);
    
            // set new dateFrom and dateTo on object and pass it to parent component
            dateFrom = dateOnDrop.toDate();
            dateTo = dateOnDrop.add(hoursDifference * sign, 'hours').toDate();
        }

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
        } = this.state;

        const {
            machines
        } = this.props;

        return (
            <React.Fragment>
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
            day = moment(this.props.startOfTheWeek).add(i, 'days');

            if (empty === false) {
                current = moment().startOf('day').isSame(day);
                className = createClassName([
                    'text-align--center',
                    current ? 'calendar-day--current bg-success text-light' : null
                ]);
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
        const { pause } = this.props;

        if (empty === false) {
            for (let i = 7; i <= 20; i++) {
                let td = <td key={i} colSpan={2} className={createClassName(['calendar-table--hours'])}>{i}</td>;
                hours.push(td);
            }

            return hours;
        }

        // from 7:00 to 20:00
        for (let i = 7; i <= 20; i++) {
            const cellAttrs = {
                onDrop: this.handleDrop,
                onClick: (i) => console.log('klik', i),
                onDragOver: this.handleDragOver,
                onDragEnter: this.handleDragEnter,
                onDragLeave: this.handleDragLeave,
            };

            const hasPause = (pause === i) ? 'calendar--cell-pause' : null;

            const td = <React.Fragment key={i}>
                <CalendarCell
                    day={day}
                    hours={i}
                    className={[hasPause]}
                    onClick={() => console.log('click', i)}
                    {...cellAttrs}
                />
                <CalendarCell
                    day={day}
                    hours={i}
                    minutes={30}
                    {...cellAttrs}
                />
            </React.Fragment>;

            hours.push(td);
        }

        return hours;
    }

    renderEvents = (e) => {
        const {
            events,
            machines,
            startOfTheWeek,
        } = this.props;

        const {
            draggingEvent,
            selectedEvent,
            calendarHolder,
        } = this.state;

        // vyfiltrovat eventy pouze pro daný týden
        const endOfTheWeek = moment(startOfTheWeek).endOf('week');
        const filteredEvents = events.filter((event) => {
            return (moment(event.dateFrom).isAfter(startOfTheWeek) && moment(event.dateTo).isBefore(endOfTheWeek));
        });

        const eventsToRender = filteredEvents.map((event) => {
            const machine = machines.find((machine) => machine.id === event.machine);
            const row = ReactDOM.findDOMNode(this[machine.id]);

            return (
                <CalendarEvent
                    row={row}
                    event={event}
                    key={event.id}
                    machine={machine}
                    scrollLeft={this.scrollLeft}
                    selectedEvent={selectedEvent}
                    draggingEvent={draggingEvent}
                    calendarWrapperClientRect={calendarHolder}

                    // mouse events
                    onDrag={this.handleDrag}
                    onClick={this.selectEvent}
                    onDragEnd={this.handleDragEnd}
                    onDragStart={this.handleDragStart}
                    onMouseEnter={this.props.onEventEnter}
                    onMouseLeave={this.props.onEventLeave}

                    // context menu props
                    onEditEvent={this.props.onEventClick}
                />
            );
        });

        this.setState({
            eventsToRender
        });
    }
}
