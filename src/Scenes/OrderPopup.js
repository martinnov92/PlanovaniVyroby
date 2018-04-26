import React from 'react';
import { Popup } from '../components/Popup';

export class OrderPopup extends React.Component {
    static defaultProps = {
        order: {},
        footerButtons: () => {},
    };

    render() {
        const {
            order,
            machines,
        } = this.props;

        return (
            <Popup
                className="popup-order"
                title="Přidání zakázky"
                footerButtons={() => {
                    return <React.Fragment>
                        {
                            order.id
                            ? <button
                                className="btn btn-sm btn-danger"
                                onClick={this.props.handleDelete}
                            >
                                Smazat
                            </button>
                            : null
                        }
                        
                        <button
                            className="btn btn-sm btn-success ml-2"
                            onClick={this.props.handleSave}
                        >
                            Uložit
                        </button>
                    </React.Fragment>
                }}
                onClose={this.props.handleClose}
            >
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Název</span>
                    </div>
                    <input
                        type="text"
                        name="label"
                        value={order.label}
                        className="form-control"
                        onChange={this.props.handleInputChange}
                    />
                </div>
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Stroj</span>
                    </div>
                    <select
                        name="machine"
                        value={order.machine.id}
                        className="custom-select"
                        onChange={this.props.handleInputChange}
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
                        type="text"
                        name="worker"
                        value={order.worker}
                        className="form-control"
                        onChange={this.props.handleInputChange}
                    />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Od</span>
                    </div>
                    <input
                        name="dateFrom"
                        required={true}
                        type="datetime-local"
                        value={order.dateFrom}
                        className="form-control"
                        onChange={this.props.handleInputChange}
                    />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Do</span>
                    </div>
                    <input
                        name="dateTo"
                        value={order.dateTo}
                        type="datetime-local"
                        className="form-control"
                        onChange={this.props.handleInputChange}
                    />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Počet hodin</span>
                    </div>
                    <input
                        type="text"
                        disabled={true}
                        name="workingHours"
                        onChange={() => {}}
                        className="form-control"
                        value={order.workingHours}
                    />
                </div>

                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Poznámka</span>
                    </div>
                    <textarea
                        name="note"
                        value={order.note}
                        className="form-control"
                        onChange={this.props.handleInputChange}
                    />
                </div>
            </Popup>
        );
    }
}
