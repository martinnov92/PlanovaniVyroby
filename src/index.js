import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import cs from 'moment/locale/cs';

import App from './App';

// styles
import './css/vars.css';
import './css/index.css';

moment.updateLocale('cs', cs);

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
