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
        day: moment(),
        cellOver: moment(),
    };

    render() {
        const {
            day,
            hours,
            minutes,
            colSpan,
        } = this.props;

        const dateTime = day.hours(hours).minutes(minutes).seconds(0).format(DATA_DATE_FORMAT);
        const emptyCellclassNames = createClassName([
            'calendar-table--empty-hours',
            Array.isArray(this.props.className) ? [...this.props.className] : this.props.className,
        ]);

        return (
            <td
                colSpan={colSpan}
                data-date={dateTime}
                className={emptyCellclassNames}
                onClick={this.props.onClick}

                // drag and drop
                onDrop={this.props.onDrop}
                onDragOver={this.props.onDragOver}
                onDragEnter={this.props.onDragEnter}
                onDragLeave={this.props.onDragLeave}
            >
                {this.props.children}
            </td>
        );
    }
} 
