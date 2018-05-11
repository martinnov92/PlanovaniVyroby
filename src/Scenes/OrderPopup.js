import React from 'react';
import { Popup } from '../components/Popup';
import { formatMinutesToTime } from '../helpers';

export class OrderPopup extends React.Component {
    static defaultProps = {
        order: {},
        // newOrder -> vytvořená zakázka (pouze ID a barva a jestli je done)
        newOrder: {},
        orderList: [],
        productNameList: [],
        footerButtons: () => {},
    };

    constructor(props) {
        super(props);

        this.state = {
            orderIs: null,
        };

        this.product = React.createRef();
    }

    componentDidMount() {
        this.product.current.focus();
    }

    render() {
        const {
            order,
            machines,
            newOrder,
        } = this.props;

        return (
            <Popup
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
                                <span className="input-group-text">
                                    {
                                        this.state.orderIs !== null
                                        ? <strong
                                            onClick={() => this.setState({ orderIs: null })}
                                        >
                                            Zpět
                                        </strong>
                                        : <strong>
                                            Zakázka
                                        </strong>
                                    }
                                </span>
                            </div>
                            {this.renderOrderInput(order, newOrder)}
                        </div>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Výrobek</span>
                            </div>
                            <input
                                type="text"
                                name="productName"
                                ref={this.product}
                                className="form-control"
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
                    </div>
                </div>
            </Popup>
        );
    }

    renderOrderInput = (order, newOrder) => {
        if (this.state.orderIs === 'new' || newOrder.id !== '') {
            return (
                <React.Fragment>
                    <input
                        name="id"
                        type="text"
                        value={newOrder.id}
                        placeholder="Zakázka"
                        className="form-control"
                        disabled={newOrder.id !== ''}
                        onChange={this.props.handleNewOrderChange}
                    />
                    <div className="input-group-append">
                        <input
                            type="color"
                            style={{
                                height: '100%',
                                backgroundColor: '#e9ecef',
                                borderRadius: '0 5px 5px 0',
                            }}
                            name="color"
                            value={newOrder.color}
                            disabled={newOrder.id !== ''}
                            onChange={this.props.handleNewOrderChange}
                        />
                    </div>
                </React.Fragment>
            );
        } else if (this.state.orderIs === 'exists') {
            return (
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
                                    {order.id}
                                </option>
                            );
                        })
                    }
                </select>
            );
        } else {
            return (
                <div
                    role="group"
                    style={{
                        width: 'calc(100% - 100px)'
                    }}
                    className="btn-group"
                >
                    <button
                        title="Nová zakázka"
                        style={{
                            width: '100%'
                        }}
                        className="btn btn-secondary"
                        onClick={(e) => this.setState({ orderIs: 'new' })}
                    >
                        Nová
                    </button>

                    <button
                        title="Vybrat existující zakázku"
                        style={{
                            width: '100%'
                        }}
                        className="btn btn-secondary"
                        onClick={(e) => this.setState({ orderIs: 'exists' })}
                    >
                        Vybrat
                    </button>
                </div>
            );
        }
    }
}
