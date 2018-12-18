import React, { Component } from 'react';
import RCTooltip from 'rc-tooltip';

import 'rc-tooltip/assets/bootstrap.css';

const TRIGGERS = [ 'click', 'hover' ];

export class Tooltip extends Component {
    render() {
        return (
            <RCTooltip
                trigger={TRIGGERS}
                mouseEnterDelay={1}
                mouseLeaveDelay={.5}
                overlayClassName="tooltip"
                destroyTooltipOnHide={true}
                {...this.props}
            />
        );
    }
}
