import React, { PureComponent } from 'react';

import { OrderRowInnerTable } from './';

export class OrderRow extends PureComponent {
    render () {
        const {
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

        return orderKeys.map((objKey, i) => {
            const key = `${orderId}_${objKey}`;
            const product = commission[objKey];

            return (
                <OrderRowInnerTable
                    key={key}
                    _key={key}
                    objKey={objKey}
                    product={product}
                    showOrderId={i === 0}
                    info={commission._info}
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
