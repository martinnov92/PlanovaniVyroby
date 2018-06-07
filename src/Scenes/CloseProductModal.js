import React from 'react';
import moment from 'moment';
import { Popup } from '../components/Popup';
import { INPUT_DATE_TIME_FORMAT } from '../helpers';

export class CloseProductModal extends React.Component {
    constructor() {
        super();

        this.state = {
            date: moment().format(INPUT_DATE_TIME_FORMAT),
        };
    }

    handleChange = (e) => {
        const formatedDate = moment(e.target.value).format(INPUT_DATE_TIME_FORMAT);

        this.setState({
            [e.target.name]: formatedDate,
        });
    }

    handleConfirm = (e) => {
        this.props.onConfirm(this.state.value);
    }

    render() {
        return (
            <Popup
                width="400px"
                title="Ukončení výroby výrobku"
                onClose={this.props.onCancel}
                footerButtons={() => (
                    <React.Fragment>
                        <button
                            type="button"
                            onClick={this.props.onCancel}
                            className="btn btn-sm ml-2"
                        >
                            Zrušit
                        </button>

                        <button
                            type="button"
                            onClick={this.handleConfirm}
                            className="btn btn-sm btn-danger ml-2"
                        >
                            Uzavřít výrobek
                        </button>
                    </React.Fragment>
                )}
            >
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Datum a čas</span>
                    </div>
                    <input
                        name="date"
                        required={true}
                        type="datetime-local"
                        value={this.state.date}
                        className="form-control"
                        onChange={this.handleChange}
                    />
                </div>
            </Popup>
        );
    }
}
