import React, { PureComponent } from 'react';
import Tooltip from 'rc-tooltip';

import { openTableContextMenu } from '../ContextMenu';
import { createClassName, formatMinutesToTime } from '../../utils/helpers';

export class OrderName extends PureComponent {
    handleContextMenu = () => {
        const { commission } = this.props;
        const { done } = commission._info;

        openTableContextMenu(true, done, false, this.handleContextClick);
    };

    handleContextClick = (type) => {
        const { commission } = this.props;
        const { orderId } = commission._info;

        return this.props.onContextMenu(null, orderId, type !== 'open-order');
    };

    render () {
        const { commission, orderList, rowHeights, i } = this.props;
        const { orderId, done, color } = commission._info;
        const o = orderList.find((_o) => _o.id === orderId);
        const className = createClassName([
            'left-side--item',
            done ? 'order--finished' : null,
        ]);
        const overlay = (
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
        );
    
        return (
            <div
                className={className}
                style={{
                    borderTop: 0,
                    height: `${rowHeights[i]}px`,
                    borderBottom: '2px solid var(--calendarDayBorderColor)',
                }}
                onContextMenu={this.handleContextMenu}
            >
                <Tooltip overlay={overlay}>
                    <p style={{ backgroundColor: color, }}>
                        { o ? o.name : '' }
                    </p>
                </Tooltip>
            </div>
        );
    }
}
