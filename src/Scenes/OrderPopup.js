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
    };

    render() {
        const {
            order,
            products,
            machines,
            productsNameList,
        } = this.props;

        return (
            <Popup
                center={false}
                className="popup-order"
                title="Přidání zakázky"
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
                                    Vybrat zakázku
                                </option>
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
                                value={order.operation.order}
                                className="custom-select"
                                onChange={this.props.handleInputChange}
                            >
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
                                type="number"
                                name="operation.time"
                                className="form-control"
                                value={order.operation.time}
                                onChange={this.props.handleInputChange}
                            />
                        </div>

                        <hr />

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Nahazování</span>
                            </div>
                            <input
                                type="number"
                                name="operation.casting"
                                className="form-control"
                                value={order.operation.casting}
                                onChange={this.props.handleInputChange}
                            />
                        </div>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Výměna</span>
                            </div>
                            <input
                                type="number"
                                className="form-control"
                                name="operation.exchange"
                                value={order.operation.exchange}
                                onChange={this.props.handleInputChange}
                            />
                        </div>
                    </div>
                </div>
            </Popup>
        );
    }
}
