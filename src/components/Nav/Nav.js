import React from 'react';

export class Nav extends React.Component {
    render() {
        return (
            <nav
                className="navbar navbar-dark bg-dark shadow--light"
            >
                    <h2
                        className="navbar-brand"
                    >
                        Plánovač
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
                                {"<"}
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
                                {">"}
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
