import React from 'react';
import moment from 'moment';
import { ContextMenu } from '../ContextMenu';
import {
    createClassName,
    DATA_DATE_FORMAT,
} from '../../helpers';

export class CalendarEvent extends React.Component {
    static defaultProps = {
        event: {},
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

    positionEvent = () => {
        const {
            row,
            event,
            machine,
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
                top: rowClientRect.top + 1,
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
                top: rowClientRect.top + 1,
                left: rowClientRect.left,
                height: rowClientRect.height - 2,
            };

            endPosition = {
                top: rowClientRect.top,
                left: rowClientRect.right,
            };
        }

        const calendarWrapper = calendarWrapperClientRect.getBoundingClientRect();
        let style = {
            backgroundColor: machine.color,
            height: `${startPosition.height}px`,
            width: `${endPosition.left - startPosition.left}px`,
            top: `${startPosition.top - calendarWrapper.top - 1}px`,
            left: `${startPosition.left - calendarWrapper.left + scrollLeft - 1}px`,
        };

        return style;
    }

    handleResizerDragStart = (e) => {
        e.stopPropagation();

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
            selectedEvent,
            draggingEvent
        } = this.props;
        const style = Object.assign({}, this.positionEvent());

        if (resizerActive) {
            style.zIndex = -1;
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
                    },
                    {
                        label: 'Hotovo',
                        onClick: (e) => this.props.onDoneEvent(e, event),
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
                        event.label + '\n' +
                        event.worker + '\n' +
                        event.note
                    }
                    style={style}
                    draggable={!resizerActive}
                    onDragEnd={this.props.onDragEnd}
                    onDrag={(e) => this.props.onDrag(e, event)}
                    onClick={(e) => this.props.onClick(e, event)}
                    ref={this.draggableParentDiv}
                    onMouseEnter={(e) => this.props.onMouseEnter(e, event)}
                    onMouseLeave={(e) => this.props.onMouseLeave(e, event)}
                    onDragStart={(e) => this.props.onDragStart(e, event)}
                >
                    <div
                        className="calendar--event-text"
                    >
                        <p>
                            <strong>
                                {event.label}
                            </strong>
                        </p>
                        <p>{event.worker}</p>
                    </div>

                    <div
                        draggable={true}
                        data-resize="dateFrom"
                        onDragStart={this.handleResizerDragStart}
                        onDragEnd={this.handleResizerDragEnd}
                        className="calendar--event--resizer calendar--event--resizer-left"
                    />

                    <div
                        draggable={true}
                        data-resize="dateTo"
                        onDragStart={this.handleResizerDragStart}
                        onDragEnd={this.handleResizerDragEnd}
                        className="calendar--event--resizer calendar--event--resizer-right"
                    />
                </div>
            </ContextMenu>
        );
    }
} 
