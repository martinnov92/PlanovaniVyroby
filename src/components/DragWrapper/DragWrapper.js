import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './drag-wrapper.css';
import { unselectAll } from './helpers';

export class DragWrapper extends React.Component {
    constructor() {
        super();

        this.state = {
            isMouseDown: false,
            isMouseClick: false,
            parentDivInfo: undefined,
            dragWrapperInfo: undefined,
            clientX: 0,
            clientY: 0,
            offsetX: 0,
            offsetY: 0,
            lastX: 0,
            lastY: 0
        };

        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.getParentDimension = this.getParentDimension.bind(this);
    }

    componentDidMount() {
        this._mounted = true;
        this.getParentDimension();
        window.addEventListener('resize', this.getParentDimension);
    }

    componentWillUnmount() {
        this._mounted = false;
        window.removeEventListener('resize', this.getParentDimension);
    }

    getParentDimension() {
        const parent = ReactDOM.findDOMNode(this.dragWrapper);
        let top = 0;
        let left = 0;

        if (parent instanceof HTMLElement) {
            top = parent.offsetTop;
            left = parent.offsetLeft;
        }

        const width = parent.clientWidth;
        const height = parent.clientHeight;

        this.setState({
            parentDivInfo: {
                top,
                left,
                width,
                height
            }
        });
    }

    handleMouseDown(e) {
        if (e.button === 2 || !this.props.allowDrag) {
            return;
        }

        const dragItem = ReactDOM.findDOMNode(this.drag).getBoundingClientRect();

        if (this.props.onClick) {
            this.setState({
                clientX: e.clientX,
                clientY: e.clientY
            });
        }

        this.setState({
            isMouseDown: true,
            isMouseClick: true,
            dragItemInfo: dragItem,
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY
        }, () => {
            if (typeof this.props.onMoveStart === 'function') {
                this.props.onMoveStart(this.state.isMouseDown);
            }
            if (typeof this.props.onMouseDown === 'function') {
                this.props.onMouseDown(e);
            }
        });

        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    handleMouseMove(e) {
        e.stopPropagation();
        unselectAll();

        if (!this.state.isMouseDown || !this.props.allowDrag) {
            return;
        }

        const {
            dragItemInfo,
            offsetX,
            offsetY,
            lastX,
            lastY,
            parentDivInfo
        } = this.state;

        let clientX = lastX + e.clientX - dragItemInfo.left - offsetX;
        let clientY = lastY + e.clientY - dragItemInfo.top - offsetY;

        if (this.props.keepInWindow) {
            // left and right side
            if (-clientX > parentDivInfo.left) {
                clientX = -parentDivInfo.left;
            } else if (clientX > parentDivInfo.left) {
                clientX = parentDivInfo.left;
            }

            //top and bottom
            if (-clientY > parentDivInfo.top) {
                clientY = -parentDivInfo.top;
            } else if (clientY > parentDivInfo.top) {
                clientY = parentDivInfo.top;
            }
        }

        let fromCenterX = (this.state.dragItemInfo.width / 2) - this.state.offsetX;
        let fromCenterY = (this.state.dragItemInfo.height / 2) - this.state.offsetY;
        let isMouseClick = false;

        if (this.props.onClick) {
            isMouseClick = (this.state.clientX === e.clientX) && (this.state.clientY === e.clientY);
        }

        this.setState({
            clientX,
            clientY,
            isMouseClick
        }, () => {
            if (typeof this.props.onMove === 'function') {
                this.props.onMove(this.state.isMouseDown);
            }
            if (typeof this.props.onMouseMove === 'function') {
                this.props.onMouseMove(e, fromCenterX, fromCenterY);
            }
        });
    }

    handleMouseUp(e) {
        const { lastX, lastY, offsetX, offsetY, dragItemInfo} = this.state;

        const lX = lastX + e.clientX - dragItemInfo.left - offsetX;
        const lY = lastY + e.clientY - dragItemInfo.top - offsetY;

        let fromCenterX = (this.state.dragItemInfo.width / 2) - this.state.offsetX;
        let fromCenterY = (this.state.dragItemInfo.height / 2) - this.state.offsetY;

        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);

        if (this.state.isMouseClick && this.state.isMouseDown) {
            if (typeof this.props.onClick === 'function') {
                this.props.onClick(e);
                this.props.onMouseUp(e, fromCenterX, fromCenterY);
            }

            if (this._mounted) {
                this.setState({
                    lastX: lX,
                    lastY: lY,
                    isMouseDown: false,
                    isMouseClick: false
                });
            }
        } else {
            this.setState({
                lastX: lX,
                lastY: lY,
                isMouseDown: false,
                isMouseClick: false
            }, () => {
                if (typeof this.props.onMoveEnd === 'function') {
                    this.props.onMoveEnd(this.state.isMouseDown);
                }
                if (typeof this.props.onMouseUp === 'function') {
                    this.props.onMouseUp(e, fromCenterX, fromCenterY);
                }
            });
        }
    }

    render() {
        const { clientX, clientY, isMouseDown } = this.state;
        const {
            showControlOnHover,
            priority,
            floating,
            offset,
            className,
            allowDrag,
            style
        } = this.props;

        const zIndex = typeof priority === 'number' ? priority : 999;
        const propStyle = style !== undefined ? style : {};

        let left;
        let top;

        if (floating) {
            left = offset[0];
            top = offset[1];
        }

        let dragStyle = {
            ...propStyle,
            // set top and left to remove text blur in chrome
            top: `${clientY}px`,
            left: `${clientX}px`,

            // TODO: uncomment this after text blur bug is removed from chrome
            // https://bugs.chromium.org/p/chromium/issues/detail?id=521364

            // transform: !allowDrag ? `translate(${0}px, ${0}px)` : `translate(${clientX}px, ${clientY}px)`,
            // willChange: isMouseDown ? 'transform' : 'initial',
            // [left !== undefined ? 'left' : null]: left,
            // [top !== undefined ? 'top' : null]: top,
            zIndex: zIndex
        };

        let classes = [
            'pd-drag',
            className ? className : null,
            floating ? 'floating' : null,
            showControlOnHover ? 'pd-drag__show' : null
        ].filter((item) => item !== null).join(' ');

        return (
            <div
                className={classes}
                ref={(node) => this.dragWrapper = node}
                style={{ ...dragStyle }}
            >
                <div
                    className={`pd-drag__drag-element`}
                    ref={(node) => this.drag = node}
                    onMouseDown={this.handleMouseDown}
                >
                    {
                        this.props.dragElement
                            ? this.props.dragElement
                            : <div className="pd-drag__move" />
                    }
                </div>
                {
                    this.props.children
                }
            </div>
        );
    }

    static defaultProps = {
        allowDrag: true,
        keepInWindow: false,
        offset: [0, 0],
        floating: false,
        showControlOnHover: false
    }
}
