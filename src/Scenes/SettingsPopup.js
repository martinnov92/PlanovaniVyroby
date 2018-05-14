import React from 'react';
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
    render() {
        const {
            tabIndex,
        } = this.state;

        const {
            filterFinishedOrders,
            handleFilterFinishedOrders,
        } = this.props;

        return (
            <Popup
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
                    </TabList>

                    <TabPanel>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <input
                                        type="checkbox"
                                        id="filterFinishedOrders"
                                        name="filterFinishedOrders"
                                        checked={!filterFinishedOrders}
                                        onChange={handleFilterFinishedOrders}
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
                    </TabPanel>

                    <TabPanel>
                        
                    </TabPanel>
                </Tabs>
            </Popup>
        );
    }
}
