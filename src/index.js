import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import cs from 'moment/locale/cs';
import App from './App';

import './index.css';
moment.updateLocale('cs', cs);

// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
// registerServiceWorker();
