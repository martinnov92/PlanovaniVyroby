import React from 'react';
import ARROW_LEFT from '../../statics/arrow-left.svg';
import ARROW_RIGHT from '../../statics/arrow-right.svg';

import './nav.css';

export class Nav extends React.Component {
    render() {
        return (
            <nav
                className="navbar navbar-dark bg-dark shadow--light"
            >
                    <h2
                        className="navbar-brand"
                    >
                        
                    </h2>

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

                        <button
                            className="btn btn-success ml-3"
                            onClick={this.props.addNewEvent}
                        >
                            Přidat zakázku
                        </button>

                        <button
                            type="button"
                            onClick={this.props.openSettings}
                            className="btn btn-outline-success ml-3 text-light"
                        >
                            Nastavení
                        </button>
                    </div>
            </nav>
        );
    }
}
