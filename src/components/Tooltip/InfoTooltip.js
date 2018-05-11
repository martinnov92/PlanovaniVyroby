import React from 'react';
import { Tooltip } from './';

export class InfoTooltip extends React.Component {
    render() {
        return (
            <Tooltip
                title={this.props.title}
                className={this.props.className}
            >
                <i className="fa fa-question-circle" aria-hidden="true" />
            </Tooltip>
        );
    }
}
