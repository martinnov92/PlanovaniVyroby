// @ts-check

import React from 'react';
import ReactDOM from 'react-dom';
import { createClassName } from '../../helpers';
import './popup.css';


export class Popup extends React.Component {
    static defaultProps = {
        footerButtons: () => {},
    };

    constructor(props) {
        super(props);

        this.state = {
            lastX: 0,
            lastY: 0,
            clientX: 0,
            clientY: 0,
            offsetTop: 0,
            offsetLeft: 0,
            mouseDown: false,
        };

        this.popup = React.createRef();
        this.header = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
        this.header.current.addEventListener('mousedown', this.handleMouseDown);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.header.current.removeEventListener('mousedown', this.handleMouseDown);
    }

    handleMouseDown = (e) => {
        console.dir(e.target);
        console.dir(this.popup.current);
        this.setState({
            mouseDown: true,
            offsetTop: e.clientY - this.popup.current.offsetTop,
            offsetLeft: e.clientX - this.popup.current.offsetLeft,
        });
    }

    handleMouseMove = (e) => {
        if (!this.state.mouseDown) {
            return;
        }

        e.preventDefault();

        const offsetTop = this.popup.current.offsetTop;
        const offsetLeft = this.popup.current.offsetLeft;

        this.setState({
            clientX: this.state.lastX + e.clientX - offsetLeft - this.state.offsetLeft,
            clientY: this.state.lastY + e.clientY - offsetTop - this.state.offsetTop,
        });
    }

    handleMouseUp = (e) => {
        if (!this.state.mouseDown) {
            return;
        }

        const offsetTop = this.popup.current.offsetTop;
        const offsetLeft = this.popup.current.offsetLeft;

        this.setState({
            offsetTop: 0,
            offsetLeft: 0,
            mouseDown: false,
            lastX: this.state.lastX + e.clientX - offsetLeft - this.state.offsetLeft,
            lastY: this.state.lastY + e.clientY - offsetTop - this.state.offsetTop,
        });
    }

    render() {
        const {
            clientX,
            clientY,
        } = this.state;

        const style = {
            transform: `translate(${clientX}px, ${clientY}px)`,
        };

        return ReactDOM.createPortal(
            <div
                className={
                    createClassName(['popup', this.props.className])
                }
                style={style}
                ref={this.popup}
            >
                <header
                    ref={this.header}
                >
                    <h4>
                        {this.props.title}
                    </h4>

                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={this.props.onClose}
                    >
                        x
                    </button>
                </header>

                <section>
                    {this.props.children}
                </section>

                {
                    !this.props.footerButtons()
                    ? null
                    : <footer
                        className="text-align--right"
                    >
                        {this.props.footerButtons()}
                    </footer>
                }
            </div>
        , document.body);
    }
}
