import React, { PureComponent } from 'react';

import { OrderRowInnerTable } from './';

export class OrderRow extends PureComponent {
    render () {
        const {
            orderList,
            commission,
            columnsVisibility,
            editPlannedFinishDate,
            plannedFinishDateValue,
            // fn
            moveToDate,
            onBlur,
            onChange,
            onContextMenu,
            editPlannedFinishDateRow,
        } = this.props;

        const orderKeys = Object.keys(commission).filter((key) => !key.startsWith('_'));
        
        const { orderId } = commission._info;
        const orderKeysCount = orderKeys.length;
        const order = orderList.find((_o) => _o.id === orderId);

        return orderKeys.map((objKey, i) => {
            const key = `${orderId}_${objKey}`;
            const product = commission[objKey];

            return (
                <OrderRowInnerTable
                    key={key}
                    _key={key}
                    order={order}
                    objKey={objKey}
                    product={product}
                    showOrderId={i === 0}
                    commission={commission}
                    rowSpan={orderKeysCount}
                    isLastRow={i === orderKeysCount - 1}
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
        });
    }
}
