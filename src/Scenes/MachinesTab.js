import React from 'react';
import 'react-tabs/style/react-tabs.css';

export class MachinesTab extends React.Component {
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
        } = this.props;

        return (
            <React.Fragment>
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
            </React.Fragment>
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
