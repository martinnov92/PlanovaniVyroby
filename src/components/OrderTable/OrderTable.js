import React from 'react';
import { createClassName, createGroupedOrders } from '../../helpers';
import './order-table.css';

export class OrderTable extends React.Component {
    static defaultProps = {
        events: [],
    };

    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            scrollLeft: 0,
        };

        this.fixedHeader = React.createRef();
        this.tableWrapper = React.createRef();
        this.scrollableDiv = React.createRef();
    }

    componentDidMount() {
        this.setDimension();
        window.addEventListener('resize', this.setDimension)
        this.scrollableDiv.current.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        this.setState({
            scrollLeft: this.scrollableDiv.current.scrollLeft,
        });
    }

    setDimension = () => {
        const fixedHeader = this.fixedHeader.current.getBoundingClientRect();
        const height = this.tableWrapper.current.getBoundingClientRect().height - fixedHeader.height;

        this.setState({
            width: fixedHeader.width,
            height,
        });
    }

    renderTableBody = (events) => {
        // zgrupovat zakázky podle orderId
        const groupedOrders = createGroupedOrders(events);
        console.log(groupedOrders);
    }

    render() {
        const divStyle = {};
        const tableStyle = {};

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
            tableStyle.width = this.state.width;
            divStyle.height = this.state.height;
        }

        return (
            <div
                className="table--orders element--block shadow--light mt-3"
                ref={this.tableWrapper}
            >
                <table
                    ref={this.fixedHeader}
                    className={classNamesHeader}
                    style={{
                        transform: `translateX(${this.state.scrollLeft * -1}px)`
                    }}
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
                            <th scope="col">Čas na kus</th>
                            <th scope="col">Čas na zakázku</th>
                            <th scope="col">Naplánováné</th>
                            <th scope="col">Zbývá</th>
                        </tr>
                    </thead>
                </table>

                <div
                    style={divStyle}
                    ref={this.scrollableDiv}
                    className="table--scrollable"
                >
                    <table
                        className={classNames}
                        style={tableStyle}
                    >
                        <tbody>
                            {this.renderTableBody(this.props.events)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    } 
}
