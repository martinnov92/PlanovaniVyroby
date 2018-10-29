import React from 'react';

import { OrderRowInnerTable } from './';
import { createClassName } from '../../utils/helpers';

export class OrderRow extends React.PureComponent {
    render () {
        const {
            thWidth,
            commission,
            activeOrder,
            columnsVisibility,
            editPlannedFinishDate,
            plannedFinishDateValue,

            moveToDate,
            onBlur,
            onChange,
            onContextMenu,
            editPlannedFinishDateRow,
        } = this.props;

        const orderKeys = Object.keys(commission);
        const { orderId, done, } = commission._info;

        return (
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

                            if (objKey.startsWith('_')) {
                                return null;
                            }

                            return (
                                <OrderRowInnerTable
                                    key={key}
                                    _key={key}
                                    objKey={objKey}
                                    orderId={orderId}
                                    thWidth={thWidth}
                                    product={product}
                                    commission={commission}
                                    columnsVisibility={columnsVisibility}
                                    plannedFinishDateValue={plannedFinishDateValue}
                                    editPlannedFinishDateRow={editPlannedFinishDateRow}

                                    moveToDate={moveToDate}
                                    onBlur={onBlur}
                                    onChange={onChange}
                                    onContextMenu={onContextMenu}
                                    editPlannedFinishDate={editPlannedFinishDate} // !!! pro uložení
                                />
                            );
                        })
                    }
                </td>
            </tr>
        );
    }
}
