import React from 'react';
import {
    OrdersTab,
    MachinesTab,
} from './';
import { Popup } from '../components/Popup';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';

export class SettingsPopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabIndex: 0,
        };
    }

    setTabIndex = (tabIndex = 0) => {
        this.setState({
            tabIndex,
        });
    }

    render() {
        const {
            tabIndex,
        } = this.state;

        const {
            displayTotalRow,
            handleSettingsChange,
            filterFinishedOrders,
            displayOrdersInEvents,
        } = this.props;

        return (
            <Popup
                modal={true}
                title="Nastavení"
                className="popup--settings"
                onClose={this.props.handleClose}
            >
                <Tabs
                    selectedIndex={tabIndex}
                    onSelect={(index) => this.setState({ tabIndex: index })}
                >
                    <TabList>
                        <Tab
                            selectedClassName="settings--tabs-selected"
                        >
                            Obecné
                        </Tab>
                        <Tab
                            selectedClassName="settings--tabs-selected"
                        >
                            Stroje
                        </Tab>
                        <Tab
                            selectedClassName="settings--tabs-selected"
                        >
                            Zakázky
                        </Tab>
                    </TabList>

                    <TabPanel>
                        <h5 className="mb-1">Kalendář</h5>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <input
                                        type="checkbox"
                                        id="displayOrdersInEvents"
                                        name="displayOrdersInEvents"
                                        checked={displayOrdersInEvents}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                            </div>
                            <label
                                className="form-control"
                                htmlFor="displayOrdersInEvents"
                            >
                                Zobrazovat čísla operací v kalendáři
                            </label>
                        </div>

                        <hr />

                        <h5 className="mb-1">Přehled zakázek a výrobků</h5>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <input
                                        type="checkbox"
                                        id="filterFinishedOrders"
                                        name="filterFinishedOrders"
                                        checked={!filterFinishedOrders}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                            </div>
                            <label
                                className="form-control"
                                htmlFor="filterFinishedOrders"
                            >
                                Zobrazit dokončené zakázky
                            </label>
                        </div>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <input
                                        type="checkbox"
                                        id="displayTotalRow"
                                        name="displayTotalRow"
                                        checked={displayTotalRow}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                            </div>
                            <label
                                className="form-control"
                                htmlFor="displayTotalRow"
                            >
                                Zobrazovat řádek "Celkový čas na zakázku"
                            </label>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <MachinesTab
                            machines={this.props.machines}
                            onMachineSave={this.props.onMachineSave}
                            onMachineDelete={this.props.onMachineDelete}
                        />
                    </TabPanel>

                    <TabPanel>
                        <OrdersTab
                            orders={this.props.orders}
                            onOrderSave={this.props.onOrderSave}
                            onOrderDelete={this.props.onOrderDelete}
                        />
                    </TabPanel>
                </Tabs>
            </Popup>
        );
    }
}
