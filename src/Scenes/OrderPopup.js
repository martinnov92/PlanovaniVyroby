import React from 'react';
import { Popup } from '../components/Popup';
import { Autocomplete } from '../components/Autocomplete';
import { formatMinutesToTime } from '../helpers';

export class OrderPopup extends React.Component {
    static defaultProps = {
        order: {},
        orderList: [],
        products: [],
        footerButtons: () => {},
        sameOperationRestTime: 0,
    };

    render() {
        const {
            order,
            products,
            machines,
            sameOperationRestTime,
        } = this.props;

        return (
            <Popup
                center={false}
                className="popup-order"
                title="Přidání práce"
                footerButtons={() => {
                    return <React.Fragment>
                        <button
                            className="btn btn-sm btn-success ml-2"
                            onClick={this.props.handleSave}
                        >
                            Uložit
                        </button>
                    </React.Fragment>;
                }}
                onClose={this.props.handleClose}
            >
                <div className="form-row">
                    <div className="col">
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Zakázka</span>
                            </div>
                            <select
                                name="orderId"
                                value={order.orderId}
                                className="custom-select"
                                onChange={this.props.handleInputChange}
                            >
                                <option>
                                    Vyberte zakázku
                                </option>
                                <option
                                    value="new"
                                >
                                    Přidat novou zakázka
                                </option>
                                <option value="-" />
                                {
                                    this.props.orderList.filter((o) => !o.done).map((order) => {
                                        return (
                                            <option
                                                key={order.id}
                                                value={order.id}
                                            >
                                                {order.name}
                                            </option>
                                        );
                                    })
                                }
                            </select>
                        </div>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Výrobek</span>
                            </div>
                            <Autocomplete
                                data={products}
                                name="productName"
                                propertyName="name"
                                value={order.productName}
                                onChange={this.props.handleInputChange}
                            />
                        </div>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Stroj</span>
                            </div>
                            <select
                                name="machine"
                                value={order.machine}
                                className="custom-select"
                                onChange={this.props.handleInputChange}
                            >
                                <option
                                    value="new"
                                >
                                    Přidat nový stroj
                                </option>
                                <option value="-" />
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
                                <span className="input-group-text">Naplánovaný čas</span>
                            </div>
                            <input
                                type="text"
                                disabled={true}
                                name="workingHours"
                                className="form-control"
                                onChange={this.props.handleInputChange}
                                value={formatMinutesToTime(order.workingHours)}
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
                    </div>

                    <div className="col">
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Operace</span>
                            </div>
                            <select
                                name="operation.order"
                                className="custom-select"
                                value={order.operation.order}
                                onChange={this.props.handleInputChange}
                            >
                                <option
                                    value="-"
                                >
                                    Zvolte operaci
                                </option>
                                <option
                                    value="1"
                                >
                                    1. operace
                                </option>
                                <option
                                    value="2"
                                >
                                    2. operace
                                </option>
                                <option
                                    value="3"
                                >
                                    3. operace
                                </option>
                                <option
                                    value="4"
                                >
                                    4. operace
                                </option>
                                <option
                                    value="5"
                                >
                                    5. operace
                                </option>
                                <option
                                    value="6"
                                >
                                    6. operace
                                </option>
                            </select>
                        </div>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Počet kusů</span>
                            </div>
                            <input
                                min={0}
                                type="number"
                                name="operation.count"
                                className="form-control"
                                value={order.operation.count}
                                onChange={this.props.handleInputChange}
                            />
                        </div>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Čas na kus</span>
                            </div>
                            <input
                                min={0}
                                type="number"
                                name="operation.time"
                                className="form-control"
                                value={order.operation.time}
                                onChange={this.props.handleInputChange}
                            />
                            <div className="input-group-append">
                                <span className="input-group-text">min.</span>
                            </div>
                        </div>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span
                                    title="Čas na kus"
                                    className="input-group-text"
                                >
                                    Výměna
                                </span>
                            </div>
                            <input
                                min={0}
                                type="number"
                                className="form-control"
                                name="operation.exchange"
                                value={order.operation.exchange}
                                onChange={this.props.handleInputChange}
                            />
                            <div className="input-group-append">
                                <span className="input-group-text">min.</span>
                            </div>
                        </div>

                        <hr />

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span
                                    className="input-group-text"
                                    title="Čas na operaci"
                                >
                                    Nahazování
                                </span>
                            </div>
                            <input
                                min={0}
                                type="number"
                                name="operation.casting"
                                className="form-control"
                                value={order.operation.casting}
                                onChange={this.props.handleInputChange}
                            />
                            <div className="input-group-append">
                                <span className="input-group-text">min.</span>
                            </div>
                        </div>

                        <hr />

                        <div className="spacer" />

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Čas na operaci</span>
                            </div>
                            <input
                                type="text"
                                disabled={true}
                                className="form-control"
                                name="operation.operationTime"
                                onChange={this.props.handleInputChange}
                                value={formatMinutesToTime(order.operation.operationTime)}
                            />
                        </div>

                        <p>
                            Zbývá doplánovat: {formatMinutesToTime(sameOperationRestTime)}
                        </p>
                    </div>
                </div>
            </Popup>
        );
    }
}
