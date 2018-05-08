import isEqual from 'lodash/isEqual';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { DATA_DATE_FORMAT, FULL_FORMAT, createClassName } from '../../helpers';
import { CalendarCell, CalendarEvent } from './';
import './calendar.css';


export class Calendar extends React.Component {
    static defaultProps = {
        pause: 11,
        events: [],
        machines: [],
        orderList: [],
        currentWeek: 1,
        onEventDrop: () => {},
        onEventClick: () => {},
        onEventEnter: () => {},
        onEventLeave: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            scrollTop: 0,
            scrollLeft: 0,
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

        this.calendarScrolled = false;
        this.currentDate = React.createRef();
    }

    componentDidMount() {
        this.getDimensions();
        this.renderTableBody();

        document.addEventListener('click', this.handleClickOutside);
        ReactDOM.findDOMNode(this.calendar).addEventListener('scroll', this.handleScroll);
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            scrollTop,
            scrollLeft,
        } = this.state;

        const events = !isEqual(this.props.events, prevProps.events);
        const currentWeek = prevProps.currentWeek !== this.props.currentWeek;
        const orderList = !isEqual(this.props.orderList, prevProps.orderList);
        const dragging = prevState.draggingEvent !== this.state.draggingEvent;
        const selectedEvent = prevState.selectedEvent !== this.state.selectedEvent;
        // zkontrolovat scroll, pokud došlo k drop události a kalendář se sám zascroloval (vyrovnat zobrazení)
        const scrollChanged = (prevState.scrollTop !== 0 && scrollTop === 0) || (prevState.scrollLeft !== 0 && scrollLeft === 0);

        if (currentWeek) {
            this.calendarScrolled = false;
        }

        if (currentWeek || events) {
            this.renderTableBody();
        }

        if (dragging || selectedEvent || events || orderList || scrollChanged) {
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

    scrollToCurrentDate = () => {
        if (this.calendarScrolled) {
            return;
        }

        const currentDateCell = this.currentDate.current.getBoundingClientRect();
        this.calendar.scrollTo(currentDateCell.left - this.calendar.offsetLeft, 0);
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
        this.setState({
            scrollTop: e.target.scrollTop,
            scrollLeft: e.target.scrollLeft,
        });
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

        e.dataTransfer.setData('text', JSON.stringify({
            event: event
        }));
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

        // získání eventu z drop eventy
        const parsedEvent = JSON.parse(e.dataTransfer.getData('text'));
        const dateOnDrop = moment(e.target.dataset.date, DATA_DATE_FORMAT);

        let dateFrom = parsedEvent.event.dateFrom;
        let dateTo = parsedEvent.event.dateTo;

        if (parsedEvent.eventResize === 'dateFrom') {
            dateFrom = dateOnDrop.format();
        } else if (parsedEvent.eventResize === 'dateTo') {
            dateTo = dateOnDrop.format();
        } else {
            // vypočet rozdílu hodin z původní eventy
            const momentDateTo = moment(parsedEvent.event.dateTo);
            const momentDateFrom = moment(parsedEvent.event.dateFrom);

            const hoursDifference = Math.ceil(moment.duration(momentDateTo.diff(momentDateFrom)).asHours());
            const sign = Math.sign(hoursDifference);

            // set new dateFrom and dateTo on object and pass it to parent component
            dateFrom = dateOnDrop.format();
            dateTo = dateOnDrop.add(hoursDifference * sign, 'hours').format();
        }

        const newEvent = {
            ...parsedEvent.event,
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
                <div className="calendar-wrapper element--block shadow--light">
                    <div
                        className="calendar-column--fixed calendar--left-side"
                        style={{
                            transform: `translateY(${(this.state.scrollTop * -1)}px)`,
                        }}
                    >
                        <div style={{
                                height: '44px',
                                border: 0,
                                borderRight: '1px solid #dee2e6'
                            }}
                        />
                        {
                            machines.map((machine) => {
                                return <div
                                    key={machine.id}
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
                            <thead
                                className="calendar-table--header"
                            >
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
                    current ? 'calendar-day--current bg-danger text-light' : null
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
                                        ref={current ? this.currentDate : null}
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
        const current = moment().startOf('day').isSame(day);

        if (empty === false) {
            for (let i = 7; i <= 20; i++) {
                let td = <td
                    key={i}
                    colSpan={2}
                    className={createClassName([
                        'calendar-table--hours',
                        current ? 'calendar-day--current bg-danger text-light' : null
                    ])}
                >
                    {i}
                </td>;
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

            const isPause = (pause === i) ? 'calendar--cell-pause' : null;

            const td = <React.Fragment key={i}>
                <CalendarCell
                    day={day}
                    hours={i}
                    minutes={0}
                    className={[isPause]}
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
            orderList,
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
            const isInRange = moment(event.dateFrom).isBefore(startOfTheWeek) && moment(event.dateTo).isAfter(endOfTheWeek);
            const isInWeek = moment(event.dateFrom).isBetween(startOfTheWeek, endOfTheWeek) || moment(event.dateTo).isBetween(startOfTheWeek, endOfTheWeek);

            return isInRange || isInWeek;
        });

        const eventsToRender = filteredEvents.map((event) => {
            const order = orderList.find((o) => o.id === event.orderId);
            const machine = machines.find((machine) => machine.id === event.machine);
            let row = null;

            if (machine) {
                row = ReactDOM.findDOMNode(this[machine.id]);
            }

            return (
                <CalendarEvent
                    row={row}
                    order={order}
                    event={event}
                    key={event.id}
                    machine={machine}
                    selectedEvent={selectedEvent}
                    draggingEvent={draggingEvent}
                    scrollTop={this.state.scrollTop}
                    scrollLeft={this.state.scrollLeft}
                    calendarWrapperClientRect={calendarHolder}

                    // mouse events
                    onDrag={this.handleDrag}
                    onClick={this.selectEvent}
                    onDragEnd={this.handleDragEnd}
                    onDragStart={this.handleDragStart}
                    onMouseEnter={this.props.onEventEnter}
                    onMouseLeave={this.props.onEventLeave}

                    // context menu props
                    onEditEvent={this.props.onEditEvent}
                    onDoneEvent={this.props.onDoneEvent}
                    onDeleteEvent={this.props.onDeleteEvent}
                    onContextOpen={() => this.setState({ lockScroll: true })}
                    onContextClose={() => this.setState({ lockScroll: false })}
                />
            );
        });

        this.setState({
            eventsToRender
        }, () => {
            if (moment().startOf('week').week() === this.props.currentWeek) {
                this.scrollToCurrentDate();
            } else {
                if (!this.calendarScrolled) {
                    this.calendar.scrollTo(0, 0);
                }
            }

            this.calendarScrolled = true;
        });
    }
}
