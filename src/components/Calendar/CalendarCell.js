import React from 'react';
import moment from 'moment';
import {
    createClassName,
    DATA_DATE_FORMAT,
} from '../../helpers';

export class CalendarCell extends React.Component {
    static defaultProps = {
        hours: 1,
        minutes: 0,
        shiftEnd: '',
        day: moment(),
        className: [],
        shiftStart: '',
        cellOver: moment(),
    };

    render() {
        const {
            day,
            hours,
            minutes,
            colSpan,
            machine,
            shiftEnd,
        } = this.props;

        let isShift = false;
        const [endHours, endMinutes] = shiftEnd.split(':');
        const dateTime = day.hours(hours).minutes(minutes).seconds(0).format(DATA_DATE_FORMAT);

        if (endHours && endMinutes) {
            const endShiftDataTime = moment(day).hours(endHours).minutes(endMinutes).seconds(0);
            isShift = moment(dateTime, DATA_DATE_FORMAT).isBefore(endShiftDataTime);
        }

        const emptyCellclassNames = createClassName([
            'calendar-table--empty-hours',
            isShift ? 'calendar--shift-hours' : null,
            ...this.props.className,
        ]);

        return (
            <td
                colSpan={colSpan}
                data-date={dateTime}
                className={emptyCellclassNames}
                data-machine={machine && machine.id}
                
                // drag and drop
                onDrop={this.props.onDrop}
                onDragOver={this.props.onDragOver}
                onMouseDown={this.props.onMouseDown}
                onDragEnter={this.props.onDragEnter}
                onDragLeave={this.props.onDragLeave}
            >
                {this.props.children}
            </td>
        );
    }
} 
