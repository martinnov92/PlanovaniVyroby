import React from 'react';
// import { DragWrapper } from '../DragWrapper';
import { createClassName } from '../../helpers';

import './popup.css';

// TODO: dodělat

export class Popup extends React.Component {
    static defaultProps = {
        footerButtons: () => {},
    };

    render() {
        return (
            <Popup
                className="popup-order"
                title="Přidání zakázky"
                footerButtons={() => {
                    return <React.Fragment>
                        {
                            this.state.order.id
                            ? <button
                                className="btn btn-sm btn-danger"
                                onClick={this.handleDelete}
                            >
                                Smazat
                            </button>
                            : null
                        }
                        
                        <button
                            className="btn btn-sm btn-success ml-2"
                            onClick={this.handleSave}
                        >
                            Uložit
                        </button>
                    </React.Fragment>
                }}
                onClose={this.handleClose}
            >
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Název</span>
                    </div>
                    <input
                        type="text"
                        name="label"
                        className="form-control"
                        onChange={(e) => {
                            this.setState({
                                order: {
                                    ...this.state.order,
                                    [e.target.name]: e.target.value
                                }
                            });
                        }}
                        value={this.state.order.label}
                    />
                </div>
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Stroj</span>
                    </div>
                    <select
                        name="machine"
                        className="custom-select"
                        onChange={(e) => {
                            this.setState({
                                order: {
                                    ...this.state.order,
                                    [e.target.name]: e.target.value
                                }
                            });
                        }}
                        value={this.state.order.machine.id}
                    >
                        {machines.map((machine) => {
                            return <option
                                key={machine.id}
                                value={machine.id}
                            >
                                {machine.name}
                            </option>
                        })}
                    </select>
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Obsluha</span>
                    </div>
                    <input
                        className="form-control"
                        type="text"
                        name="worker"
                        onChange={(e) => {
                            this.setState({
                                order: {
                                    ...this.state.order,
                                    [e.target.name]: e.target.value
                                }
                            });
                        }}
                        value={this.state.order.worker}
                    />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Od</span>
                    </div>
                    <input
                        className="form-control"
                        type="datetime-local"
                        name="dateFrom"
                        required={true}
                        onChange={(e) => {
                            this.setState({
                                order: {
                                    ...this.state.order,
                                    [e.target.name]: e.target.value
                                }
                            });
                        }}
                        value={this.state.order.dateFrom}
                    />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Do</span>
                    </div>
                    <input
                        className="form-control"
                        type="datetime-local"
                        name="dateTo"
                        onChange={(e) => {
                            this.setState({
                                order: {
                                    ...this.state.order,
                                    [e.target.name]: e.target.value
                                }
                            });
                        }}
                        value={this.state.order.dateTo}
                    />
                </div>

                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Poznámka</span>
                    </div>
                    <textarea
                        className="form-control"
                        name="note"
                        onChange={(e) => {
                            this.setState({
                                order: {
                                    ...this.state.order,
                                    [e.target.name]: e.target.value
                                }
                            });
                        }}
                        value={this.state.order.note}
                    />
                </div>
            </Popup>
        );
    }
}
