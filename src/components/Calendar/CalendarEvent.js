import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import { ContextMenu } from '../ContextMenu';
import {
    FULL_FORMAT,
    createClassName,
    DATA_DATE_FORMAT,
} from '../../helpers';

export class CalendarEvent extends React.Component {
    static defaultProps = {
        event: {},
        machine: {},
        scrollLeft: 0,
        calendarWrapperClientRect: {}
    };

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
            top: `${startPosition.top - calendarWrapper.top}px`,
            left: `${startPosition.left - calendarWrapper.left + scrollLeft}px`,
        };

        return style;
    }

    render() {
        const {
            event,
        } = this.props;
        const style = this.positionEvent();

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
                            // draggingEvent && draggingEvent.id === event.id ? 'calendar--event-dragging' : null,
                            // selectedEvent && selectedEvent.id === event.id ? 'calendar--event-selected' : null,
                        ])
                    }
                    style={style}
                    draggable={true}
                    onDragEnd={this.props.onDragEnd}
                    onDrag={(e) => this.props.onDrag(e, event)}
                    onClick={(e) => this.props.onClick(e, event)}
                    onMouseEnter={(e) => this.props.onMouseEnter(e, event)}
                    onMouseLeave={(e) => this.props.onMouseLeave(e, event)}
                    onDragStart={(e) => this.props.onDragStart(e, event)}
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
    }
} 
