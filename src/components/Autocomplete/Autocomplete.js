import React from 'react';
import { createClassName } from '../../helpers';

import './autocomplete.css';

export class Autocomplete extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
            focus: false,
            valueFromProps: false,
        };

        this.input = React.createRef();
        this.autocomplete = React.createRef();
    }

    componentDidMount() {
        this.setState({
            value: this.props.value || '',
            valueFromProps: !!this.props.value,
        });

        document.addEventListener('click', this.handleClickOutside)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.setState({
                value: nextProps.value,
                valueFromProps: !!nextProps.value,
            });
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside)
    }

    handleFocus = (e) => {
        this.setState({
            focus: true,
        });
    }

    handleClickOutside = (e) => {
        const isInRoot = this.autocomplete.current.contains(e.target);

        if (isInRoot) {
            return;
        }

        this.setState({
            focus: false,
        });
    }

    handleChange = (e) => {
        this.setState({
            value: e.target.value,
            valueFromProps: false,
        });
    }

    handleAdd = (e) => {
        this.props.onChange({ target: { name: this.props.name, value: this.state.value } });

        this.setState({
            focus: false,
        });
    }

    handleClick = (e, item) => {
        this.setState({
            focus: false,
        });

        this.props.onChange({ target: { name: this.props.name, value: item } });
    }

    displayAddButton = (data) => {
        if ((this.state.value.length > 0 && data.length === 0) && !this.state.valueFromProps) {
            return true;
        }

        return false;
    }

    render() {
        const {
            value,
            focus,
        } = this.state;

        const {
            data,
        } = this.props;

        const filterData = data.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
        const showAddButton = this.displayAddButton(filterData);
        const listClassNames = createClassName([
            'list-group',
            'shadow--light',
            'mn-autocomplete--list',
        ]);
        const wrapperClassNames = createClassName([
            'mn-autocomplete',
            showAddButton ? 'mn-autocomplete--with-btn' : null,
        ]);

        return (
            <div
                className={wrapperClassNames}
                ref={this.autocomplete}
            >
                <input
                    type="text"
                    value={value}
                    ref={this.input}
                    className="form-control"
                    onFocus={this.handleFocus}
                    onChange={this.handleChange}
                />

                {
                    (value.length > 0 && !this.state.valueFromProps) || focus
                    ? <ul
                        className={listClassNames}
                    >
                        {
                            filterData.map((item) => {
                                return (
                                    <li
                                        key={item}
                                        onClick={(e) => this.handleClick(e, item)}
                                        className="list-group-item list-group-item-action"
                                    >
                                        { item }
                                    </li>
                                );
                            })
                        }
                    </ul>
                    : null
                }

                {
                    showAddButton
                    ? <button
                        onClick={this.handleAdd}
                        className="mn-autocomplete--btn btn btn-outline-success input-group-append"
                    >
                        + přidat
                    </button>
                    : null
                }
            </div>
        );
    }
}
