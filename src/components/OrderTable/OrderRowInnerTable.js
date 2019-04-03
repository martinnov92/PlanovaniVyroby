import React, { Fragment, PureComponent } from 'react';
import moment from 'moment';

import { Tooltip } from '../Tooltip';
import { OPERATION_COLUMNS } from './';
import { OrderRowTooltip } from './OrderRowTooltip';
import { openTableContextMenu } from '../ContextMenu';
import {
    createClassName,
    DATA_DATE_FORMAT,
    createStyleObject,
    getWarningClassName,
    formatMinutesToTime,
    calculateOperationTime,
} from '../../utils/helpers';

export class OrderRowInnerTable extends PureComponent {
    handleContextMenu = () => {
        const { _key, product, commission, editPlannedFinishDateRow } = this.props;

        if (commission._info.done) {
            return;
        }

        // isEditing => jestli se edituje termín
        const isEditing = editPlannedFinishDateRow === _key;

        openTableContextMenu(false, product.done, isEditing, this.handleContextMenuClick);
    };

    handleContextMenuClick = (type) => {
        const { _key, objKey, orderId, product } = this.props;

        if (type === 'edit-term') {
            this.props.editPlannedFinishDate(_key, product);
        } else if (type === 'save-term') {
            this.props.onBlur(orderId, objKey);
        } else {
            this.props.onContextMenu(objKey, orderId, type === 'close-product');
        }
    };

    render () {
        const {
            _key,
            objKey,
            product,
            thWidth,
            orderId,
            columnsVisibility,
            plannedFinishDateValue,
            editPlannedFinishDateRow,
            // fn
            onBlur,
            onChange,
        } = this.props;

        // const totalWorkingTime = formatMinutesToTime(product.totalWorkingTime);
        const totalOperationTime = formatMinutesToTime(product.totalOperationTime);
        const warningClassNameBeforeToday = getWarningClassName(product.plannedFinishDate, product.done);
        const lastWorkingDate = product.lastWorkingDate ? moment(product.lastWorkingDate).format(DATA_DATE_FORMAT) : '-';
        const plannedFinishDate = product.plannedFinishDate ? moment(product.plannedFinishDate).format(DATA_DATE_FORMAT) : '-';
        const className = [
            warningClassNameBeforeToday,
            product.done ? 'product--finished' : null,
        ].filter(Boolean).join(' ');

        return (
            <tr
                className={className}
                onContextMenu={this.handleContextMenu}
            >
                <td className="table--orders__fixed--column"></td>
                <td
                    title={objKey}
                    style={createStyleObject(thWidth['order'], false)}
                >
                    <Tooltip overlay={this.renderOrderTooltip(product)}>
                        <div>
                            {product.coop && <strong className="text-danger product--coop">* &nbsp;</strong>}
                            { objKey }
                        </div>
                    </Tooltip>
                </td>
                <td style={createStyleObject(thWidth['count'], false)}>
                    {product.totalCount}
                </td>
                {
                    OPERATION_COLUMNS.map((column) => {
                        // eslint-disable-next-line eqeqeq
                        if ((columnsVisibility[column] === true) || (columnsVisibility[column] == undefined)) {
                            return (
                                <td
                                    key={column}
                                    style={createStyleObject(thWidth[column])}
                                >
                                    {this.renderOperationCell(product.operation, Number(column))}
                                </td>
                            );
                        }

                        return null;
                    })
                }
                <td
                    style={createStyleObject(thWidth['lastWorkingDate'], false)}
                    title={lastWorkingDate}
                >
                    {lastWorkingDate}
                </td>
                <td
                    style={createStyleObject(thWidth['plannedFinishDate'], false)}
                    title={''}
                >
                    {
                        // TODO: předat jako isTermEditing prop
                        editPlannedFinishDateRow === _key
                        ? <input
                            type="datetime-local"
                            onChange={onChange}
                            name="plannedFinishDateValue"
                            value={plannedFinishDateValue}
                            className="form-control form-control-sm"
                            onBlur={() => onBlur(orderId, objKey)}
                        />
                        : plannedFinishDate
                    }
                </td>
                <td
                    style={createStyleObject(thWidth['totalOperationTime'], false)}
                    title={totalOperationTime}
                >
                    {totalOperationTime}
                </td>
            </tr>
        );
    }

    renderOperationCell (operation, orderIndex) {
        // eslint-disable-next-line eqeqeq
        const index = operation.findIndex((o) => o.order == orderIndex);

        if (index < 0) {
            return <div> - </div>;
        }

        const {
            time,
            count,
            casting,
            exchange,
            workingHoursForOperation = 0,
        } = operation[index];

        let operationTime = 0;

        if (operation.operationTime) {
            operationTime = operation.operationTime;
        } else {
            operationTime = calculateOperationTime(count, time, exchange, casting);
        }

        const calculateHoursRemainder = operationTime - workingHoursForOperation;
        const sign = Math.sign(Math.round(calculateHoursRemainder));
        const className = createClassName([ sign < 0 ? 'text-primary' : (sign === 0 ? null : 'text-danger') ]);

        return (
            <OrderRowTooltip
                sign={sign}
                operation={operation[index]}
                operationTime={operationTime}
                calculateHoursRemainder={calculateHoursRemainder}
                moveToDate={this.props.moveToDate}
            >
                <div>
                    <strong>{count} ks. </strong>
                    <span>({formatMinutesToTime(operationTime)})</span> {` `}
                    <span>[{formatMinutesToTime(workingHoursForOperation)}]</span>{` `}
                    <strong className={className}>
                        {`{`}{ sign < 0 ? '+' : (sign === 0 ? '' : '-') }{formatMinutesToTime(Math.abs(calculateHoursRemainder))}{`}`}
                    </strong>
                </div>
            </OrderRowTooltip>
        );
    }

    renderOrderTooltip (product) {
        let cooperationIndex = -1;
        let hasCooperation = false;

        if (product && product.operation) {
             // najít kooperaci
             // eslint-disable-next-line eqeqeq
             cooperationIndex = product.operation.findIndex((o) => o.order == '7');
             hasCooperation = cooperationIndex !== -1;
        }

        const operations = product.operation.sort((a, b) => Number(a.order) >= Number(b.order));

        return (
            <div>
                {
                    hasCooperation && (
                        <Fragment>
                            <p><strong>Kooperace</strong></p>
                            <p>{product.operation[cooperationIndex].note}</p>
                            <br />
                        </Fragment>
                    )
                }

                <p>Náplánováno ve dnech:</p>
                <div className="area--dates">
                    <ul>
                        {operations.map(({ dates, note, order}) => {
                            return (
                                <Fragment key={order}>
                                    {!hasCooperation && <li><strong>{order}. operace</strong></li>}
                                    {note && <li>{note}</li>}
                                    {dates.sort().map(this.renderOrderTooltipDates)}
                                </Fragment>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }

    renderOrderTooltipDates = (date, index) => {
        return (
            <li key={date + index}>
                <button
                    className="btn btn-link text-dark"
                    onClick={() => this.props.moveToDate(date)}
                >
                    { moment(date).format(DATA_DATE_FORMAT) }
                </button>
            </li>
        );
    };
}
