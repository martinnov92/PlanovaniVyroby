import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            info: '',
            hasError: false
        };
    }

    componentDidCatch(error, info) {
        this.setState({
            info: info,
            hasError: true,
        });
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
