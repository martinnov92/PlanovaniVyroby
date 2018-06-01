import isEqual from 'lodash/isEqual';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    FULL_FORMAT,
    createClassName,
    filterDataByDate,
    DATA_DATE_FORMAT,
    getNetMachineTime,
    formatMinutesToTime,
    getCorrectDateAfterDrop,
} from '../../helpers';
import { Tooltip } from '../Tooltip';
import { CalendarCell, CalendarEvent } from './';
import './calendar.css';

const CELL_OVER_CLASS_NAME = 'calendar--event-dragging--over';

export class Calendar extends React.Component {
    static defaultProps = {
        pause: 11,
        events: [],
        machines: [],
        orderList: [],
        currentWeek: 1,
        shiftEnd: '15:30',
        shiftStart: '07:00',
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
            selectingCells: false,
            calendarTableWidth: 0,
            dragActiveCellInfo: '',
            selectingCellStart: null,
            selectedEventElement: null,
            selectingCellStyle: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            },
            selectingCellTime: 0,
        };

        this.calendarScrolled = false;
        this.currentDate = React.createRef();
    }

    componentDidMount() {
        this.getDimensions();
        this.renderTableBody();

        window.addEventListener('resize', this.renderEvents);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('mousemove', this.handleMouseMove);
        ReactDOM.findDOMNode(this.calendar).addEventListener('scroll', this.handleScroll);
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            scrollTop,
            scrollLeft,
        } = this.state;

        const events = !isEqual(this.props.events, prevProps.events);
        const machines = !isEqual(this.props.machines, prevProps.machines);
        const currentWeek = prevProps.currentWeek !== this.props.currentWeek;
        const orderList = !isEqual(this.props.orderList, prevProps.orderList);
        const dragging = prevState.draggingEvent !== this.state.draggingEvent;
        const selectedEvent = prevState.selectedEvent !== this.state.selectedEvent;
        // zkontrolovat scroll, pokud došlo k drop události a kalendář se sám zascroloval (vyrovnat zobrazení)
        const scrollChanged = (prevState.scrollTop !== 0 && scrollTop === 0) || (prevState.scrollLeft !== 0 && scrollLeft === 0);

        if (currentWeek) {
            this.calendarScrolled = false;
        }

        if (currentWeek || events || machines) {
            this.renderTableBody();
        }

        if (dragging || selectedEvent || events || orderList || scrollChanged) {
            this.renderEvents();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.renderEvents);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('mousemove', this.handleMouseMove);
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

        this.props.onDragStart();
    }

    handleDrag = (e, event) => {
        // console.log('handle');
    }

    handleDragEnter = (e) => {
        e.target.classList.add(CELL_OVER_CLASS_NAME);
        let targetRect = {};

        if (e.target) {
            targetRect = e.target.getBoundingClientRect();
        }

        this.setState({
            dragActiveCell: targetRect,
            dragActiveCellInfo: e.target.dataset.date,
        });
    }

    handleDragOver = (e) => {
        e.preventDefault();
        // console.log('over');
    }

    handleDragLeave = (e) => {
        e.target.classList.remove(CELL_OVER_CLASS_NAME);
    }

    handleDragEnd = (e) => {
        this.setState({
            draggingEvent: null,
            dragActiveCell: null,
        });

        const classListToRemove = Array.from(this.calendar.getElementsByClassName(CELL_OVER_CLASS_NAME));
        if (classListToRemove.length > 0) {
            classListToRemove.forEach((node) => node.classList.remove(CELL_OVER_CLASS_NAME));
        }
    }

    handleDrop = (e) => {
        e.preventDefault();

        this.setState({
            draggingEvent: null,
        });

        // získání eventu z drop eventy
        const machineId = e.target.dataset.machine;
        const parsedEvent = JSON.parse(e.dataTransfer.getData('text'));
        const dateOnDrop = moment(e.target.dataset.date, DATA_DATE_FORMAT);

        let dateFrom = moment(parsedEvent.event.dateFrom);
        let dateTo = moment(parsedEvent.event.dateTo);

        if (parsedEvent.eventResize === 'dateFrom') {
            dateFrom = dateOnDrop.format();
        } else if (parsedEvent.eventResize === 'dateTo') {
            dateTo = dateOnDrop.format();
        } else {
            dateTo = getCorrectDateAfterDrop(dateFrom, dateTo, dateOnDrop);
            // set new dateFrom and dateTo on object and pass it to parent component
            dateFrom = dateOnDrop.format();
        }

        const newEvent = {
            ...parsedEvent.event,
            dateTo: dateTo,
            dateFrom: dateFrom,
            machine: machineId,
        };

        this.props.onEventDrop(newEvent);
    }

    handleEventMouseDown = (e) => {
        if (e.nativeEvent.button === 1 || e.nativeEvent.button === 2) {
            return;
        }

        e.preventDefault();

        this.setState({
            selectingCells: true,
            selectingCellStart: e.target,
        });
    }

    handleMouseMove = (e) => {
        if (!this.state.selectingCells) {
            return;
        }

        const selectingCellTime = getNetMachineTime(moment(this.state.selectingCellStart.dataset.date, DATA_DATE_FORMAT), moment(e.target.dataset.date, DATA_DATE_FORMAT));

        const startCell = this.state.selectingCellStart.getBoundingClientRect();
        const endCell = e.target.getBoundingClientRect();

        const top = startCell.top;
        const left = startCell.left;
        const height = startCell.height;
        let width = endCell.x - startCell.x;

        if (endCell.x === startCell.x) {
            // fixnutí přeblíkávání při zmenšování události
            const { width: stateWidth} = this.state.selectingCellStyle;
            width = stateWidth - startCell.width;
        }

        this.setState({
            selectingCellStyle: {
                top: top,
                left: left,
                width: width,
                height: height,
            },
            selectingCellTime: selectingCellTime,
        });
    }

    handleMouseUp = (e) => {
        if (!this.state.selectingCells) {
            return;
        }

        if (e.target.dataset.date && e.target.dataset.machine) {
            const machineId = this.state.selectingCellStart.dataset.machine;
            const dateFrom = moment(this.state.selectingCellStart.dataset.date, DATA_DATE_FORMAT).format();
            const dateTo = moment(e.target.dataset.date, DATA_DATE_FORMAT).format();

            this.props.onMouseUp(dateFrom, dateTo, machineId);
        }

        this.setState({
            selectingCells: false,
            selectingCellStart: e.target,
            selectingCellStyle: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            },
        });
    }

    render() {
        const {
            lockScroll,
            selectingCells,
            selectingCellTime,
            selectingCellStyle,
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
                                height: '43px',
                                border: 0,
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

                    {
                        selectingCells
                        ? <div
                            className={createClassName([
                                'calendar--event',
                                'calendar--event-selecting', 'bg-secondary',
                            ])}
                            style={selectingCellStyle}
                        >
                            {
                                selectingCellStyle.width > 0 && selectingCellTime
                                ? <p className="text-light">
                                    <strong>{formatMinutesToTime(selectingCellTime)}</strong>
                                </p>
                                : null
                            }
                        </div>
                        : null
                    }

                    {
                        !this.state.dragActiveCell
                        ? null
                        : <div
                            className="pd-tooltip__inner"
                            style={{
                                position: 'absolute',
                                top: `${this.state.dragActiveCell.top - this.state.dragActiveCell.height}px`,
                                left: `${this.state.dragActiveCell.left}px`,
                            }}
                        >
                            { this.state.dragActiveCellInfo }
                        </div>
                    }
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
                {this.renderDaysCell(true, machine)}
            </tr>;
        });

        this.setState({
            renderTableBody: body,
        }, () => {
            this.renderEvents();
        });
    }

    renderDaysCell = (empty = false, machine = {}) => {
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
                    i >= 5 ? 'calendar-day--weekend' : null,
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
                                {this.renderHoursEmptyCell(empty, day, machine)}
                            </tr>
                        </tbody>
                    </table>
                </td>;

            days.push(td);
        }

        return days;
    }

    renderHoursEmptyCell = (empty = false, day, machine) => {
        const hours = [];
        const { pause, shiftStart, shiftEnd, } = this.props;

        const weekend = moment(day).toDate().getDay();
        const current = moment().startOf('day').isSame(day);

        if (empty === false) {
            for (let i = 7; i <= 20; i++) {
                let td = <td
                    key={i}
                    colSpan={2}
                    className={createClassName([
                        'calendar-table--hours',
                        current ? 'calendar-day--current bg-danger text-light' : null,
                        (weekend === 6 || weekend === 0) ? 'calendar-day--weekend' : null,
                    ])}
                >
                    {i}
                </td>;
                hours.push(td);
            }

            return hours;
        }

        // from 7:00 to 20:00
        const shiftStartSplit = shiftStart.split(':');
        const shiftStartEnd = shiftEnd.split(':');

        for (let i = 7; i <= 20; i++) {
            const cellAttrs = {
                onDrop: this.handleDrop,
                onDragOver: this.handleDragOver,
                onDragEnter: this.handleDragEnter,
                onDragLeave: this.handleDragLeave,
                onMouseDown: this.handleEventMouseDown,
            };

            const isPause = (pause === i) ? 'calendar--cell-pause' : null;
            const isShift = (i >= shiftStartSplit[0] && i <= shiftStartEnd[0]) ? 'calendar--shift-hours' : '';
 
            let td = <React.Fragment key={i}>
                <CalendarCell
                    day={day}
                    hours={i}
                    minutes={0}
                    machine={machine}
                    className={[isPause, isShift]}
                    {...cellAttrs}
                    // onClick={() => console.log('click', i)}
                />
                <CalendarCell
                    day={day}
                    hours={i}
                    minutes={30}
                    machine={machine}
                    className={[isShift]}
                    {...cellAttrs}
                />
            </React.Fragment>;

            if (i === 20) {
                td = <CalendarCell
                    key={i}
                    day={day}
                    hours={i}
                    minutes={0}
                    colSpan={2}
                    machine={machine}
                    className={[isPause]}
                    onClick={() => console.log('click', i)}
                    {...cellAttrs}
                />
            }

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
        const filteredEvents = filterDataByDate(events, startOfTheWeek, endOfTheWeek);

        const eventsToRender = filteredEvents.map((event) => {
            const order = orderList.find((o) => o.id === event.orderId);
            const machine = machines.find((machine) => machine.id === event.machine);
            let row = null;

            if (machine) {
                row = ReactDOM.findDOMNode(this[machine.id]);
            } else {
                return null;
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
                    onDoubleClick={this.props.onDoubleClick}

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
