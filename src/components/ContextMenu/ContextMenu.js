import React from 'react';
import ReactDOM from 'react-dom';
import { createClassName } from '../../utils/helpers';
import './context-menu.css';

// TODO: předělat na systémové context menu, viz. dokumentace

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

const tableContextMenu = new Menu();

export function openEventContextMenu (callback = () => {}) {
    const eventContextMenu = new Menu();

    eventContextMenu.append(new MenuItem({
        label: 'Upravit',
        click: () => callback('edit'),
    }));

    eventContextMenu.append(new MenuItem({
        label: 'Kopírovat',
        click: () => callback('copy'),
    }));

    eventContextMenu.append(new MenuItem({
        label: 'Smazat',
        click: () => callback('delete'),
    }));

    eventContextMenu.popup({ window: remote.getCurrentWindow() });
}


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
        this.div = React.createRef();
    }
    
    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
        this.removeEventListeners();
    }

    addEventListener = () => {
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('contextmenu', this.handleRightClickOutside);
    }

    removeEventListeners = () => {
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('contextmenu', this.handleRightClickOutside);
    }

    handleRightClick = (e) => {
        if (this.props.disabled) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            open: true,
            top: e.nativeEvent.clientY,
            left: e.nativeEvent.clientX,
        });

        this.props.onOpen();
        this.addEventListener();
    }

    handleRightClickOutside = (e) => {
        if (!this.mounted || !this.state.open) {
            return;
        }

        const isInRoot = !this.div.current.contains(e.target);

        if (isInRoot) {
            this.closeContextMenu();
        }
    }

    handleClickOutside = (e) => {
        if (!this.state.open || !this.mounted || this.props.disabled) {
            return;
        }

        const context = this.context;
        const isInRoot = (!this.div.current.contains(e.target) || this.div.current.contains(e.target));
        const isInContext = !context.contains(e.target);

        if (isInRoot && isInContext) {
            this.closeContextMenu();
        } 
    }

    handleButtonClick = (e, button) => {
        this.closeContextMenu();
        return button.onClick(e, button);
    }

    closeContextMenu = () => {
        this.setState({
            open: false,
        });

        this.props.onClose();
        this.removeEventListeners();
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
                    ref={this.div}
                    className={classNames}
                    style={this.props.style}
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
                ref={this.div}
                className={classNames}
                style={this.props.style}
                onContextMenu={this.handleRightClick}
            >
            {this.props.children}

            {
                !this.state.open
                ? null
                : ReactDOM.createPortal(
                    <div
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
                , document.body)
            }
            </div>
        );
    }
}
