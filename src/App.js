import set from 'lodash/set';
import moment from 'moment';
import React from 'react';
import { OrderPopup, SettingsPopup } from './Scenes';
import { Calendar } from './components/Calendar';
import { Nav } from './components/Nav';
import { OrderTable } from './components/OrderTable';
import {
    saveFile,
    createClassName, 
    DATA_DATE_FORMAT,
    getNetMachineTime, 
    formatMinutesToTime,
    isDateRangeOverlaping, 
    INPUT_DATE_TIME_FORMAT,
} from './helpers';

const fs = window.require('fs');
const electron = window.require('electron');

// nastavení souboru
const fileName = 'RITEK_PLANOVANI_ZAKAZEK.json';
const path = `${electron.remote.app.getPath('documents')}/${fileName}`;

class App extends React.Component {
    constructor(props) {
        super(props);

        const startOfTheWeek = moment().startOf('week').startOf('day');
        this.state = {
            orders: [],
            open: false,
            machines: [],
            orderList: [],
            loading: false,
            settings: false,
            ctrlDown: false,
            hoverOrder: null,
            filterFinishedOrders: true,
            startOfTheWeek: startOfTheWeek,
            currentWeek: startOfTheWeek.week(),
        };

        this.calendar = React.createRef();
    }

    componentDidMount() {
        this.setState({
            loading: true,
        });

        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                // pokud soubor neexistuje, tak ho vytvořit
                fs.writeFile(path, '', (err) => {
                    // pokud nastala chyba, zobrazí se error
                    if (err) alert(err);

                    this.setState({
                        loading: false,
                    });
                });
            } else {
                // načíst obsah souboru do state
                try {
                    const d = JSON.parse(data);
                    this.setState({
                        loading: false,
                        orders: d.orders,
                        machines: d.machines,
                        orderList: d.orderList,
                        filterFinishedOrders: d.filterFinishedOrders === undefined ? true : d.filterFinishedOrders,
                    });
                } catch (err) {
                    this.setState({
                        loading: false,
                    });
                }
            }
        });

        document.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyUp = (e) => {
        if ((e.ctrlKey || e.key === 'Meta') && e.keyCode === 78) {
            this.handleAddNewEvent();
        }
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
        this.resetOrderState(null, null, null, () => {
            this.setState({
                open: true,
            });
        });
    }

    handleEventEdit = (e, order) => {
        const copyOrder = {
            ...order,
            dateFrom: moment(order.dateFrom).format(INPUT_DATE_TIME_FORMAT),
            dateTo: moment(order.dateTo).format(INPUT_DATE_TIME_FORMAT),
        };

        this.setState({
            open: true,
            order: copyOrder,
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

    handleDragStart = () => {
        this.setState({
            open: false,
        });
    }

    handleItemDelete = (e, item, which) => {
        if (!window.confirm(`Opravdu si přejete smazat "${item.name}"?`)) {
            return;
        }

        const itemsCopy = [...this.state[which]];
        const index = itemsCopy.findIndex((m) => m.id === item.id);

        itemsCopy.splice(index, 1);

        this.setState({
            [which]: itemsCopy,
        }, this.saveToFile);
    }

    handleItemSave = (e, item, which) => {
        const itemsCopy = [...this.state[which]];
        const findIndex = itemsCopy.findIndex((m) => m.id === item.id);

        if (findIndex > -1) {
            itemsCopy[findIndex] = item;
        } else {
            itemsCopy.push(item);
        }

        this.setState({
            [which]: itemsCopy,
        }, this.saveToFile);
    }

    handleEventDrop = (order) => {
        const ordersCopy = [...this.state.orders];
        const index = ordersCopy.findIndex((o) => o.id === order.id);
        const isOverlaping = isDateRangeOverlaping(ordersCopy, order);

        if (isOverlaping) {
            return alert('V tomto čase je daný stroj vytížen.');
        }

        order.workingHours = getNetMachineTime(order.dateFrom, order.dateTo);
        ordersCopy.splice(index, 1, order);

        this.setState({
            open: false,
            orders: ordersCopy,
        }, () => this.saveToFile());
    }

    handleSelectingMouseUp = (dateFrom, dateTo, machineId) => {
        this.resetOrderState(dateFrom, dateTo, machineId, () => {
            this.setState({
                open: true,
            }, () => console.log(this.state));
        });
    }

    handleInputChange = (e) => {
        const order = set(this.state.order, e.target.name, e.target.value);

        if (e.target.name === 'dateFrom' || e.target.name === 'dateTo') {
            const date = moment(e.target.value);
            const hours = date.hours();
            const minutes = date.minutes();

            const shiftFrom = hours < 7;
            const shiftTo = (hours > 20) || (hours > 20 && minutes > 0);

            if ((e.target.name === 'dateFrom' && shiftFrom) || (e.target.name === 'dateFrom' && shiftTo) || (e.target.name === 'dateTo' && shiftTo)) {
                return;
            }

            order.workingHours = getNetMachineTime(order.dateFrom, order.dateTo);
        }
        console.log(order);
        this.setState({
            order: order
        });
    }

    handleSave = () => {
        const ordersCopy = [...this.state.orders];
        const orderListCopy = [...this.state.orderList];

        const order = {
            ...this.state.order,
            dateTo: moment(this.state.order.dateTo).format(),
            dateFrom: moment(this.state.order.dateFrom).format(),
        };

        if (!order.orderId || !order.machine || !order.productName) {
            return alert('Při zakládání zakázky musí být vyplněna zakázka, výrobek a stroj.');
        } 

        order.workingHours = getNetMachineTime(order.dateFrom, order.dateTo);

        if (!this.state.order.id) {
            if (isDateRangeOverlaping(ordersCopy, order)) {
                return alert('V tomto čase je daný stroj vytížen.');
            }

            order.id = moment().unix();
            ordersCopy.push(order);
        } else {
            const findIndex = ordersCopy.findIndex((o) => o.id === order.id);
            const dateFromIsSame = moment(order.dateFrom).isSame(ordersCopy[findIndex].dateFrom);
            const dateToIsSame = moment(order.dateTo).isSame(ordersCopy[findIndex].dateTo);

            if ((!dateFromIsSame || !dateToIsSame) && ordersCopy[findIndex].id !== order.id) {
                if (isDateRangeOverlaping(ordersCopy, order)) {
                    return alert('V tomto čase je daný stroj vytížen.');
                }
            }

            ordersCopy.splice(findIndex, 1, order);
        }

        this.setState({
            open: false,
            orders: ordersCopy,
            orderList: orderListCopy,
        }, () => this.saveToFile());
        this.resetOrderState();
    }

    handleOrderDelete = (e, passedOrder) => {
        const orders = [...this.state.orders];
        const findIndex = orders.findIndex((o) => o.id === passedOrder.id);

        if (findIndex < 0) {
            return;
        }

        const confirm = window.confirm('Přejete si smazat událost?');
        if (!confirm) {
            return;
        }

        orders.splice(findIndex, 1);
        this.setState({
            open: false,
            orders: orders,
            hoverOrder: null,
        }, () => this.saveToFile());
        this.resetOrderState();
    };

    handleCloseOrder = (e, orderId, order) => {
        const orderListCopy = [...this.state.orderList];
        const findOrder = orderListCopy.findIndex((o) => o.id === orderId);

        if (findOrder > -1) {
            orderListCopy[findOrder].done = true;
        }

        this.setState({
            orderList: orderListCopy,
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
            loading,
            machines,
            orderList,
            currentWeek,
            startOfTheWeek,
            filterFinishedOrders,
        } = this.state;

        const productsNameList = [...new Set(orders.map((o) => o.productName))];

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
                        loading
                        ? null
                        : (machines.length === 0 && orders.length === 0)
                        ? <div className="jumbotron">
                            <h4>
                                Zatím nejsou vytvořeny žádné záznamy.
                            </h4>

                            <hr className="mt-3 mb-3" />

                            <p>
                                Začnětě přidáním stroje v nastavení aplikace.
                            </p>
                        </div>
                        : <React.Fragment>
                            <Calendar
                                ref={this.calendar}
                                currentWeek={currentWeek}
                                startOfTheWeek={startOfTheWeek}
                                onDragStart={this.handleDragStart}
                                onEventDrop={this.handleEventDrop}
                                onEventEnter={this.handleEventEnter}
                                onEventLeave={this.handleEventLeave}
                                onDoubleClick={this.handleEventEdit}
                                onMouseUp={this.handleSelectingMouseUp}

                                // context menu
                                onEditEvent={this.handleEventEdit}
                                onDeleteEvent={this.handleOrderDelete}

                                // data
                                events={orders}
                                machines={machines}
                                orderList={orderList}
                            />
        
                            <OrderTable
                                events={orders}
                                orderList={orderList}
                                onCloseOrder={this.handleCloseOrder}
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
                            orderList={orderList}
                            handleSave={this.handleSave}
                            handleClose={this.handleClose}
                            productsNameList={productsNameList}
                            handleInputChange={this.handleInputChange}
                        />
                    }

                    {this.renderHoverOrder()}
                </div>

                {
                    !this.state.settings
                    ? null
                    : <SettingsPopup
                        handleClose={this.closeSettings}

                        // machines
                        machines={machines}
                        onMachineSave={(e, item) => this.handleItemSave(e, item, 'machines')}
                        onMachineDelete={(e, item) => this.handleItemDelete(e, item, 'machines')}

                        // orders
                        orders={orderList}
                        onOrderSave={(e, item) => this.handleItemSave(e, item, 'orderList')}
                        onOrderDelete={(e, item) => this.handleItemDelete(e, item, 'orderList')}

                        // general
                        filterFinishedOrders={filterFinishedOrders}
                        handleFilterFinishedOrders={(e) => {
                            this.setState({
                                filterFinishedOrders: !e.target.checked
                            }, () => this.saveToFile());
                        }}
                    />
                }
            </div>
        );
    }

    renderHoverOrder = () => {
        const {
            machines,
            orderList,
            hoverOrder: order,
        } = this.state;

        if (!order) {
            return;
        }

        const mainOrder = orderList.find((o) => o.id === (order && order.orderId));
        const machine = machines.find((machine) => machine.id === (order && order.machine));
        const totalMinutes = order.operation.time * order.operation.count;

        return <div
                ref={this.card}
                style={{
                    borderTop: `10px solid ${mainOrder && mainOrder.color}`
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
                            <strong>{mainOrder.id}</strong>
                        </h5>
                        <h6 className="card-subtitle mb-2">
                            <strong>{order.productName}</strong>
                        </h6>
                        <h6 className="card-subtitle mb-2 text-muted">
                            <strong>{order.worker}</strong>
                        </h6>
                        <p className="card-text">
                            {machine.name}
                        </p>
                        <p className="card-text">
                            {order.operation.order}. operace
                        </p>
                        <p className="card-text">
                            {order.operation.count}ks
                        </p>
                        <p className="card-text">
                            {order.operation.time}min/kus
                        </p>
                        <p className="card-text">
                            Celkem: {totalMinutes}min ({(totalMinutes / 60).toFixed(1)}hod)
                        </p>
                        <p className="card-text">
                            {order.note}
                        </p>
                        <p className="card-text">
                            {moment(order.dateFrom).format(DATA_DATE_FORMAT)}
                            {" - "}
                            {moment(order.dateTo).format(DATA_DATE_FORMAT)}
                            <strong> ({formatMinutesToTime(order.workingHours)})</strong>
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
            orderList: this.state.orderList,
            filterFinishedOrders: this.state.filterFinishedOrders,
        })
        .then((value) => {
            console.log(value);
        })
        .catch((err) => {
            alert(err);
        });
    }

    resetOrderState = (from, to, machineId, cb) => {
        let dateTo;
        let dateFrom;
        let workingHours;

        if (from && to) {
            dateFrom = moment(from).format(INPUT_DATE_TIME_FORMAT);
            dateTo = moment(to).format(INPUT_DATE_TIME_FORMAT);
            workingHours = getNetMachineTime(dateFrom, dateTo);
        } else {
            dateFrom = moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT);
            dateTo = moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT);
            workingHours = getNetMachineTime(dateFrom, dateTo);
        }

        this.setState({
            order: {
                orderId: '',
                productName: '',
                worker: '',
                note: '',
                dateTo: dateTo,
                operation: {
                    time: 0,        // čas na kus (sčítá se s nahazováním a výměnou)
                    order: 1,
                    count: 0,
                    casting: 0,     // nahazování
                    exchange: 0,    // výměna
                },
                dateFrom: dateFrom,
                workingHours: workingHours,
                machine: machineId || this.state.machines[0].id,
            },
        }, cb);
    }
}

export default App;
