import React from 'react';
import {
    OrdersTab,
    MachinesTab,
} from './';
import { Popup } from '../components/Popup';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';

export class SettingsPopup extends React.Component {
    static defaultProps = {
        columnsVisibility: {},
    };

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
            fontSize,
            columnsVisibility,
            handleSettingsChange,
            filterFinishedOrders,
            displayOrdersInEvents,
            handleColumnVisibility,
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
                        <h5 className="mb-1">Aplikace</h5>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Velikost písma</span>
                            </div>
                            <input
                                min={8}
                                max={14}
                                type="number"
                                name="fontsize"
                                value={fontSize}
                                onChange={handleSettingsChange}
                            />
                        </div>

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
                                Zobrazit čísla operací v kalendáři
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
                                        checked={filterFinishedOrders}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                            </div>
                            <label
                                className="form-control"
                                htmlFor="filterFinishedOrders"
                            >
                                Skrýt dokončené zakázky
                            </label>
                        </div>
                        {/* Nastavení sloupců v tabulce */}
                        <p>Viditelné sloupce (operace)</p>
                        <div className="display--flex order--table-settings">
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            name="1"
                                            type="checkbox"
                                            id="firstColumn"
                                            checked={columnsVisibility['1']}
                                            onChange={handleColumnVisibility}
                                        />
                                    </div>
                                </div>
                                <label
                                    className="form-control"
                                    htmlFor="firstColumn"
                                >
                                    1.
                                </label>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            name="2"
                                            type="checkbox"
                                            id="secondColumn"
                                            checked={columnsVisibility['2']}
                                            onChange={handleColumnVisibility}
                                        />
                                    </div>
                                </div>
                                <label
                                    className="form-control"
                                    htmlFor="secondColumn"
                                >
                                    2.
                                </label>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            name="3"
                                            type="checkbox"
                                            id="thirdColumn"
                                            checked={columnsVisibility['3']}
                                            onChange={handleColumnVisibility}
                                        />
                                    </div>
                                </div>
                                <label
                                    className="form-control"
                                    htmlFor="thirdColumn"
                                >
                                    3.
                                </label>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            name="4"
                                            type="checkbox"
                                            id="fourthColumn"
                                            checked={columnsVisibility['4']}
                                            onChange={handleColumnVisibility}
                                        />
                                    </div>
                                </div>
                                <label
                                    className="form-control"
                                    htmlFor="fourthColumn"
                                >
                                    4.
                                </label>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            name="5"
                                            type="checkbox"
                                            id="fifthColumn"
                                            checked={columnsVisibility['5']}
                                            onChange={handleColumnVisibility}
                                        />
                                    </div>
                                </div>
                                <label
                                    className="form-control"
                                    htmlFor="fifthColumn"
                                >
                                    5.
                                </label>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            name="6"
                                            type="checkbox"
                                            id="sixthColumn"
                                            checked={columnsVisibility['6']}
                                            onChange={handleColumnVisibility}
                                        />
                                    </div>
                                </div>
                                <label
                                    className="form-control"
                                    htmlFor="sixthColumn"
                                >
                                    6.
                                </label>
                            </div>
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
