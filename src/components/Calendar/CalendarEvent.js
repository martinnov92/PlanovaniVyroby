import moment from 'moment';
import React from 'react';
import { DATA_DATE_FORMAT, createClassName, formatMinutesToTime } from '../../helpers';
import { ContextMenu } from '../ContextMenu';

export class CalendarEvent extends React.Component {
    static defaultProps = {
        event: {},
        order: {},
        machine: {},
        scrollLeft: 0,
        selectedEvent: {},
        draggingEvent: {},
        onClick: () => {},
        onDoneEvent: () => {},
        onEditEvent: () => {},
        onDeleteEvent: () => {},
        onClickOutside: () => {},
        calendarWrapperClientRect: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedEvent: null,
            resizerActive: false,
            selectedEventElement: null,
        };

        this.draggableParentDiv = React.createRef();
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('click', this.handleClickOutside);
    }

    handleClick = (e, event) => {
        this.props.onClick(e, event);

        this.setState({
            selectedEvent: event,
            selectedEventElement: e.target,
        });

        document.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('click', this.handleClickOutside);
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

        this.props.onClickOutside();

        this.setState({
            selectedEvent: null,
            selectedEventElement: null,
        });

        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('click', this.handleClickOutside);
    }

    handleResizerDragStart = (e) => {
        e.stopPropagation();

        window.dispatchEvent(new Event('resize'));

        setTimeout(() => {
            this.setState({
                resizerActive: true,
            });
        }, 0);

        e.dataTransfer.setData('text', JSON.stringify({
            event: this.props.event,
            eventResize: e.target.dataset.resize,
        }));
    }

    handleResizerDragEnd = (e) => {
        this.setState({
            resizerActive: false,
        });
    }

    handleKeyUp = (e) => {
        const {
            selectedEvent,
        } = this.state;
        const {
            event,
        } = this.props;

        if (!selectedEvent || (selectedEvent && (selectedEvent.id !== event.id))) {
            return;
        }

        e.preventDefault();
        const element = e.target;
        if ((e.keyCode === 46 || e.keyCode === 8) && (document.activeElement === element)) {
            this.props.onDeleteEvent(e, event);
        }
    }

    positionEvent = () => {
        const {
            row,
            event,
            order,
            scrollTop,
            scrollLeft,
            calendarWrapperClientRect,
        } = this.props;

        let { dateFrom, dateTo } = event;
        let minutesFrom = moment(dateFrom).get('minutes');
        let minutesTo = moment(dateTo).get('minutes');

        if (minutesFrom > 0 && minutesFrom < 30) {
            dateFrom = moment(dateFrom).minutes(0);
        } else if (minutesFrom > 30 && minutesFrom <= 59) {
            dateFrom = moment(dateFrom).add(1, 'hours').minutes(0);
        }

        if (minutesTo > 0 && minutesTo < 30) {
            dateTo = moment(dateTo).minutes(0);
        } else if (minutesTo > 30 && minutesTo <= 59) {
            dateTo = moment(dateTo).add(1, 'hours').minutes(0);
        }

        const startDate = moment(dateFrom).format(DATA_DATE_FORMAT);
        const endDate = moment(dateTo).format(DATA_DATE_FORMAT);

        if (!row) {
            return null;
        }

        const rowClientRect = row.getBoundingClientRect();
        const findStartDateOnRow = row.querySelector(`[data-date="${startDate}"]`);
        const findEndDateOnRow = row.querySelector(`[data-date="${endDate}"]`);

        let startPosition;
        let endPosition;

        if (!findStartDateOnRow && findEndDateOnRow) {
            endPosition = findEndDateOnRow.getBoundingClientRect();
            startPosition = {
                top: rowClientRect.top,
                left: rowClientRect.left,
                height: endPosition.height,
            };
        } else if (findStartDateOnRow && !findEndDateOnRow) {
            startPosition = findStartDateOnRow.getBoundingClientRect();
            endPosition = {
                top: rowClientRect.top,
                left: rowClientRect.right,
            };
        } else if (findStartDateOnRow && findEndDateOnRow) {
            startPosition = findStartDateOnRow.getBoundingClientRect();
            endPosition = findEndDateOnRow.getBoundingClientRect();
        } else {
            // událost přes více týdnů -> mělo by fungovat, protože dojde k vyfiltrování událostí v Calendar.js
            startPosition = {
                top: rowClientRect.top,
                left: rowClientRect.left,
                height: rowClientRect.height,
            };

            endPosition = {
                top: rowClientRect.top,
                left: rowClientRect.right,
            };
        }

        const calendarWrapper = calendarWrapperClientRect.getBoundingClientRect();
        let style = {
            height: `${startPosition.height}px`,
            backgroundColor: order.color || '#fff',
            opacity: (order.done || event.done) ? '0.5' : 1,
            width: `${endPosition.left - startPosition.left}px`,
            top: `${startPosition.top - calendarWrapper.top + scrollTop}px`,
            left: `${startPosition.left - calendarWrapper.left + scrollLeft}px`,
        };

        return style;
    }

    render() {
        const {
            resizerActive,
            selectedEvent,
        } = this.state;

        const {
            event,
            order,
            draggingEvent,
            displayOrdersInEvents,
        } = this.props;
        const style = Object.assign({}, this.positionEvent());
        const buttons = [
            {
                label: 'Smazat',
                onClick: (e) => this.props.onDeleteEvent(e, event),
            }
        ];

        if (!event.done) {
            buttons.unshift({
                label: 'Upravit',
                onClick: (e) => this.props.onEditEvent(e, event),
            });
        }

        if (resizerActive) {
            style.opacity = '0.5';
            style.pointerEvents = 'none';
        }

        return (
            <ContextMenu
                key={event.id}
                buttons={buttons}
                onOpen={this.props.onContextOpen}
                onClose={this.props.onContextClose}
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
                    title={
                        event.productName + '\n' +
                        event.worker + '\n' +
                        event.note
                    }
                    style={style}
                    ref={this.draggableParentDiv}
                    onDragEnd={this.props.onDragEnd}
                    onClick={(e) => this.handleClick(e, event)}
                    onDrag={(e) => this.props.onDrag(e, event)}
                    onDragStart={(e) => this.props.onDragStart(e, event)}
                    onMouseEnter={(e) => this.props.onMouseEnter(e, event)}
                    onMouseLeave={(e) => this.props.onMouseLeave(e, event)}
                    onDoubleClick={(e) => this.props.onDoubleClick(e, event)}
                    draggable={(order.done || event.done) ? false : !resizerActive}
                >
                    {
                        displayOrdersInEvents && (event.operation && event.operation.order !== '-')
                        ? <div className="calendar--event-operation">
                            { event.operation.order }.
                        </div>
                        : null
                    }

                    <div
                        className="calendar--event-text"
                    >
                        <p>
                            <strong>
                                { event.productName } ({ formatMinutesToTime(event.workingHours) })
                            </strong>
                        </p>

                        <p>
                            { event.worker }
                        </p>
                    </div>

                    <div
                        data-resize="dateFrom"
                        onDragEnd={this.handleResizerDragEnd}
                        onDragStart={this.handleResizerDragStart}
                        draggable={(order.done || event.done) ? false : true}
                        className="calendar--event--resizer calendar--event--resizer-left"
                    />

                    <div
                        data-resize="dateTo"
                        onDragEnd={this.handleResizerDragEnd}
                        onDragStart={this.handleResizerDragStart}
                        draggable={(order.done || event.done) ? false : true}
                        className="calendar--event--resizer calendar--event--resizer-right"
                    />
                </div>
            </ContextMenu>
        );
    }
} 
