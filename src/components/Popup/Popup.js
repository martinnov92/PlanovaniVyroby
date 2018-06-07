// @ts-check

import React from 'react';
import ReactDOM from 'react-dom';
import { createClassName } from '../../helpers';
import './popup.css';


export class Popup extends React.Component {
    static defaultProps = {
        center: true,
        modal: false,
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
        if (this.props.center) {
            this.centerPopup();
        }

        document.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
        this.header.current.addEventListener('mousedown', this.handleMouseDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.header.current.removeEventListener('mousedown', this.handleMouseDown);
    }

    centerPopup = () => {
        const clientX = (window.innerWidth / 2) - ((this.popup.current.offsetWidth / 2) + this.popup.current.offsetLeft);
        const clientY = (window.innerHeight / 2) - ((this.popup.current.offsetHeight / 2) + this.popup.current.offsetTop);

        this.setState({
            clientX,
            clientY,
            lastX: clientX,
            lastY: clientY,
        });
    }

    handleMouseDown = (e) => {
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

        const { offsetTop } = this.popup.current;
        const { offsetLeft } = this.popup.current;
        const clientX = this.state.lastX + e.clientX - offsetLeft - this.state.offsetLeft;
        const clientY = this.state.lastY + e.clientY - offsetTop - this.state.offsetTop;

        this.setState({
            clientX: clientX,
            clientY: clientY,
        });
    }

    handleMouseUp = (e) => {
        if (!this.state.mouseDown) {
            return;
        }

        const { offsetTop } = this.popup.current;
        const { offsetLeft } = this.popup.current;
        const clientX = this.state.lastX + e.clientX - offsetLeft - this.state.offsetLeft;
        const clientY = this.state.lastY + e.clientY - offsetTop - this.state.offsetTop;

        this.setState({
            offsetTop: 0,
            offsetLeft: 0,
            lastX: clientX,
            lastY: clientY,
            mouseDown: false,
        });
    }

    handleKeyUp = (e) => {
        if (e.keyCode !== 27) {
            return;
        }

        return this.props.onClose();
    }

    renderPopup = () => {
        const {
            clientX,
            clientY,
        } = this.state;

        const style = {
            transform: `translate(${clientX}px, ${clientY}px)`,
        };

        return (
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
                        type="button"
                        onClick={this.props.onClose}
                        className="btn btn-outline-secondary btn-sm"
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
        );
    }

    render() {
        if (this.props.modal) {
            return ReactDOM.createPortal(
                <div className="modal--overlay">
                    {this.renderPopup()}
                </div>
            , document.body);
        }

        return ReactDOM.createPortal(this.renderPopup(), document.body);
    }
}
