import React from 'react';
import ReactDOM from 'react-dom';
import { createClassName } from '../../helpers';
import './context-menu.css';

export class ContextMenu extends React.Component {
    static defaultProps = {
        buttons: [],
        disabled: false,
        onOpen: () => {},
        onClose: () => {},
    };
  
    constructor() {
        super();

        this.state = {
            open: false
        };

        this.mounted = false;
    }
    
    componentDidMount() {
        this.mounted = true;

        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('contextmenu', this.handleRightClickOutside);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleRightClick = (e) => {
        e.preventDefault();

        this.setState({
            open: true,
            top: e.nativeEvent.clientY,
            left: e.nativeEvent.clientX,
        });

        this.props.onOpen();
    }

    handleRightClickOutside = (e) => {
        if (!this.mounted || !this.state.open) {
            return;
        }
    
        const root = ReactDOM.findDOMNode(this.div);
        const isInRoot = !root.contains(e.target);

        if (isInRoot) {
            this.closeContextMenu();
        }
    }

    handleClickOutside = (e) => {
        if (!this.state.open || !this.mounted || this.props.disabled) {
            return;
        }
        
        const root = ReactDOM.findDOMNode(this.div);
        const context = ReactDOM.findDOMNode(this.context);
        const isInRoot = (!root.contains(e.target) || root.contains(e.target));
        const isInContext = !context.contains(e.target);
        
        if (isInRoot && isInContext) {
            this.closeContextMenu();
        } 
    }

    handleButtonClick = (e, button) => {
        this.closeContextMenu();
        return button.onClick(...arguments);
    }

    closeContextMenu = () => {
        this.setState({
            open: false,
        });

        this.props.onClose();
    }

    render() {
        const { disabled } = this.props;
        const classNames = createClassName([
            this.props.className,
            this.state.open ? 'context-menu--open' : null,
        ]);

        if (this.props.useAsTableRow) {
            return (
                <tr
                    className={classNames}
                    ref={(node) => this.div = node}
                    onContextMenu={disabled ? null : this.handleRightClick}
                >
                {this.props.children}
    
                {
                    !this.state.open
                    ? null
                    : <td
                        className="context pt-0 pr-0 pb-0 pl-0"
                        ref={(div) => this.context = div}
                        style={{ top: this.state.top, left: this.state.left }}
                    >
                        <ul>
                        {
                            // button - name, onClick, label
                            this.props.buttons.length > 0 &&
                            this.props.buttons.map((button) => {
                                return <li key={button.label}>
                                    <button
                                        onClick={(e) => this.handleButtonClick(e, button)}
                                    >
                                        {button.label}
                                    </button>
                                </li>;
                            })
                        }
                        </ul>
                    </td>
                }
                </tr>
            );
        }

        return (
            <div
                className={classNames}
                ref={(node) => this.div = node}
                onContextMenu={this.handleRightClick}
            >
            {this.props.children}

            {
                !this.state.open
                ? null
                : <div
                    className="context"
                    ref={(div) => this.context = div}
                    style={{ top: this.state.top, left: this.state.left }}
                >
                    <ul>
                    {
                        // button - name, onClick, label
                        this.props.buttons.length > 0 &&
                        this.props.buttons.map((button) => {
                            return <li key={button.label}>
                                <button
                                    onClick={(e) => this.handleButtonClick(e, button)}
                                >
                                    {button.label}
                                </button>
                            </li>;
                        })
                    }
                    </ul>
                </div>
            }
            </div>
        );
    }
}
