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
            shiftStart,
        } = this.props;

        const dateTime = day.hours(hours).minutes(minutes).seconds(0).format(DATA_DATE_FORMAT);
        const [startHour, startMinute] = shiftStart.split(':');
        const [endHour, endMinute] = shiftEnd.split(':');

        const isShift =
            (hours >= startHour && minutes >= startMinute) && (hours <= endHour && minutes < endMinute) ? 'calendar--shift-hours' : null;
        console.log(hours, minutes, startHour, startMinute, endHour, endMinute);
        const emptyCellclassNames = createClassName([
            isShift,
            'calendar-table--empty-hours',
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
