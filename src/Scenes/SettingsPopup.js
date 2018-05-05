import React from 'react';
import { Popup } from '../components/Popup';

export class SettingsPopup extends React.Component {
    render() {
        const {
            filterFinishedOrders,
            handleFilterFinishedOrders,
        } = this.props;

        return (
            <Popup
                title="Nastavení"
                onClose={this.props.handleClose}
            >
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
            </Popup>
        );
    }
}
