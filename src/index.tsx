import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'antd/dist/antd.css';
import './A4.css'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd';
import thTH from 'antd/lib/locale/th_TH';
import moment from 'moment';
import 'moment/locale/th';
moment.locale('th');

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={thTH}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
