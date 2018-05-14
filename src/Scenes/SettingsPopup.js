import React from 'react';
import { Popup } from '../components/Popup';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';

export class SettingsPopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabIndex: 0,
            tempMachine: {
                id: null,
            },
        };
    }

    handleMachineSave = (e) => {
        const machineCopy = { ...this.state.tempMachine };

        if (machineCopy.name.length === 0) {
            return alert('Název stroje musí být vyplněn.');
        }

        if (machineCopy.new) {
            machineCopy.id = machineCopy.name.toString().toLowerCase();
            delete machineCopy.new;
        }

        this.setState({
            tempMachine: {
                id: null,
                name: '',
                new: false,
            },
        });

        this.props.onMachineSave(e, machineCopy);
    }

    handleMachineAdd = (e) => {
        this.setState({
            tempMachine: {
                name: '',
                new: true,
                id: Date.now(),
            },
        });
    }

    handleMachineInputChange = (e) => {
        const machineCopy = {...this.state.tempMachine};
        machineCopy[e.target.name] = e.target.value;

        this.setState({
            tempMachine: machineCopy,
        });
    }

    render() {
        const {
            tabIndex,
            tempMachine,
        } = this.state;

        const {
            machines,
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
                        <Tab
                            selectedClassName="settings--tabs-selected"
                        >
                            Zakázky
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
                        <div
                            className="clearfix"
                        >
                            <button
                                onClick={this.handleMachineAdd}
                                className="btn btn-success pull-right"
                            >
                                Přidat stroj
                            </button>
                        </div>

                        <table
                            className="table table-bordered mt-3 table--machines"
                        >
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th
                                        style={{
                                            width: '65%'
                                        }}
                                    >
                                        Stroj
                                    </th>
                                    <th>Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    tempMachine.new
                                    ? this.renderMachineTr(tempMachine)
                                    : null
                                }
                                { machines.map(this.renderMachineTr) }
                            </tbody>
                        </table>
                    </TabPanel>
                </Tabs>
            </Popup>
        );
    }

    renderMachineTr = (machine, index) => {
        const {
            tempMachine,
        } = this.state;

        return (
            <tr
                key={index || machine.id}
            >
                <td>{isNaN(index) ? '-' : `${index + 1}.`}</td>
                <td>
                    {
                        tempMachine.id === machine.id
                        ? <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={tempMachine.name}
                            onChange={(e) => this.handleMachineInputChange(e, machine)}
                        />
                        : machine.name
                    }
                </td>
                <td>
                    {
                        tempMachine.id === machine.id
                        ? <React.Fragment>
                            <button
                                onClick={this.handleMachineSave}
                                className="btn btn-success btn-sm"
                            >
                                Uložit
                            </button>

                            <button
                                className="btn btn-danger btn-sm ml-3"
                                onClick={() => this.setState({ tempMachine: { id: null } })}
                            >
                                Zrušit
                            </button>
                        </React.Fragment>
                        : <React.Fragment>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => this.setState({ tempMachine: { ...machine } })}
                            >
                                Editovat
                            </button>

                            <button
                                className="btn btn-danger btn-sm ml-3"
                                onClick={(e) => this.props.onMachineDelete(e, machine)}
                            >
                                Smazat
                            </button>
                        </React.Fragment>
                    }
                </td>
            </tr>
        );
    }
}
