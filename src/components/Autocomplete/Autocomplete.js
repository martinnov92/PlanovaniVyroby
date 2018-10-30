import React from 'react';
import { createClassName } from '../../utils/helpers';

import './autocomplete.css';

export class Autocomplete extends React.PureComponent {
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
        if (e.target.value.length === 0) {
            this.props.onChange({ target: { name: this.props.name, value: e.target.value } });
        }

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
            disabled,
            propertyName,
        } = this.props;

        const filterData = data.filter((item) => item[propertyName].toLowerCase().includes(value.toLowerCase()));
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
                    disabled={disabled}
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
                                        key={item[propertyName]}
                                        onClick={(e) => this.handleClick(e, item[propertyName])}
                                        className="list-group-item list-group-item-action"
                                    >
                                        { item[propertyName] }
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
