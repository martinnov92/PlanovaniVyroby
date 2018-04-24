import React from 'react';
import ReactDOM from 'react-dom';
import './context-menu.css';

export class ContextMenu extends React.Component {
    static defaultProps = {
        buttons: []
    };
  
    constructor() {
        super();

        this.state = {
            open: false
        };
    }
    
    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('contextmenu', this.handleRightClickOutside);
    }
    
    handleClickOutside = (e) => { 
        if (!this.state.open) {
            return;
        }
        
        const root = ReactDOM.findDOMNode(this.div);
        const context = ReactDOM.findDOMNode(this.context);
        const isInRoot = (!root.contains(e.target) || root.contains(e.target));
        const isInContext = !context.contains(e.target);
        
        if (isInRoot && isInContext) {
            this.setState({
                open: false
            });
        } 
    }

    handleRightClickOutside = (e) => {
        if (!this.state.open) {
            return;
        }
    
        const root = ReactDOM.findDOMNode(this.div);
        const isInRoot = !root.contains(e.target);

        if (isInRoot) {
            this.setState({
                open: false
            });
        }
    }

    handleRightClick = (e) => {
        e.preventDefault();

        this.setState({
            open: true,
            top: e.nativeEvent.clientY,
            left: e.nativeEvent.clientX,
        });
    }

    handleButtonClick = (e, button) => {
        this.setState({
            open: false,
        });

        return button.onClick(...arguments);
    }

    render() {
        return (
            <div
                onContextMenu={this.handleRightClick}
                ref={(node) => this.div = node}
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
