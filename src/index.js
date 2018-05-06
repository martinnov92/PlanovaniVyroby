// import './polyfills';

import moment from 'moment';
import cs from 'moment/locale/cs';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

moment.updateLocale('cs', cs);

// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
// registerServiceWorker();
