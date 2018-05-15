import React from 'react';
import { createClassName } from '../../helpers';

import './autocomplete.css';

export class Autocomplete extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            focus: false,
            value: '',
        };

        this.autocomplete = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside)
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
        });
    }

    handleClick = (e, item) => {
        this.setState({
            focus: false,
        });

        this.props.onChange({ target: { name: this.props.name, value: item } });
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
        const showAddButton = value.length > 0 && filterData.length === 0;
        const listClassNames = createClassName([
            'list-group',
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
                    className="form-control"
                    onFocus={this.handleFocus}
                    onChange={this.handleChange}
                />

                {
                    value.length > 0 || focus
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
