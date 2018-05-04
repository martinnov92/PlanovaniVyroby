import React from 'react';
import './order-table.css';
import { createClassName } from '../../helpers';

export class OrderTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
        };

        this.tableWrapper = React.createRef();
        this.fixedHeader = React.createRef();
    }

    componentDidMount() {
        this.setHeight();
    }

    setHeight() {
        const width = this.fixedHeader.current.getBoundingClientRect().width;
        const height = this.tableWrapper.current.getBoundingClientRect().height;

        this.setState({
            width,
            height,
        });
    }

    render() {
        const style = {};

        const classNames = createClassName([
            'table',
            'table-bordered',
            this.props.className,
        ]);

        const classNamesHeader = createClassName([
            'table',
            'table-bordered',
            'table-header--fixed',
        ]);

        if (this.state.height > 0) {
            style.width = this.state.width;
            style.height = this.state.height;
        }

        return (
            <div
                className="table--orders element--block shadow--light mt-3"
                ref={this.tableWrapper}
            >
                <table
                    className={classNamesHeader}
                    ref={this.fixedHeader}
                >
                    <thead>
                        <tr>
                            <th scope="col">Zakázka</th>
                            <th scope="col">Název výrobku</th>
                            <th scope="col">Počet kusů</th>
                            <th scope="col">1.o Čas/ks (napl)</th>
                            <th scope="col">2.o Čas/ks (napl)</th>
                            <th scope="col">3.o Čas/ks (napl)</th>
                            <th scope="col">4.o Čas/ks (napl)</th>
                            <th scope="col">5.o Čas/ks (napl)</th>
                            <th scope="col">6.o Čas/ks (napl)</th>
                            <th scope="col">Celkový čas na kus</th>
                            <th scope="col">Celkový čas na zakázku</th>
                            <th scope="col">Naplánováné</th>
                            <th scope="col">Zbývá</th>
                        </tr>
                    </thead>
                </table>

                <div
                    className="table--scrollable"
                    style={style}
                >
                    <table className={classNames}>
                        <tbody>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>1234xxxx6</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    } 
}
