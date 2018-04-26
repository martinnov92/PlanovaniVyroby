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
        calendarWrapperClientRect: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            resizerActive: false
        };
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

        const calendarWrapper = calendarWrapperClientRect.getBoundingClientRect();
        let style = {
            backgroundColor: machine.color,
            height: `${startPosition.height}px`,
            width: `${endPosition.left - startPosition.left}px`,
            top: `${startPosition.top - calendarWrapper.top - 1}px`,
            left: `${startPosition.left - calendarWrapper.left + scrollLeft}px`,
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

        const stringifyEvent = JSON.stringify(this.props.event);
        e.dataTransfer.setData('event', stringifyEvent);
        e.dataTransfer.setData('eventResize', e.target.dataset.resize);
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
            console.log(resizerActive);
            style.zIndex = -1;
        }

        return (
            <ContextMenu
                key={event.id}
                onOpen={() => this.setState({ lockScroll: true })}
                onClose={() => this.setState({ lockScroll: false })}
                buttons={[
                    {
                        label: 'Upravit',
                        onClick: (e) => this.props.onEditEvent(e, event),
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
                    draggable={!resizerActive}
                    onDragEnd={this.props.onDragEnd}
                    onDrag={(e) => this.props.onDrag(e, event)}
                    onClick={(e) => this.props.onClick(e, event)}
                    ref={(node) => this.draggableParentDiv = node}
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
