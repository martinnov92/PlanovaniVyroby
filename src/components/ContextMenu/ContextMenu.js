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
        const isInRow = (!root.contains(e.target) || root.contains(e.target));
        const isInContext = !context.contains(e.target);
        
        if (isInRow && isInContext) {
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
        const isInRow = !root.contains(e.target);
    
        if (isInRow) {
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
                                <button onClick={button.onClick}>
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
