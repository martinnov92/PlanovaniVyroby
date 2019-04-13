import React, { PureComponent } from 'react';

import { Tooltip } from '../Tooltip';
import { openTableContextMenu } from '../ContextMenu';
import { createClassName, formatMinutesToTime } from '../../utils/helpers';

export class OrderName extends PureComponent {
    handleContextMenu = () => {
        const { done } = this.props.info;

        openTableContextMenu(true, done, false, this.handleContextClick);
    };

    handleContextClick = (type) => {
        const { orderId } = this.props.info;

        return this.props.onContextMenu(null, orderId, type !== 'open-order');
    };

    render () {
        const { info } = this.props;
        const { name, done, color } = info;

        const className = createClassName([
            done ? 'order--finished' : null,
        ]);
        const overlay = (
            <div>
                <p>
                    Naplánováno: &nbsp;
                    <strong>{formatMinutesToTime(info.totalWorkingTime)}</strong>
                </p>
                <p>
                    Celkový čas: &nbsp;
                    <strong>{formatMinutesToTime(info.totalTime)}</strong>
                </p>
            </div>
        );
    
        return (
            <div
                className={className}
                onContextMenu={this.handleContextMenu}
            >
                <Tooltip overlay={overlay}>
                    <p style={{ backgroundColor: color }}>
                        { name || '' }
                    </p>
                </Tooltip>
            </div>
        );
    }
}
