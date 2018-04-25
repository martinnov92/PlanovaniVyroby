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
        } = this.props;

        const dateTime = day.hours(hours).minutes(minutes).seconds(0).format(DATA_DATE_FORMAT);
        const emptyCellclassNames = createClassName([
            'calendar-table--empty-hours',
        ]);

        return (
            <td
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
