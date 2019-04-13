import React, { Fragment, PureComponent } from 'react';
import moment from 'moment';

import { Tooltip } from '../Tooltip';
import { OPERATION_COLUMNS } from './';
import { OrderRowTooltip } from './OrderRowTooltip';
import { openTableContextMenu } from '../ContextMenu';
import {
    createClassName,
    DATA_DATE_FORMAT,
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
        const { _key, objKey, order, product } = this.props;
        const { id } = order;

        if (type === 'edit-term') {
            this.props.editPlannedFinishDate(_key, product);
        } else if (type === 'save-term') {
            this.props.onBlur(id, objKey);
        } else {
            this.props.onContextMenu(objKey, id, type === 'close-product');
        }
    };

    render () {
        const {
            _key,
            order,
            objKey,
            product,
            rowSpan,
            isLastRow,
            showOrderId,
            columnsVisibility,
            plannedFinishDateValue,
            editPlannedFinishDateRow,
            // fn
            onBlur,
            onChange,
        } = this.props;
        const { id, name, color } = order;

        // const totalWorkingTime = formatMinutesToTime(product.totalWorkingTime);
        const totalOperationTime = formatMinutesToTime(product.totalOperationTime);
        const warningClassNameBeforeToday = getWarningClassName(product.plannedFinishDate, product.done);
        const lastWorkingDate = product.lastWorkingDate ? moment(product.lastWorkingDate).format(DATA_DATE_FORMAT) : '-';
        const plannedFinishDate = product.plannedFinishDate ? moment(product.plannedFinishDate).format(DATA_DATE_FORMAT) : '-';
        const className = [
            warningClassNameBeforeToday,
            isLastRow ? 'order-table--last-row' : null,
            product.done ? 'product--finished' : null,
        ].filter(Boolean).join(' ');

        return (
            <tr
                className={className}
                onContextMenu={this.handleContextMenu}
            >
                {
                    showOrderId && (
                        <td
                            rowSpan={rowSpan}
                            className="table--orders__fixed--column order-table--last-row"
                        >
                            <p style={{ backgroundColor: color }}>{name}</p>
                        </td>
                    )
                }
                <td title={objKey} className="table--orders-100">
                    <Tooltip overlay={this.renderOrderTooltip(product)}>
                        <div className="cut-text">
                            {product.coop && <strong className="text-danger product--coop">* &nbsp;</strong>}
                            { objKey }
                        </div>
                    </Tooltip>
                </td>
                <td>{product.totalCount}</td>
                {
                    OPERATION_COLUMNS.map((column) => {
                        // eslint-disable-next-line eqeqeq
                        if ((columnsVisibility[column] === true) || (columnsVisibility[column] == undefined)) {
                            return (
                                <td
                                    key={column}
                                >
                                    {this.renderOperationCell(product.operation, Number(column))}
                                </td>
                            );
                        }

                        return null;
                    })
                }
                <td title={lastWorkingDate}>
                    {lastWorkingDate}
                </td>
                <td title={''}>
                    {
                        // TODO: předat jako isTermEditing prop
                        editPlannedFinishDateRow === _key
                        ? <input
                            type="datetime-local"
                            onChange={onChange}
                            name="plannedFinishDateValue"
                            value={plannedFinishDateValue}
                            className="form-control form-control-sm"
                            onBlur={() => onBlur(id, objKey)}
                        />
                        : plannedFinishDate
                    }
                </td>
                <td title={totalOperationTime}>
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
                    {moment(date).format(DATA_DATE_FORMAT)}
                </button>
            </li>
        );
    };
}
