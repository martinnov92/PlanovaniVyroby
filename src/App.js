import React from 'react';
import moment from 'moment';
import { OrderPopup } from './Scenes';
import { Nav } from './components/Nav';
import { Calendar } from './components/Calendar';
import { OrderTable } from './components/OrderTable';

import {
    DATA_DATE_FORMAT,
    getNetMachineTime,
    INPUT_DATE_TIME_FORMAT,
    createClassName
} from './helpers';

const machines = [
    {
        id: 'finetech',
        name: 'Finetech',
        color: '#fb1'
    },
    {
        id: 'haas',
        name: 'Haas',
        color: '#1ce'
    },
    {
        id: 'st310',
        name: 'CNC Soustruh ST310',
        color: '#C01025'
    },
    {
        id: 'ft1250a',
        name: 'FTU 1250',
        color: '#ACCE55'
    },
    {
        id: 'st310a',
        name: 'CNC Soustruh ST310',
        color: '#C01025'
    },
    {
        id: 'ft1250c',
        name: 'FTU 1250',
        color: '#ACCE55'
    }
];

class App extends React.Component {
    constructor(props) {
        super(props);

        const startOfTheWeek = moment().startOf('week').startOf('day');
        this.state = {
            startOfTheWeek: startOfTheWeek,
            currentWeek: startOfTheWeek.week(),
            orders: [{
                id: 'abc',
                orderId: 'Z180xxx', // zakázka - může být jedna zakázka na více strojích a pak se zgrupují v order table
                productName: 'Zakázka 1', // jméno výrobku (ve wordu v němčině)
                machine: 'finetech',
                worker: 'Petr',
                note: 'Poznámka k zakázce',
                workingHours: getNetMachineTime(moment().subtract(2, 'days').hours(10).minutes(0).seconds(0).toDate(), moment().subtract(1, 'days').hours(14).minutes(0).seconds(0).toDate()),
                dateFrom: moment().subtract(2, 'days').hours(10).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(1, 'days').hours(14).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcd',
                orderId: 'Z180xxx',
                productName: 'Zakázka 2',
                machine: 'haas',
                worker: 'Pavel',
                note: 'Poznámka k opravě',
                workingHours: getNetMachineTime(moment().subtract(10, 'days').hours(7).minutes(0).seconds(0).toDate(), moment().add(4, 'days').hours(7).minutes(0).seconds(0).toDate()),
                dateFrom: moment().subtract(10, 'days').hours(7).minutes(0).seconds(0).toDate(),
                dateTo: moment().add(4, 'days').hours(7).minutes(0).seconds(0).toDate(),
            }],
            open: false,
            hoverOrder: null,
        };

        this.calendar = React.createRef();
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
        });
    }

    handleInputChange= (e) => {
        const order = {...this.state.order};
        order[e.target.name] = e.target.value;

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
            dateTo: moment(this.state.order.dateTo).toDate(),
            dateFrom: moment(this.state.order.dateFrom).toDate(),
        };
        
        if (!this.state.order.id) {
            order.id = moment().toDate();
            copy.push(order);
        } else {
            const findIndex = copy.findIndex((o) => o.id === order.id);
            copy.splice(findIndex, 1, order);
        }
        console.log(getNetMachineTime(order.dateFrom, order.dateTo));
        this.setState({
            orders: copy,
            open: false
        });
        this.resetOrderState();
    }

    handleEventDelete = (e, passedOrder) => {
        let { order } = this.state;

        if (order.id == undefined) {
            order = passedOrder;
        }

        const orders = [...this.state.orders];
        const findIndex = orders.findIndex((o) => o.id === order.id);

        if (findIndex < 0) {
            return;
        }

        orders.splice(findIndex, 1);
        this.setState({
            orders: orders,
            open: false,
        });
        this.resetOrderState();
    };

    handleClose = () => {
        this.setState({
            open: false,
        });
        this.resetOrderState();
    }

    render() {
        const {
            currentWeek,
            startOfTheWeek,
        } = this.state;

        return (
            <div className="app">
                <Nav
                    currentWeek={currentWeek}
                    onWeekMove={this.handleWeekMove}
                    addNewEvent={this.handleAddNewEvent}
                    onCurrentWeekClick={this.resetCurrentWeek}
                />

                <div
                    className="pt-3 pr-3 pb-3 pl-3 app-main--screen"
                >
                    <Calendar
                        ref={this.calendar}
                        machines={machines}
                        currentWeek={currentWeek}
                        events={this.state.orders}
                        startOfTheWeek={startOfTheWeek}
                        onEventDrop={this.handleEventDrop}
                        onEventEnter={this.handleEventEnter}
                        onEventLeave={this.handleEventLeave}

                        // context menu
                        onEditEvent={this.handleEventEdit}
                        onDeleteEvent={this.handleEventDelete}
                        onDoneEvent={this.handleEventDone}
                    />

                    <OrderTable
                        events={this.state.orders}
                    />

                    {
                        !this.state.open
                        ? null
                        : <OrderPopup
                            machines={machines}
                            order={this.state.order}
                            handleSave={this.handleSave}
                            handleClose={this.handleClose}
                            // handleDelete={this.handleEventDelete}
                            handleInputChange={this.handleInputChange}
                        />
                    }

                    {this.renderPinOrders()}
                </div>
            </div>
        );
    }

    renderPinOrders = () => {
        const { hoverOrder: order } = this.state;
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

    resetOrderState = () => {
        const dateFrom = moment().hours(7).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT);
        const dateTo = moment().hours(10).minutes(0).seconds(0).format(INPUT_DATE_TIME_FORMAT);
        const workingHours = getNetMachineTime(dateFrom, dateTo);

        this.setState({
            order: {
                label: '',
                worker: '',
                note: '',
                dateTo: dateTo,
                dateFrom: dateFrom,
                machine: machines[0].id,
                workingHours: workingHours,
            }
        });
    }
}

export default App;
