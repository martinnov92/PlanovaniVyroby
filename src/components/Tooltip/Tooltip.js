import React from 'react';
import ReactDOM from 'react-dom';
import './tooltip.css';

export class Tooltip extends React.Component {
    timer = null;

    constructor() {
        super();

        this.state = {
            isMouseOver: false,
            toggleTooltip: false,
            tooltipPositionStr: 'bottom',
            tooltipPositionObj: {}
        };

        this.tooltip = React.createRef();
        this.parentDiv = React.createRef();
        this.handleTimeout = this.handleTimeout.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseEnter() {
        if (this.timer) {
            window.clearInterval(this.timer);
        }

        this.setState({
            isMouseOver: true
        });

        this.timer = window.setTimeout(() => this.handleTimeout('toggleTooltip'), 0);
    }

    handleMouseLeave() {
        if (this.timer) {
            window.clearInterval(this.timer);
        }

        this.setState({
            toggleTooltip: false
        });

        this.timer = window.setTimeout(() => this.handleTimeout('isMouseOver'), 0);
    }

    handleTimeout(stateItem) {
        let tooltipPositionObj = {};
        let tooltipPositionStr = '';

        if (stateItem === 'toggleTooltip') {
            const parentRect = this.parentDiv.current.getBoundingClientRect();
            const tooltipRect = this.tooltip.current.getBoundingClientRect();

            if (parentRect.bottom > (window.innerHeight - parentRect.height)) {
                // tooltip on top
                tooltipPositionStr = 'top';

                tooltipPositionObj = {
                    left: parentRect.left + "px",
                    top: parentRect.top - ((parentRect.height / 2) + (tooltipRect.height / 2)) + "px",
                    transform: `translate(-50%, 0)`,
                };
            } else if (tooltipRect.width > parentRect.left) {
                // tooltip on right
                tooltipPositionStr = 'right';

                tooltipPositionObj = {
                    left: parentRect.right + 5 + "px", //5 == width of arrow
                    top: parentRect.top + ((parentRect.height / 2) - (tooltipRect.height / 2)) + "px"
                };
            } else if (tooltipRect.width > (window.innerWidth - parentRect.right)) {
                // tooltip on left
                tooltipPositionStr = 'left';

                tooltipPositionObj = {
                    left: parentRect.left - tooltipRect.width - 5 + "px", //5 == width of arrow
                    top: parentRect.top + ((parentRect.height / 2) - (tooltipRect.height / 2)) + "px"
                };
            } else {
                // default on bottom
                tooltipPositionStr = 'bottom';

                tooltipPositionObj = {
                    left: parentRect.left - (tooltipRect.width / 2) + (parentRect.width / 2) + "px",
                    top: parentRect.bottom + "px"
                };
            }
        }

        this.setState({
            [stateItem]: !this.state[stateItem],
            tooltipPositionObj,
            tooltipPositionStr,
            [stateItem === 'isMouseOver' ? 'isMouseOver' : null]: false
        });

        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    render() {
        const {
            type,
            title,
            children,
            className
        } = this.props;

        const {
            isMouseOver,
            toggleTooltip,
            tooltipPositionStr,
            tooltipPositionObj
        } = this.state;

        let tooltipPositionClassName = 'pd-tooltip__bottom';

        switch (tooltipPositionStr) {
            case 'top':
                tooltipPositionClassName = 'pd-tooltip__top';
                break;
            case 'right':
                tooltipPositionClassName = 'pd-tooltip__right';
                break;
            case 'bottom':
                tooltipPositionClassName = 'pd-tooltip__bottom';
                break;
            case 'left':
                tooltipPositionClassName = 'pd-tooltip__left';
                break;
        }

        const classNames = [
            'pd-tooltip',
            className ? className : null,
        ].filter((cls) => cls !== null).join(' ');

        const titleClassNames = [
            'pd-tooltip__content',
            'pd-animate__3d--sign ',
            type || null,
            toggleTooltip ? 'pd-animate__in' : null
        ].filter((cls) => cls !== null).join(' ');

        let split = [];
        let text = [];

        if (typeof title === 'string') {
            split = title.split('<br />');
            text = split.map((part) => <p key={part}>{part.trim()}</p>);
        } else {
            text = title.map((part) => <p key={part}>{part.trim()}</p>);
        }

        return (
            <div
                className={classNames}
                ref={this.parentDiv}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
            >
                { children }
                {
                    !isMouseOver
                    ? null
                    : ReactDOM.createPortal(
                        <div
                            ref={this.tooltip}
                            style={tooltipPositionObj}
                            className={`pd-tooltip__inner ${tooltipPositionClassName} ${toggleTooltip ? 'pd-tooltip--open' : ''}`}
                        >
                            <div className={titleClassNames}>
                                <div className="pd-tooltip__arrow" />
                                { text }
                            </div>
                        </div>,
                        document.body
                    )
                }
            </div>
        );
    }
}
