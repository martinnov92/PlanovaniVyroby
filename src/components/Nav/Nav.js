import React from 'react';

export class Nav extends React.Component {
    render() {
        return (
            <nav
                className="navbar navbar-dark bg-dark mb-3"
            >
                    <a className="navbar-brand" href="#">Plánovač</a>

                    <div>
                        <button
                            className="btn btn-outline-success text-light"
                            onClick={this.props.addNewEvent}
                        >
                            Přidat zakázku
                        </button>

                        <button
                            className="btn btn-success ml-3"
                            type="button"
                        >
                            Nastavení
                        </button>
                    </div>
            </nav>
        );
    }
}
