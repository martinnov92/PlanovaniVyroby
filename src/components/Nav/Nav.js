import React from 'react';
import CONFIG from '../../statics/cog.svg';
import ARROW_LEFT from '../../statics/arrow-left.svg';
import ARROW_RIGHT from '../../statics/arrow-right.svg';

import './nav.css';

export class Nav extends React.PureComponent {
    render() {
        return (
            <nav
                className="navbar navbar-dark bg-dark shadow--light"
            >
                    <div className="text-light">
                        {this.props.infoText}
                    </div>

                    <div>
                        <div
                            role="group"
                            className="btn-group"
                        >
                            <button
                                title="Minulý týden"
                                className="btn text-weight--bold btn-success"
                                onClick={(e) => this.props.onWeekMove(e, 'prev')}
                            >
                                <img
                                    width="20px"
                                    height="20px"
                                    alt="Minulý týden"
                                    src={ARROW_LEFT}
                                />
                            </button>

                            <button
                                title="Aktuální týden"
                                className="btn btn-secondary"
                                onClick={this.props.onCurrentWeekClick}
                            >
                                {this.props.currentWeek}. týden
                            </button>

                            <button
                                title="Další týden"
                                className="btn text-weight--bold btn-success"
                                onClick={(e) => this.props.onWeekMove(e, 'next')}
                            >
                                <img
                                    width="20px"
                                    height="20px"
                                    alt="Další týden"
                                    src={ARROW_RIGHT}
                                />
                            </button>
                        </div>

                        {
                            this.props.disabledNewOrder
                            ? null
                            : <button
                                className="btn btn-success ml-3"
                                onClick={this.props.addNewEvent}
                            >
                                + Práce
                            </button>
                        }

                        <button
                            type="button"
                            title="Nastavení"
                            onClick={this.props.openSettings}
                            className="btn btn-outline-success ml-3 text-light"
                        >
                            <img
                                src={CONFIG}
                                width="20px"
                                height="20px"
                                alt="Nastavení"
                            />
                        </button>
                    </div>
            </nav>
        );
    }
}
