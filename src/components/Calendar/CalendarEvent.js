import moment from 'moment';
import React from 'react';
import { DATA_DATE_FORMAT, createClassName } from '../../helpers';
import { ContextMenu } from '../ContextMenu';

export class CalendarEvent extends React.Component {
    static defaultProps = {
        event: {},
        order: {},
        machine: {},
        scrollLeft: 0,
        selectedEvent: {},
        draggingEvent: {},
        onDoneEvent: () => {},
        onEditEvent: () => {},
        onDeleteEvent: () => {},
        calendarWrapperClientRect: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            resizerActive: false
        };

        this.draggableParentDiv = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyUp = (e) => {
        const {
            event,
            selectedEvent,
        } = this.props;

        if (!selectedEvent || (selectedEvent && (selectedEvent.id !== event.id))) {
            return;
        }

        e.preventDefault();

        if (e.keyCode === 46 || e.keyCode === 8) {
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

        const { dateFrom, dateTo } = event;
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

    render() {
        const {
            resizerActive,
        } = this.state;

        const {
            event,
            order,
            selectedEvent,
            draggingEvent
        } = this.props;
        const style = Object.assign({}, this.positionEvent());

        if (resizerActive) {
            style.opacity = '0.5';
            style.pointerEvents = 'none';
        }

        return (
            <ContextMenu
                key={event.id}
                onOpen={this.props.onContextOpen}
                onClose={this.props.onContextClose}
                buttons={[
                    {
                        label: 'Upravit',
                        onClick: (e) => this.props.onEditEvent(e, event),
                    },
                    {
                        label: 'Smazat',
                        onClick: (e) => this.props.onDeleteEvent(e, event),
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
                    title={
                        event.productName + '\n' +
                        event.worker + '\n' +
                        event.note
                    }
                    style={style}
                    ref={this.draggableParentDiv}
                    onDragEnd={this.props.onDragEnd}
                    onDrag={(e) => this.props.onDrag(e, event)}
                    onClick={(e) => this.props.onClick(e, event)}
                    onDragStart={(e) => this.props.onDragStart(e, event)}
                    onMouseEnter={(e) => this.props.onMouseEnter(e, event)}
                    onMouseLeave={(e) => this.props.onMouseLeave(e, event)}
                    onDoubleClick={(e) => this.props.onDoubleClick(e, event)}
                    draggable={(order.done || event.done) ? false : !resizerActive}
                >
                    <div
                        className="calendar--event-text"
                    >
                        <p>
                            <strong>
                                {event.productName}
                            </strong>
                        </p>
                        <p>{event.worker}</p>
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
