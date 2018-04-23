import React from 'react';
import { createClassName } from '../../helpers';

import './popup.css';

export class Popup extends React.Component {
    render() {
        return (
            <div
                className={
                    createClassName(['popup', this.props.className])
                }
            >
                <header>
                    <h4>
                        {this.props.title}
                    </h4>

                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={this.props.onClose}
                    >
                        x
                    </button>
                </header>

                <section>
                    {this.props.children}
                </section>

                <footer
                    className="text-align--right"
                >
                    <button
                        className="btn btn-success btn-sm"
                        onClick={this.props.onSave}
                    >
                        Uložit
                    </button>
                </footer>
            </div>
        );
    }
}
