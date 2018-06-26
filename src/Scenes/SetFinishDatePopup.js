import React from 'react';
import moment from 'moment';
import { Popup } from '../components/Popup';
import { INPUT_DATE_TIME_FORMAT } from '../utils/helpers';

export class SetFinishDatePopup extends React.Component {
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
        const {
            product,
            onCancel,
        } = this.props;

        return (
            <Popup
                width="400px"
                modal={true}
                onClose={onCancel}
                title={'Termnín'}
                footerButtons={() => (
                    <React.Fragment>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-sm ml-2"
                        >
                            Zrušit
                        </button>

                        <button
                            type="button"
                            onClick={this.handleConfirm}
                            className="btn btn-sm btn-danger ml-2"
                        >
                            Uložit
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
