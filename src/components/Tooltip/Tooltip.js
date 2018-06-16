import React from 'react';
import ReactDOM from 'react-dom';
import './tooltip.css';
import { createClassName } from '../../utils/helpers';

export class Tooltip extends React.Component {
    static defaultProps = {
        timeoutEnter: 0,
        timeoutLeave: 0,
        pointerEvents: true,
    };

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
        if (!this.props.title) {
            return;
        }

        if (this.timer) {
            window.clearInterval(this.timer);
        }

        this.setState({
            isMouseOver: true
        });

        this.timer = window.setTimeout(() => this.handleTimeout('toggleTooltip'), this.props.timeoutEnter);
    }

    handleMouseLeave() {
        if (!this.props.title) {
            return;
        }

        if (this.timer) {
            window.clearInterval(this.timer);
        }

        this.setState({
            toggleTooltip: false
        });

        this.timer = window.setTimeout(() => this.handleTimeout('isMouseOver'), this.props.timeoutLeave);
    }

    handleTimeout(stateItem) {
        let tooltipPositionObj = {};
        let tooltipPositionStr = '';

        if (stateItem === 'toggleTooltip') {
            const tooltipRect = this.tooltip.current.getBoundingClientRect();
            const parentRect = this.parentDiv.current.getBoundingClientRect();

            if (parentRect.bottom > (window.innerHeight - tooltipRect.height)) {
                // tooltip on top
                tooltipPositionStr = 'top';

                tooltipPositionObj = {
                    left: parentRect.left - (tooltipRect.width / 2) + (parentRect.width / 2) + "px",
                    top: parentRect.top - ((parentRect.height / 2) + (tooltipRect.height)) + "px",
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
            className,
            pointerEvents,
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
            default:
                break;
        }

        const classNames = createClassName([
            'pd-tooltip',
            className ? className : null,
        ]);

        const innerClassNames = createClassName([
            'pd-tooltip__inner',
            tooltipPositionClassName,
            toggleTooltip ? 'pd-tooltip--open' : null,
            pointerEvents ? null : 'pd-tooltip--pointerevents',
        ]);

        const titleClassNames = createClassName([
            type || null,
            'pd-tooltip__content',
            'pd-animate__3d--sign ',
            toggleTooltip ? 'pd-animate__in' : null,
        ]);

        let split = [];
        let text = [];

        if (typeof title === 'string') {
            split = title.split('<br />');
            text = split.map((part) => <p key={part}>{part.trim()}</p>);
        } else {
            text = title;
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
                    !isMouseOver || !text
                    ? null
                    : ReactDOM.createPortal(
                        <div
                            ref={this.tooltip}
                            style={tooltipPositionObj}
                            className={innerClassNames}
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
