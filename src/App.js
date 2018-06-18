import React from 'react';
import moment from 'moment';
import set from 'lodash/set';
import differenceBy from 'lodash/differenceBy';
import { OrderPopup, SettingsPopup } from './Scenes';
import {
    Calendar,
    OrderCard,
} from './components/Calendar';
import { Nav } from './components/Nav';
import { OrderTable } from './components/OrderTable';
import {
    saveFile,
    checkForBoolean,
    getNetMachineTime,
    createGroupedOrders,
    isDateRangeOverlaping,
    calculateOperationTime,
    INPUT_DATE_TIME_FORMAT,
    calculateRemainingOperationTime,
    dispatchResize,
} from './utils/helpers';
import sync from './statics/sync.svg';

const fs = window.require('fs');
const electron = window.require('electron');

class App extends React.Component {
    constructor(props) {
        super(props);

        const startOfTheWeek = moment().startOf('week').startOf('day');
        this.state = {
            orders: [],
            open: false,
            ready: false,
            machines: [],
            products: [],
            orderList: [],
            infoText: null,
            loading: false,
            readOnly: false,
            settings: false,
            groupOrders: [],
            hoverOrder: null,
            fileLoaded: false,
            columnsVisibility: {},
            sameOperationRestTime: 0,
            filterFinishedOrders: true,
            displayOrdersInEvents: true,
            startOfTheWeek: startOfTheWeek,
            currentWeek: startOfTheWeek.week(),
        };

        this.timeout = null;
        this.settings = React.createRef();
        this.calendar = React.createRef();
    }

    // * OVLÁDÁNÍ APLIKACE + ELECTRON
    componentDidMount() {
        this.readFromLocalStorage();
        const filePath = window.localStorage.getItem('filePath');

        if (!filePath) {
            this.setState({
                fileLoaded: false,
            })
        } else {
            this.readFile(filePath);
        }

        document.addEventListener('keyup', this.handleKeyUp);
        electron.ipcRenderer.on('menu', this.handleElectronMenu);
        electron.ipcRenderer.on('dom-ready', this.handleDomReady);
        electron.ipcRenderer.on('selected-directory', this.handleElectronDialogs);
        electron.ipcRenderer.on('file-watcher-error', this.handleFileWatcherError);
        electron.ipcRenderer.on('file-watcher-change', this.handleFileWatcherChange);
    }

