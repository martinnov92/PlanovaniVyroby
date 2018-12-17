import React, { Component, PureComponent } from 'react';
import moment from 'moment';
import Tooltip from 'rc-tooltip';

import 'rc-tooltip/assets/bootstrap.css';
import { DATA_DATE_FORMAT, formatMinutesToTime } from '../../utils/helpers';

const TRIGGERS = [ 'click', 'hover' ];

export class OrderRowTooltip extends Component {
    render() {
        const { calculateHoursRemainder, operation, operationTime, sign } = this.props;

        const overlay = (
            <TooltipContent
                sign={sign}
                operation={operation}
                operationTime={operationTime}
                moveToDate={this.props.moveToDate}
                calculateHoursRemainder={calculateHoursRemainder}
            />
        );

        return (
            <Tooltip
                trigger={TRIGGERS}
                overlay={overlay}
                overlayClassName="tooltip"
                mouseEnterDelay={1}
                mouseLeaveDelay={.5}
                destroyTooltipOnHide={true}
            >
                {this.props.children}
            </Tooltip>
        );
    }
}

class TooltipContent extends PureComponent {
    render() {
        const { calculateHoursRemainder, operation, operationTime, sign } = this.props;
        const {
            time,
            note,
            casting,
            exchange,
            workingHoursForOperation = 0,
        } = operation;

        return (
            <div>
                {
                    note
                    ? <p>
                        <strong>Popis: </strong> {note}
                    </p>
                    : null
                }

                <br />

                {/* <p>Stroj: STROJ</p> */}
                <p>Čas na kus: {time} min.</p>
                <p>Výměna: {exchange} min.</p>
                <p>Nahazování: {casting} min.</p>

                <hr className="bg-white" />

                <p>Celkem na operaci: {formatMinutesToTime(operationTime)}</p>
                <p>Naplánováno: {formatMinutesToTime(workingHoursForOperation)}</p>
                <p>Zbývá: {sign === -1 ? '+' : (sign === 0 ? '' : '-')}{formatMinutesToTime(Math.abs(calculateHoursRemainder))}</p>

                <hr className="bg-white" />

                <p>
                    <strong>Náplánováno ve dnech:</strong>
                </p>
                <div className="area--dates">
                    <ul>
                        {
                            operation.dates.sort().map((date, i) => {
                                return <li key={`${date}-${i}`}>
                                    <button
                                        className="btn btn-link text-dark"
                                        onClick={() => this.props.moveToDate(date)}
                                    >
                                        { moment(date).format(DATA_DATE_FORMAT) }
                                    </button>
                                </li>;
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }
}
