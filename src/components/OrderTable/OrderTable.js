import React from 'react';
import moment from 'moment';
import { Tooltip } from '../Tooltip';
import { ContextMenu } from '../ContextMenu';
import {
    dispatchResize,
    createClassName,
    DATA_DATE_FORMAT,
    createStyleObject,
    getWarningClassName,
    formatMinutesToTime,
    calculateOperationTime,
    INPUT_DATE_TIME_FORMAT,
} from '../../utils/helpers';

import './order-table.css';

const OPERATION_COLUMNS = ['1', '2', '3', '4', '5', '6'];

export class OrderTable extends React.Component {
    static defaultProps = {
        orderList: [],
        groupedOrders: [],
        moveToDate: () => {},
        onCloseOrOpenItem: () => {},
    };

    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            thWidth: [],
            scrollTop: 0,
            scrollLeft: 0,
            rowHeights : [],
            activeOrder: null,
            fixedHeaderHeight: 0,
            plannedFinishDateValue: '',
            editPlannedFinishDateRow: null,
        };

        this.fixedHeader = React.createRef();
        this.tableWrapper = React.createRef();
        this.scrollableDiv = React.createRef();
    }

    componentDidMount() {
        this.setDimension();
        window.addEventListener('resize', this.setDimension);
        this.scrollableDiv.current.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        this.setState({
            scrollTop: this.scrollableDiv.current.scrollTop,
            scrollLeft: this.scrollableDiv.current.scrollLeft,
        });
    }

    handleOpenContext = (orderId) => {
        this.setState({
            activeOrder: orderId,
        });
    }

    handleCloseContext = () => {
        this.setState({
            activeOrder: null,
        });
    }

    setDimension = () => {
        const { groupedOrders } = this.props;

        try {
            const fixedHeader = this.fixedHeader.current;
            const fixedHeaderClientRect = fixedHeader.getBoundingClientRect();
            const fixedHeaderTh = Array.from(fixedHeader.getElementsByTagName('th'));
            const thWidth = {};

            for (let column of fixedHeaderTh) {
                thWidth[column.dataset.column] = Number(parseFloat(window.getComputedStyle(column).width));
            }

            const height = this.tableWrapper.current.getBoundingClientRect().height - fixedHeaderClientRect.height;

            const rowHeights = groupedOrders.map((commission) => {
                const rows = Array.from(this.scrollableDiv.current.querySelectorAll(`[data-order="${commission._info.orderId}"]`));

                return rows.reduce((acc, current) => {
                    if (current) {
                        return Number(parseFloat(window.getComputedStyle(current).height)) + acc;
                    }
    
                    return acc;
                }, 0);
            });

            this.setState({
                height,
                thWidth,
                rowHeights,
                width: fixedHeader.width,
                fixedHeaderHeight: fixedHeaderClientRect.height,
            });
        } catch (err) {}
    }

    editPlannedFinishDate = (e, key, product) => {
        const date = !!product.plannedFinishDate ? moment(product.plannedFinishDate).format(INPUT_DATE_TIME_FORMAT) : '';

        this.setState({
            plannedFinishDateValue: date,
            editPlannedFinishDateRow: key,
        }, dispatchResize);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    // e, orderId, productName
    handleSaveFinishDate = (e, orderId, productName) => {
        // convert input date time format to UTC format and send to App component to save it to file
        const { plannedFinishDateValue } = this.state;

        if (moment(plannedFinishDateValue).isValid()) {
            const date = moment(plannedFinishDateValue).format();
            this.props.handlePlannedDateSave(orderId, productName, date);
        } else {
            this.props.handlePlannedDateSave(orderId, productName, '');
        }

        this.setState({
            plannedFinishDateValue: '',
            editPlannedFinishDateRow: null,
        });
    }

    renderFixedColumn = () => {
        const { rowHeights, fixedHeaderHeight, } = this.state;
        const {
            orderList,
            groupedOrders,
        } = this.props;

        return (
            <div
                className="two-columns--left-side"
            >
                <div
                    className="column--fixed-header"
                    style={{
                        height: `${fixedHeaderHeight}px`,
                    }}
                >
                    <p>Zakázka</p>
                </div>

                <div
                    className="table--orders-first-column lock--scroll"
                    style={{
                        height: `calc(100% - ${fixedHeaderHeight}px)`,
                    }}
                >
                    <div
                        style={{
                            marginTop: 1,
                            transform: `translate3d(0, ${(this.state.scrollTop * -1)}px, 0)`,
                        }}
                    >
                    {
                        groupedOrders.map((commission, i) => {
                            const { orderId, done, color } = commission._info;
                            const o = orderList.find((_o) => _o.id === orderId);
                            const buttons = [];

                            if (done) {
                                buttons.push({
                                    label: 'Otevřít zakázku',
                                    // znovuotevření zakázky a všech produktů
                                    onClick: (e) => this.props.onCloseOrOpenItem(e, null, orderId, false),
                                });
                            } else {
                                buttons.push({
                                    label: 'Uzavřít zakázku',
                                    onClick: (e) => this.props.onCloseOrOpenItem(e, null, orderId),
                                });
                            }

                            return (
                                <ContextMenu
                                    key={orderId}
                                    buttons={buttons}
                                    style={{
                                        borderTop: 0,
                                        height: `${rowHeights[i]}px`,
                                        borderBottom: '2px solid var(--calendarDayBorderColor)',
                                    }}
                                    className={createClassName([
                                        'left-side--item',
                                        done ? 'order--finished' : null,
                                    ])}
                                    onClose={this.handleCloseContext}
                                    onOpen={() => this.handleOpenContext(orderId)}
                                >
                                    <Tooltip
                                        pointerEvents={false}
                                        className="table--orders-tooltip"
                                        title={
                                            <div>
                                                <p>
                                                    Naplánováno: &nbsp;
                                                    <strong>{formatMinutesToTime(commission._info.totalWorkingTime)}</strong>
                                                </p>
                                                <p>
                                                    Celkový čas: &nbsp;
                                                    <strong>{formatMinutesToTime(commission._info.totalTime)}</strong>
                                                </p>
                                            </div>
                                        }
                                    >
                                        <p style={{ backgroundColor: color, }}>
                                            { o ? o.name : '' }
                                        </p>
                                    </Tooltip>
                                </ContextMenu>
                            );
                        })
                    }
                    </div>
                </div>
            </div>
        );
    }

    renderTableBody = () => {
        const {
            thWidth,
            activeOrder,
            plannedFinishDateValue,
            editPlannedFinishDateRow,
        } = this.state;

        const {
            groupedOrders,
            columnsVisibility,
        } = this.props;

        // vykreslit zgroupované zakázky podle orderId
        return groupedOrders.map((commission) => {
            const row = [];

            const orderKeys = Object.keys(commission);
            const { orderId, done, } = commission._info;

            row.push(
                <React.Fragment
                    key={orderId}
                >
                    <tr
                        className={
                            createClassName([
                                done ? 'order--finished' : null,
                                // eslint-disable-next-line eqeqeq
                                activeOrder == orderId ? 'context-menu--open' : null,
                            ])
                        }
                        data-order={orderId}
                    >
                        <td className="table--orders-inner-table">
                            {
                                orderKeys.map((objKey, i) => {
                                    const key = `${orderId}_${objKey}`;
                                    const product = commission[objKey];
                                    const buttons = [];

                                    if (objKey.startsWith('_')) {
                                        return null;
                                    }

                                    if (product.done) {
                                        buttons.push({
                                            label: 'Otevřít výrobek',
                                            // znovuotevření zakázky a všech produktů
                                            onClick: (e) => this.props.onCloseOrOpenItem(e, objKey, orderId, false),
                                        });
                                    } else {
                                        buttons.push({
                                            label: 'Uzavřít výrobek',
                                            onClick: (e) => this.props.onCloseOrOpenItem(e, objKey, orderId),
                                        });

                                        if (editPlannedFinishDateRow !== key) {
                                            buttons.push({
                                                label: 'Editovat termín',
                                                onClick: (e) => this.editPlannedFinishDate(e, key, product),
                                            });
                                        } else {
                                            buttons.push({
                                                label: 'Uložit termín',
                                                onClick: (e) => this.handleSaveFinishDate(e, orderId, objKey),
                                            });
                                        }
                                    }

                                    // const totalWorkingTime = formatMinutesToTime(product.totalWorkingTime);
                                    const totalOperationTime = formatMinutesToTime(product.totalOperationTime);
                                    const warningClassNameBeforeToday = getWarningClassName(product.plannedFinishDate);
                                    const lastWorkingDate = product.lastWorkingDate ? moment(product.lastWorkingDate).format(DATA_DATE_FORMAT) : '-';
                                    const plannedFinishDate = product.plannedFinishDate ? moment(product.plannedFinishDate).format(DATA_DATE_FORMAT) : '-';
                                    const className = [
                                        warningClassNameBeforeToday,
                                        product.done ? 'product--finished' : null,
                                    ].filter(Boolean).join(' ');

                                    return (
                                        <table key={key}>
                                            <tbody>
                                                <ContextMenu
                                                    buttons={buttons}
                                                    useAsTableRow={true}
                                                    className={className}
                                                    disabled={commission._info.done}
                                                >
                                                    <td
                                                        title={objKey}
                                                        style={createStyleObject(thWidth['order'], false)}
                                                    >
                                                        {
                                                            product.coop
                                                            ? <Tooltip
                                                                title={this.renderOrderTooltip(product)}
                                                            >
                                                                {
                                                                    product.coop
                                                                    ? <strong className="text-danger product--coop">
                                                                        * &nbsp;
                                                                    </strong>
                                                                    : null
                                                                }
                                                                { objKey }
                                                            </Tooltip>
                                                            : objKey
                                                        }
                                                    </td>
                                                    <td
                                                        style={createStyleObject(thWidth['count'], false)}
                                                    >
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
                                                                        {
                                                                            this.renderOperationCell(product.operation, Number(column))
                                                                        }
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
                                                            editPlannedFinishDateRow === key
                                                            ? <input
                                                                type="datetime-local"
                                                                onChange={this.handleChange}
                                                                name="plannedFinishDateValue"
                                                                value={plannedFinishDateValue}
                                                                className="form-control form-control-sm"
                                                                onBlur={(e) => this.handleSaveFinishDate(e, orderId, objKey)}
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
                                                </ContextMenu>
                                            </tbody>
                                        </table>
                                    )
                                })
                            }
                        </td>
                    </tr>
                </React.Fragment>
            );

            return row;
        });
    }

    renderOperationCell = (operation, orderIndex) => {
        // eslint-disable-next-line eqeqeq
        const index = operation.findIndex((o) => o.order == orderIndex);

        if (index < 0) {
            return <div> - </div>;
        }

        const {
            time,
            note,
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

        return (
            <Tooltip
                className={`cursor--default`}
                scrollableElement={this.scrollableDiv.current}
                title={
                    <div>
                        {
                            note
                            ? <p>
                                <strong>Popis: </strong> {note}
                            </p>
                            : null
                        }
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
                                    operation[index].dates.map((date, i) => {
                                        // TODO: vytvořit nový key
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
                }
            >
                <strong>{count} ks. </strong>
                <span>({formatMinutesToTime(operationTime)})</span> {` `}
                <span>[{formatMinutesToTime(workingHoursForOperation)}]</span>{` `}
                <strong
                    className={createClassName([
                        sign < 0 ? 'text-primary' : (sign === 0 ? null : 'text-danger'),
                    ])}
                >
                    {`{`}{ sign < 0 ? '+' : (sign === 0 ? '' : '-') }{formatMinutesToTime(Math.abs(calculateHoursRemainder))}{`}`}
                </strong>
            </Tooltip>
        );
    }

    renderOrderTooltip = (product) => {
        if (!product.coop) {
            return null;
        }

        let cooperation = {};

        if (product && product.operation) {
             // najít kooperaci
             // eslint-disable-next-line eqeqeq
            cooperation = product.operation.find((o) => o.order == '7');
        }

        return (
            <div>
                <p>
                    Kooperace
                    { cooperation.note ? ` - ${cooperation.note}` : null }
                </p>
                {
                    cooperation
                    ? <React.Fragment>
                        <p>
                            <strong>Náplánováno ve dnech:</strong>
                        </p>
                        <div className="area--dates">
                            <ul>
                                {
                                    cooperation.dates.map((date) => {
                                        return <li key={date}>
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
                    </React.Fragment>
                    : null
                }
            </div>
        );
    }

    render() {
        const divStyle = {};
        const tableStyle = {};

        const classNames = createClassName([
            'table',
            'table-bordered',
            this.props.className,
        ]);

        const classNamesHeader = createClassName([
            'table',
            'table-bordered',
            'table-header--fixed',
        ]);

        if (this.state.height > 0) {
            tableStyle.width = this.state.width;
            divStyle.height = `${this.state.height}px`;
        }

        const { columnsVisibility } = this.props;

        return (
            <div
                className="two-columns--one-fixed table--orders element--block shadow--light mt-3"
                ref={this.tableWrapper}
            >
                { this.renderFixedColumn() }

                <div className="two-columns--right-side lock--scroll">
                    <table
                        ref={this.fixedHeader}
                        className={classNamesHeader}
                        style={{
                            transform: `translate3d(${this.state.scrollLeft * -1}px, 0, 0)`
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    data-column="order"
                                    className="table--orders-100"
                                >
                                    Výrobek
                                </th>
                                <th
                                    scope="col"
                                    data-column="count"
                                    className="table--orders-55"
                                >
                                    Ks.
                                </th>
                                {
                                    OPERATION_COLUMNS.map((column) => {
                                        // eslint-disable-next-line eqeqeq
                                        if ((columnsVisibility[column] === true) || (columnsVisibility[column] == undefined)) {
                                            return (
                                                <th
                                                    scope="col"
                                                    key={column}
                                                    data-column={column}
                                                    className="table--orders-operation-column"
                                                >
                                                    {column}.o ks/čas
                                                </th>
                                            )
                                        }

                                        return null;
                                    })
                                }
                                <th
                                    scope="col"
                                    data-column="lastWorkingDate"
                                    className="table--orders-9_5em"
                                >
                                    Ukončení
                                </th>
                                <th
                                    scope="col"
                                    data-column="plannedFinishDate"
                                    className={this.state.editPlannedFinishDateRow ? 'table--orders-finishdate-column' : 'table--orders-9_5em'}
                                >
                                    Termín
                                </th>
                                <th
                                    scope="col"
                                    data-column="totalOperationTime"
                                >
                                    Čas na výrobek
                                </th>
                            </tr>
                        </thead>
                    </table>

                    <div
                        style={divStyle}
                        ref={this.scrollableDiv}
                        className={
                            createClassName([
                                'table--scrollable',
                                this.state.activeOrder ? 'lock--scroll': null,
                            ])
                        }
                    >
                        <table
                            className={classNames}
                            style={tableStyle}
                        >
                            <tbody>
                                {this.renderTableBody()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } 
}