    componentWillUnmount() {
        this.unwatchFileChanges();

        electron.ipcRenderer.removeAllListeners('menu');
        electron.ipcRenderer.removeAllListeners('dom-ready');
        electron.ipcRenderer.removeAllListeners('file-watcher-error');
        electron.ipcRenderer.removeAllListeners('selected-directory');
        electron.ipcRenderer.removeAllListeners('file-watcher-change');
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleDomReady = () => {
        this.setState({
            ready: true,
        }, () => {
            dispatchResize();
        });
    }

    handleElectronDialogs = (sender, type, path) => {
        if (type === 'open' && path) {
            this.openFile(path[0]);
        }

        if (type === 'save') {
            this.saveFile(path);
        } 
    }

    handleFileWatcherChange = (event, path, stats) => {
        if (!path) {
            return;
        }

        this.setState({
            readOnly: true,
        });

        this.showInfoMessage(
            <React.Fragment>
                Soubor byl změněn a již není možné editovat zakázky.

                <button
                    className="btn btn-link"
                    onClick={() => this.readFile(path)}
                >
                    <img
                        alt="Sync"
                        src={sync}
                        width="20"
                        height="20"
                    />
                </button>
            </React.Fragment>
        );
    }

    handleFileWatcherError = (error) => {
        alert('Nastala chyba při sledování změn souboru: ' + error);
    }

    showSaveDialog = () => {
        electron.ipcRenderer.send('open-save-dialog');
    }

    showOpenDialog = () => {
        electron.ipcRenderer.send('open-file-dialog');
    }

    openFile = (path) => {
        if (!path && !this.state.fileLoaded) {
            this.setState({
                loading: false,
                fileLoaded: false,
            });

            return;
        } else if (!path && this.state.fileLoaded) {
            return;
        }

        return this.readFile(path);
    }

    saveFile = (path) => {
        if (!path && !this.state.fileLoaded) {
            this.setState({
                loading: false,
                fileLoaded: false,
            });

            return;
        } else if (!path && this.state.fileLoaded) {
            return;
        }

        this.sendLocalChangeMessage();
        fs.writeFile(path, '', (err) => {
            // pokud nastala chyba, zobrazí se error
            if (err) {
                return electron.ipcRenderer.send('open-error-dialog', 'Chyba při zápisu', 'Při ukládání souboru nastala chyba.');
            }

            window.localStorage.setItem('filePath', path);
            this.saveToFile();
            this.setState({
                loading: false,
                fileLoaded: true,
            });
        });
    }

    saveToFile = () => {
        this.handleReadOnly(() => {
            const filePath = window.localStorage.getItem('filePath');
    
            if (!filePath) {
                return electron.ipcRenderer.send('open-error-dialog', 'Chyba při ukládání', 'Soubor nenalezen.');
            }

            this.sendLocalChangeMessage();
            saveFile(filePath, {
                orders: this.state.orders,
                products: this.state.products,
                machines: this.state.machines,
                orderList: this.state.orderList,
            })
            .then((value) => {
                this.showInfoMessage(<p>{value}</p>, 3000);
                this.groupOrders(this.state.orders, this.state.orderList, this.state.filterFinishedOrders);
            })
            .catch((err) => {
                return electron.ipcRenderer.send('open-error-dialog', 'Chyba při ukládání', err);
            });
        });
    }

    readFile = (filePath) => {
        this.setState({
            loading: true,
            infoText: null,
        });

        // zastavit sledování souborů před každým novým čtením souboru
        this.unwatchFileChanges();
        return fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                this.setState({
                    loading: false,
                    fileLoaded: false,
                });

                this.resetState();
                return electron.ipcRenderer.send(
                    'open-error-dialog',
                    'Chyba při čtení',
                    `Při načítání souboru nasatala chyba.\nCesta k souboru:\n${filePath}`
                );
            } else {
                // načíst obsah souboru do state
                try {
                    const d = JSON.parse(data);
                    this.setState({
                        loading: false,
                        readOnly: false,
                        fileLoaded: true,
                        orders: d.orders || [],
                        products: d.products || [],
                        machines: d.machines || [],
                        orderList: d.orderList || [],
                    }, dispatchResize);

                    this.watchFileChanges(filePath);
                    this.groupOrders(d.orders, d.orderList, this.state.filterFinishedOrders);

                    window.localStorage.setItem('filePath', filePath);
                } catch (err) {
                    this.setState({
                        loading: false,
                        fileLoaded: false,
                    });

                    this.resetState();
                    return electron.ipcRenderer.send('open-error-dialog', 'Chyba při čtení', 'Nečitelný soubor.');
                }
            }
        });
    }

    readFromLocalStorage = () => {
        let columnsVisibility = window.localStorage.getItem('columnsVisibility');
        let filterFinishedOrders = checkForBoolean(window.localStorage.getItem('filterFinishedOrders'));
        let displayOrdersInEvents = checkForBoolean(window.localStorage.getItem('displayOrdersInEvents'));

        if (columnsVisibility) {
            columnsVisibility = JSON.parse(columnsVisibility);
        }

        this.setState({
            columnsVisibility,
            filterFinishedOrders,
            displayOrdersInEvents,
        });
    }

    handleKeyUp = (e) => {
        if ((e.ctrlKey || e.keyCode === 91) && e.keyCode === 78) {
            this.handleAddNewEvent();
        }

        // open dev tools
        if ((e.ctrlKey || e.keyCode === 91) && e.shiftKey && e.keyCode === 73) {
            electron.ipcRenderer.send('show-dev-tools');
        }
    }

    handleElectronMenu = (evt, arg) => {
        if (arg === 'newEvent') {
            this.handleAddNewEvent();
        }

        if (arg === 'openFile') {
            this.showOpenDialog();
        }

        if (arg === 'saveFile') {
            this.saveToFile()
        }

        if (arg === 'saveAsFile') {
            this.showSaveDialog();
        }
    }

    watchFileChanges = (filePath) => {
        electron.ipcRenderer.send('file-start-watching', filePath);
    }

    unwatchFileChanges = () => {
        electron.ipcRenderer.send('file-stop-watching');
    }

    sendLocalChangeMessage = () => {
        // ! poslat zprávu o tom, že se jedná o lokální změnu, aby se nezobrazila hláška "Soubor byl změněn"
        electron.ipcRenderer.send('file-watcher-localsave', true);
    }

    showInfoMessage = (value, timeout) => {
        this.setState({
            infoText: value,
        });

        clearTimeout(this.timeout);
        if (timeout) {
            this.timeout = setTimeout(() => {
                this.setState({
                    infoText: null,
                });
            }, timeout);
        }
    }

    handleReadOnly = (next) => {
        if (this.state.readOnly) {
            return electron.ipcRenderer.send('open-error-dialog', 'Pouze pro čtení', 'Soubor je pouze pro čtení. Prosím otevřete nejnovější verzi souboru.');
        }

        next();
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

    handleClose = () => {
        this.setState({
            open: false,
        });
        this.resetOrderState();
    }

    openSettings = (e, tabIndex = 0) => {
        this.setState({
            settings: true,
        }, () => {
            this.settings.current.setTabIndex(tabIndex);
        });
    }

    closeSettings = () => {
        this.setState({
            settings: false,
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

    // * PRÁCE S DATY
    handleAddNewEvent = () => {
        this.handleReadOnly(() => {
            this.resetOrderState(null, null, null, () => {
                this.setState({
                    open: true,
                });
            });
        });
    }

    handleEventEdit = (e, order) => {
        this.handleReadOnly(() => {
            const copyOrder = {
                ...order,
                dateFrom: moment(order.dateFrom).format(INPUT_DATE_TIME_FORMAT),
                dateTo: moment(order.dateTo).format(INPUT_DATE_TIME_FORMAT),
            };
    
            if (!copyOrder.operation) {
                copyOrder.operation = {
                    time: 0,
                    count: 0,
                    note: '',
                    order: '-',
                    casting: 0,
                    exchange: 0,
                };
            }

            if (order.operation) {
                const { count, time, exchange, casting } = order.operation;
                // const sameOperationOnSameOrder = calculateRemainingOperationTime(this.state.orders, order);
                order.operation.operationTime = calculateOperationTime(count, time, exchange, casting);
            }

            this.setState({
                open: true,
                order: copyOrder,
                // čas, který se zobrazí v popupu a bude zobrazovat kolik času zbývá doplánovat
                // sameOperationRestTime: sameOperationOnSameOrder,
            });
        });
    }

    handleItemDelete = (e, item, which) => {
        this.handleReadOnly(() => {
            if (!window.confirm(`Opravdu si přejete smazat "${item.name}"?`)) {
                return;
            }
    
            let linkedItems = [];
            let itemsCopy = [...this.state[which]];
            let diffOrdersArr = [...this.state.orders];
    
            if (which === 'machines') {
                linkedItems = this.state.orders.filter((order) => order.machine === item.id);
            } else if (which === 'orderList') {
                linkedItems = this.state.orders.filter((order) => order.orderId === item.id);
            }
    
            const linkedItemsLength = linkedItems.length;
            const message = `Přejete si smazat položky (${linkedItemsLength}) související s "${item.name}"?`;
    
            if ((linkedItemsLength > 0)) {
                if (window.confirm(message)) {
                    diffOrdersArr = differenceBy(this.state.orders, linkedItems);
                }
            }
    
            const index = itemsCopy.findIndex((m) => m.id === item.id);
            itemsCopy.splice(index, 1);
    
            this.setState({
                [which]: itemsCopy,
                orders: diffOrdersArr,
            }, this.saveToFile);
        });
    }

    handleItemSave = (e, item, which) => {
        this.handleReadOnly(() => {
            // 1. buď si zkopíruji novou položku
            let itemCopy = {...item};
            const itemsCopy = [...this.state[which]];
            const findIndex = itemsCopy.findIndex((m) => m.id === item.id);

            if (findIndex > -1) {
                // 2. nebo ji nahradím starou položkou ze state
                itemCopy = itemsCopy[findIndex];
                itemsCopy[findIndex] = item;
            } else {
                itemsCopy.push(item);
            }

            this.setState({
                [which]: itemsCopy,
            }, () => {
                // kontrola, jestli se zakázka znovu otevřela
                // kontrola, jestli upravuji zakázky, jestli už zakázka existuje (abych potom neotevíral nově vytvořenou zakázku)
                if ((which === 'orderList' && findIndex > -1) && (itemCopy.done !== itemsCopy[findIndex].done)) {
                    this.handleCloseOrOpenOrder(item.id, item.done);
                } else {
                    this.saveToFile();
                }
            });
        });
    }

    handleEventDrop = (order) => {
        this.handleReadOnly(() => {
            const ordersCopy = [...this.state.orders];
            const index = ordersCopy.findIndex((o) => o.id === order.id);
            const isOverlaping = isDateRangeOverlaping(ordersCopy, order);
    
            if (isOverlaping) {
                return electron.ipcRenderer.send('open-error-dialog', 'Chyba', 'V tomto čase je daný stroj již vytížen.');
            }
    
            order.workingHours = getNetMachineTime(order.dateFrom, order.dateTo);
            ordersCopy.splice(index, 1, order);
    
            this.setState({
                open: false,
                orders: ordersCopy,
            }, this.saveToFile);
        });
    }

    handleSelectingMouseUp = (dateFrom, dateTo, machineId) => {
        this.resetOrderState(dateFrom, dateTo, machineId, () => {
            this.setState({
                open: true,
            });
        });
    }

    handleInputChange = (e) => {
        const { products, orders, } = this.state;
        const { name, value } = e.target;

        if ((name === 'orderId' || name === 'machine' || name === 'operation.order') && value === '-') {
            return;
        }

        if (name === 'orderId' && value === 'new') {
            return this.openSettings(null, 2);
        }

        if (name === 'machine' && value === 'new') {
            return this.openSettings(null, 1);
        }

        const order = set(this.state.order, name, value);

        if (name === 'dateFrom' || name === 'dateTo') {
            const date = moment(value);
            const hours = date.hours();
            const minutes = date.minutes();

            const shiftFrom = hours < 7;
            const shiftTo = (hours > 20) || (hours > 20 && minutes > 0);

            if ((name === 'dateFrom' && shiftFrom) || (name === 'dateFrom' && shiftTo) || (name === 'dateTo' && shiftTo)) {
                return;
            }

            order.workingHours = getNetMachineTime(order.dateFrom, order.dateTo);
        }

        if (name === 'operation.order' || name === 'productName') {
            const productOperation = products.find((product) => product.name === order.productName);

            if (productOperation && productOperation.operation[value]) {
                order.operation = {
                    ...productOperation.operation[value],
                    order: value,
                };
            } else {
                order.operation = {
                    time: 0,
                    count: 0,
                    note: '',
                    casting: 0,
                    exchange: 0,
                    operationTime: 0,
                    order: name === 'operation.order' ? value : '-',
                };
            }
        }

        const { count, time, exchange, casting } = order.operation;
        order.operation.operationTime = calculateOperationTime(count, time, exchange, casting);
        const sameOperationOnSameOrder = calculateRemainingOperationTime(orders, order);

        this.setState({
            order: order,
            // čas, který se zobrazí v popupu a bude zobrazovat kolik času zbývá doplánovat
            sameOperationRestTime: sameOperationOnSameOrder,
        });
    }

    handleSave = () => {
        this.handleReadOnly(() => {
            const products = [...this.state.products];
            const ordersCopy = [...this.state.orders];
            const orderListCopy = [...this.state.orderList];
            const ordersDone = ordersCopy.filter((o) => {
                if ((o.orderId === this.state.order.orderId) && (o.productName === this.state.order.productName)) {
                    return true;
                }

                return false;
            });
            const done = ordersDone.length > 0 ? (ordersDone[0].done ? ordersDone[0].done : false) : false;

            const order = {
                ...this.state.order,
                done: done,
                dateTo: moment(this.state.order.dateTo).format(),
                dateFrom: moment(this.state.order.dateFrom).format(),
            };
    
            if (!order.orderId || !order.machine || !order.productName) {
                return electron.ipcRenderer.send('open-error-dialog', 'Chyba', 'Při zakládání zakázky musí být vyplněna zakázka, výrobek a stroj.');
            } 
    
            order.workingHours = getNetMachineTime(order.dateFrom, order.dateTo);
    
            if (!this.state.order.id) {
                if (isDateRangeOverlaping(ordersCopy, order)) {
                    return electron.ipcRenderer.send('open-error-dialog', 'Chyba', 'V tomto čase je daný stroj vytížen.');
                }
    
                order.id = moment().unix();
                ordersCopy.push(order);
            } else {
                const findIndex = ordersCopy.findIndex((o) => o.id === order.id);
                const dateFromIsSame = moment(order.dateFrom).isSame(ordersCopy[findIndex].dateFrom);
                const dateToIsSame = moment(order.dateTo).isSame(ordersCopy[findIndex].dateTo);
    
                if ((!dateFromIsSame || !dateToIsSame) && ordersCopy[findIndex].id !== order.id) {
                    if (isDateRangeOverlaping(ordersCopy, order)) {
                        return electron.ipcRenderer.send('open-error-dialog', 'Chyba', 'V tomto čase je daný stroj vytížen.');
                    }
                }
    
                ordersCopy.splice(findIndex, 1, order);
            }
    
            const findIndex = products.findIndex((product) => order.productName === product.name);
            if (order.operation.order === '-') {
                delete order.operation;
            } else {
                if (findIndex === -1) {
                    products.push({
                        name: order.productName,
                        operation: {
                            [order.operation.order]: {
                                ...order.operation,
                            },
                        },
                    });
                } else {
                    products[findIndex] = {
                        ...products[findIndex],
                        operation: {
                            ...products[findIndex].operation,
                            [order.operation.order]: {
                                ...order.operation,
                            },
                        },
                    };
                }
            }
    
            this.setState({
                open: false,
                orders: ordersCopy,
                products: products,
                orderList: orderListCopy,
            }, this.saveToFile);
            this.resetOrderState();
        });
    }

    handleOrderDelete = (e, passedOrder) => {
        this.handleReadOnly(() => {
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
            }, this.saveToFile);
            this.resetOrderState();
        });
    };

    handleOrderOrProductOpenOrClose = (e, productName, orderId, done) => {
        if (productName == null && typeof orderId === 'string') {
            this.handleCloseOrOpenOrder(orderId, done);
        }

        if ((typeof productName === 'string') && (typeof orderId === 'string')) {
            this.handleCloseOrOpenProduct(productName, orderId, done);
        }
    }

    handleCloseOrOpenOrder = (orderId, done = true) => {
        let orderListCopy = [...this.state.orderList];
        let setProductInOrderToDone = [...this.state.orders];
        const findOrder = orderListCopy.findIndex((o) => o.id === orderId);

        if (findOrder > -1) {
            const finishDate = moment().format();
            orderListCopy[findOrder].done = done;
            setProductInOrderToDone = this.state.orders.map((order) => {
                if (order.orderId === orderId) {
                    order.done = done;
                    order.finishDate = finishDate;
                }
    
                return order;
            });
        }

        this.setState({
            orderList: orderListCopy,
            orders: setProductInOrderToDone,
        }, this.saveToFile);
    }

    handleCloseOrOpenProduct = (productName, orderId, done = true) => {
        const finishDate = moment().format();
        const setProductInOrderToDone = this.state.orders.map((order) => {
            if ((order.orderId === orderId) && (order.productName === productName)) {
                order.done = done;
                order.finishDate = finishDate;
            }

            return order;
        });

        this.setState({
            orders: setProductInOrderToDone,
        }, this.saveToFile);
    }

    handleMoveToDate = (date) => {
        const weekFromDate = moment(date).week();
        const startOfTheWeek = moment(date).startOf('week');

        this.setState({
            currentWeek: weekFromDate,
            startOfTheWeek: startOfTheWeek,
        });
    }

    groupOrders = (events = [], orderList = [], filterFinishedOrders = false) => {
        const orders = createGroupedOrders(events, orderList, filterFinishedOrders);

        this.setState({
            groupOrders: orders,
        }, dispatchResize);
    }

    handleSettingsChange = (e) => {
        let name = e.target.name;
        let checked = e.target.checked;
        console.log(e.target.checked);
        this.setState({
            [e.target.name]: checked,
        }, () => {
            if (name === 'filterFinishedOrders') {
                this.groupOrders(this.state.orders, this.state.orderList, this.state.filterFinishedOrders);
            } else {
                dispatchResize();
            }

            window.localStorage.setItem(name, checked);
        });
    }

    handleColumnVisibility = (e) => {
        this.setState({
            columnsVisibility: {
                ...this.state.columnsVisibility,
                [e.target.name]: e.target.checked,
            },
        }, () => {
            window.localStorage.setItem('columnsVisibility', JSON.stringify(this.state.columnsVisibility));
            dispatchResize();
        });
    }

    // * RENDEROVÁNÍ APLIKACE
    renderMainScreen = () => {
        const {
            orders,
            loading,
            machines,
            products,
            orderList,
            fileLoaded,
            currentWeek,
            groupOrders,
            startOfTheWeek,
            columnsVisibility,
            displayOrdersInEvents,
        } = this.state;

        if (loading) {
            return null;
        }

        if ((machines.length === 0) && (orders.length === 0) && fileLoaded) {
            return (
                <div className="jumbotron">
                    <h4>
                        Zatím nejsou vytvořeny žádné záznamy.
                    </h4>

                    <hr className="mt-3 mb-3" />

                    <p>
                        Začnětě přidáním stroje v nastavení aplikace.
                    </p>
                </div>
            );
        } else if (!fileLoaded) {
            return (
                <div className="jumbotron">
                    <h4>
                        Soubor nenalezen.
                    </h4>

                    <hr className="mt-3 mb-3" />

                    <button
                        className="btn btn-info"
                        onClick={this.showSaveDialog}
                    >
                        Nový soubor
                    </button>

                    <button
                        className="btn btn-info ml-3"
                        onClick={this.showOpenDialog}
                    >
                        Otevřít soubor
                    </button>
                </div>
            );
        }

        return (
            <React.Fragment>
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
                    displayOrdersInEvents={displayOrdersInEvents}
                />

                <OrderTable
                    events={orders}
                    products={products}
                    orderList={orderList}
                    groupedOrders={groupOrders}
                    moveToDate={this.handleMoveToDate}
                    columnsVisibility={columnsVisibility}
                    onCloseOrOpenItem={this.handleOrderOrProductOpenOrClose}
                />
            </React.Fragment>
        );
    }

    render() {
        const {
            open,
            order,
            machines,
            settings,
            products,
            orderList,
            hoverOrder,
            currentWeek,
            groupOrders,
            columnsVisibility,
            filterFinishedOrders,
            sameOperationRestTime,
            displayOrdersInEvents,
        } = this.state;

        if (!this.state.ready) {
            return null;
        }

        return (
            <div
                className="app"
            >
                <Nav
                    currentWeek={currentWeek}
                    infoText={this.state.infoText}
                    openSettings={this.openSettings}
                    onWeekMove={this.handleWeekMove}
                    addNewEvent={this.handleAddNewEvent}
                    disabledNewOrder={machines.length === 0}
                    onCurrentWeekClick={this.resetCurrentWeek}
                />

                <div
                    className="pt-3 pr-3 pb-3 pl-3 app-main--screen"
                >
                    { this.renderMainScreen() }

                    {
                        !open
                        ? null
                        : <OrderPopup
                            order={order}
                            products={products}
                            machines={machines}
                            orderList={orderList}
                            handleSave={this.handleSave}
                            handleClose={this.handleClose}
                            handleInputChange={this.handleInputChange}
                            filterFinishedOrders={filterFinishedOrders}
                            sameOperationRestTime={sameOperationRestTime}
                        />
                    }

                    {
                        !hoverOrder
                        ? null
                        : <OrderCard
                            order={hoverOrder}
                            machines={machines}
                            orderList={orderList}
                            groupedOrders={groupOrders}
                        />
                    }
                </div>

                {
                    !settings
                    ? null
                    : <SettingsPopup
                        ref={this.settings}
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
                        columnsVisibility={columnsVisibility}
                        filterFinishedOrders={filterFinishedOrders}
                        displayOrdersInEvents={displayOrdersInEvents}
                        handleSettingsChange={this.handleSettingsChange}
                        handleColumnVisibility={this.handleColumnVisibility}
                    />
                }
            </div>
        );
    }

    // * RESETY
    resetState = () => {
        this.setState({
            orders: [],
            open: false,
            products: [],
            machines: [],
            orderList: [],
            loading: false,
            groupOrders: [],
            settings: false,
            hoverOrder: null,
            fileLoaded: false,
            columnsVisibility: {},
            sameOperationRestTime: 0,
            displayOrdersInEvents: true,
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
                done: false,
                dateTo: dateTo,
                operation: {
                    time: 0,        // čas na kus (sčítá se s nahazováním a výměnou)
                    count: 0,
                    note: '',
                    order: '-',
                    casting: 0,     // nahazování
                    exchange: 0,    // výměna
                    operationTime: 0, // vypočítá čas (pomocná funkce calculateOperationTime)
                },
                dateFrom: dateFrom,
                workingHours: workingHours,
                machine: machineId || this.state.machines[0].id,
            },
            sameOperationRestTime: 0,
        }, cb);
    }
}

export default App;
