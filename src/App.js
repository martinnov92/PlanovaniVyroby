import set from 'lodash/set';
import moment from 'moment';
import React from 'react';
import { OrderPopup, SettingsPopup } from './Scenes';
import { Calendar } from './components/Calendar';
import { Nav } from './components/Nav';
import { OrderTable } from './components/OrderTable';
import { DATA_DATE_FORMAT, INPUT_DATE_TIME_FORMAT, createClassName, getNetMachineTime, saveFile } from './helpers';

const fs = window.require('fs');
const electron = window.require('electron');

// nastavení souboru
const fileName = 'Ritek_Planovac_Zakazek.json'; // TODO: 'RITEK_PLANOVANI_ZAKAZEK.json'
const path = `${electron.remote.app.getPath('documents')}/${fileName}`;

class App extends React.Component {
    constructor(props) {
        super(props);

        const startOfTheWeek = moment().startOf('week').startOf('day');
        this.state = {
            orders: [],
            open: false,
            machines: [],
            settings: false,
            hoverOrder: null,
            filterFinishedOrders: true,
            startOfTheWeek: startOfTheWeek,
            currentWeek: startOfTheWeek.week(),
        };

        this.calendar = React.createRef();
    }

    componentDidMount() {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                // pokud soubor neexistuje, tak ho vytvořit
                fs.writeFile(path, '', (err) => {
                    // pokud nastala chyba, zobrazí se error
                    if (err) alert(err);
                });
            } else {
                // načíst obsah souboru do state
                try {
                    const d = JSON.parse(data);

                    this.setState({
                        orders: d.orders,
                        machines: d.machines,
                        filterFinishedOrders: d.filterFinishedOrders == undefined ? true : d.filterFinishedOrders,
                    }, () => console.log(this.state));
                } catch (err) {}
            }
        });
    }

    handleWeekMove = (e, move) => {
        let startOfTheWeek = moment(this.state.startOfTheWeek);

        if (move === 'next') {
            startOfTheWeek = startOfTheWeek.add(1, 'week').startOf('week');
        } else {
            startOfTheWeek = startOfTheWeek.subtract(1, 'week').startOf('week');
        }

        this.setState({
            startOfTheWeek,
            currentWeek: startOfTheWeek.week(),
        });
    }

    resetCurrentWeek = () => {
        const startOfTheWeek = moment().startOf('week').startOf('day');

        this.setState({
            startOfTheWeek,
            currentWeek: startOfTheWeek.week(),
        });
    }

    handleAddNewEvent = () => {
        this.setState({
            open: true,
        });
        this.resetOrderState();
    }

    handleEventEdit = (e, order) => {
        const copyOrder = {
            ...order,
            dateFrom: moment(order.dateFrom).format(INPUT_DATE_TIME_FORMAT),
            dateTo: moment(order.dateTo).format(INPUT_DATE_TIME_FORMAT),
        };

        this.setState({
            order: copyOrder,
            open: true,
        });
    }

    handleEventEnter = (e, order) => {
        this.setState({
            hoverOrder: order,
        });
    }

    handleEventLeave = (e, order) => {
        this.setState({
            hoverOrder: null,
        });
    }

    handleEventDrop = (order) => {
        const ordersCopy = [...this.state.orders];
        const findIndex = ordersCopy.findIndex((o) => o.id === order.id);
        ordersCopy.splice(findIndex, 1, order);

        this.setState({
            orders: ordersCopy,
        }, () => this.saveToFile());
    }

    handleInputChange= (e) => {
        const order = set(this.state.order, e.target.name, e.target.value);

        if (e.target.name === 'dateFrom' || e.target.name === 'dateTo') {
            order.workingHours = getNetMachineTime(order.dateFrom, order.dateTo);
        }

        this.setState({
            order: order
        });
    }

    handleSave = () => {
        const copy = [...this.state.orders];
        const order = {
            ...this.state.order,
            dateTo: moment(this.state.order.dateTo).format(),
            dateFrom: moment(this.state.order.dateFrom).format(),
        };

        if (!this.state.order.id) {
            order.id = moment().format();
            copy.push(order);
        } else {
            const findIndex = copy.findIndex((o) => o.id === order.id);
            copy.splice(findIndex, 1, order);
        }
        // console.log(getNetMachineTime(order.dateFrom, order.dateTo));
        this.setState({
            orders: copy,
            open: false
        }, () => this.saveToFile());
        this.resetOrderState();
    }

    handleOrderDelete = (e, passedOrder) => {
        const orders = [...this.state.orders];
        const findIndex = orders.findIndex((o) => o.id === passedOrder.id);

        if (findIndex < 0) {
            return;
        }

        orders.splice(findIndex, 1);
        this.setState({
            orders: orders,
            open: false,
        }, () => this.saveToFile());
        this.resetOrderState();
    };

    handleEventDone = (e, orderId, order) => {
        const orders = this.state.orders.map((order) => {
            if (order.orderId === orderId) {
                order.done = true;
            }

            return order;
        });

        this.setState({
            orders,
        }, () => this.saveToFile());
    }

    handleClose = () => {
        this.setState({
            open: false,
        });
        this.resetOrderState();
    }

    openSettings = () => {
        this.setState({
            settings: true,
        });
    }

    closeSettings = () => {
        this.setState({
            settings: false,
        });
    }

    render() {
        const {
            order,
            orders,
            machines,
            currentWeek,
            startOfTheWeek,
            filterFinishedOrders,
        } = this.state;

        return (
            <div className="app">
                <Nav
                    currentWeek={currentWeek}
                    openSettings={this.openSettings}
                    onWeekMove={this.handleWeekMove}
                    addNewEvent={this.handleAddNewEvent}
                    onCurrentWeekClick={this.resetCurrentWeek}
                />

                <div
                    className="pt-3 pr-3 pb-3 pl-3 app-main--screen"
                >
                    {
                        machines.length === 0 && orders.length === 0
                        ? null
                        : <React.Fragment>
                            <Calendar
                                events={orders}
                                machines={machines}
                                ref={this.calendar}
                                currentWeek={currentWeek}
                                startOfTheWeek={startOfTheWeek}
                                onEventDrop={this.handleEventDrop}
                                onEventEnter={this.handleEventEnter}
                                onEventLeave={this.handleEventLeave}
        
                                // context menu
                                onEditEvent={this.handleEventEdit}
                                onDeleteEvent={this.handleOrderDelete}
                            />
        
                            <OrderTable
                                events={orders}
                                onCloseOrder={this.handleEventDone}
                                filterFinishedOrders={filterFinishedOrders}
                            />
                        </React.Fragment>
                    }

                    {
                        !this.state.open
                        ? null
                        : <OrderPopup
                            order={order}
                            machines={machines}
                            handleSave={this.handleSave}
                            handleClose={this.handleClose}
                            handleInputChange={this.handleInputChange}
                        />
                    }

                    {
                        !this.state.settings
                        ? null
                        : <SettingsPopup
                            handleClose={this.closeSettings}
                            filterFinishedOrders={filterFinishedOrders}
                            handleFilterFinishedOrders={(e) => {
                                this.setState({
                                    filterFinishedOrders: !e.target.checked
                                }, () => this.saveToFile());
                            }}
                        />
                    }

                    {this.renderPinOrders()}
                </div>
            </div>
        );
    }

    renderPinOrders = () => {
        const {
            machines,
            hoverOrder: order,
        } = this.state;
        const machine = machines.find((machine) => machine.id === (order && order.machine));

        return <div
                ref={this.card}
                style={{
                    borderTop: `10px solid ${machine && machine.color}`
                }}
                className={createClassName([
                    order ? 'card--active' : null,
                    'card shadow--light calendar--event-card',
                ])}
            >
                <div className="card-body">
                {
                    order
                    ? <React.Fragment>
                        <h5 className="card-title">
                            <strong>{order.label}</strong>
                        </h5>
                        <h6 className="card-subtitle mb-2 text-muted">
                            <strong>{order.worker}</strong>
                        </h6>
                        <p className="card-text">
                            {order.note}
                        </p>
                        <p className="card-text">
                            {machine.name}
                        </p>
                        <p className="card-text">
                            <strong>{moment(order.dateFrom).format(DATA_DATE_FORMAT)}</strong>
                            {" - "}
                            <strong>{moment(order.dateTo).format(DATA_DATE_FORMAT)}</strong>
                        </p>
                    </React.Fragment>
                    : null
                }
                </div>
            </div>;
    }

    saveToFile = () => {
        saveFile(path, {
            orders: this.state.orders,
            machines: this.state.machines,
            filterFinishedOrders: this.state.filterFinishedOrders,
        })
        .then((value) => {
            console.log(value);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    resetOrderState = () => {
        const dateFrom = moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT);
        const dateTo = moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT);
        const workingHours = getNetMachineTime(dateFrom, dateTo);

        this.setState({
            order: {
                orderId: '',
                productName: '',
                worker: '',
                note: '',
                done: false, 
                dateTo: dateTo,
                operation: {
                    order: 1,
                    time: 0,
                    count: 0,
                },
                dateFrom: dateFrom,
                workingHours: workingHours,
                machine: this.state.machines[0].id,
            }
        });
    }
}

export default App;
