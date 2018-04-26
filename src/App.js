import React from 'react';
import moment from 'moment';
import { OrderPopup } from './Scenes';
import { Nav } from './components/Nav';
import { Calendar } from './components/Calendar';

import {
    DATA_DATE_FORMAT,
    getNetMachineTime,
    INPUT_DATE_TIME_FORMAT
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
        id: 'ft1250',
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
                label: 'Zakázka 1',
                machine: 'finetech',
                worker: 'Petr',
                note: 'Poznámka k zakázce',
                dateFrom: moment().subtract(2, 'days').hours(10).minutes(0).seconds(0).toDate(),
                dateTo: moment().subtract(1, 'days').hours(14).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcd',
                label: 'Zakázka 2',
                machine: 'st310',
                worker: 'Pavel',
                note: 'Poznámka k opravě',
                dateFrom: moment().add(1, 'days').hours(7).minutes(0).seconds(0).toDate(),
                dateTo: moment().add(2, 'days').hours(13).minutes(0).seconds(0).toDate(),
            },{
                id: 'abcde',
                label: 'Zakázka 3',
                machine: 'ft1250',
                worker: 'Roman',
                note: 'Spěchá',
                dateFrom: moment().add(2, 'days').hours(9).minutes(0).seconds(0).toDate(),
                dateTo: moment().add(4, 'days').hours(11).minutes(0).seconds(0).toDate(),
            }],
            open: false,
            hoverOrder: null,
        };

        this.card = React.createRef();
        this.calendar = React.createRef();
    }

    componentDidMount() {
        this.resetOrderState();
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
    }

    handleEventClick = (e, order) => {
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

        document.addEventListener('mousemove', this.handleMouseMove);
    }

    handleEventLeave = (e, order) => {
        this.setState({
            hoverOrder: null,
        });
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    handleMouseMove = (e) => {
        const cardWidth = this.card.current.offsetWidth / 2;
        const scrollLeft = this.calendar.current.calendar.scrollLeft;
        const offsetLeft = this.calendar.current.calendar.offsetLeft;
        const calendarHeight = this.calendar.current.calendar.offsetHeight;

        this.setState({
            y: calendarHeight + e.clientY,
            x: scrollLeft + offsetLeft + e.clientX - cardWidth,
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
            console.log(order.workingHours);
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

    handleDelete = () => {
        const { order } = this.state;
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
                    className="pt-3 pr-3 pb-3 pl-3 app-main--screen_"
                >
                    <Calendar
                        ref={this.calendar}
                        machines={machines}
                        currentWeek={currentWeek}
                        events={this.state.orders}
                        startOfTheWeek={startOfTheWeek}
                        onEventDrop={this.handleEventDrop}
                        onEventClick={this.handleEventClick}
                        onEventEnter={this.handleEventEnter}
                        onEventLeave={this.handleEventLeave}
                    /> 

                    {
                        !this.state.open
                        ? null
                        : <OrderPopup
                            machines={machines}
                            order={this.state.order}
                            handleSave={this.handleSave}
                            handleClose={this.handleClose}
                            handleDelete={this.handleDelete}
                            handleInputChange={this.handleInputChange}
                        />
                    }

                    <div
                        className="orders--detail"
                    >
                        {this.renderPinOrders()}
                    </div>
                </div>
            </div>
        );
    }

    renderPinOrders = () => {
        const { hoverOrder: order } = this.state;

        if (!order) {
            return null;
        }

        const machine = machines.find((machine) => machine.id === order.machine);
        return <div
                key={order.id}
                ref={this.card}
                style={{
                    top: this.state.y,
                    left: this.state.x,
                    borderTop: `10px solid ${machine.color}`
                }}
                className="card shadow--light"
            >
                <div className="card-body">
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
