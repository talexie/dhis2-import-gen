import React from 'react';
import './App.css';
import { Provider } from '@dhis2/app-runtime'
//import i18n from '@dhis2/d2-i18n';
import { Routes } from './Routes';
import { HashRouter as Router } from 'react-router-dom';
const isProd = process.env.NODE_ENV === 'production';
const baseUrl = isProd
    ?'../../..'
    :process.env.REACT_APP_DHIS2_BASE_URL;
//const authorization = process.env.REACT_APP_DHIS2_AUTHORIZATION;

const appConfig = {
  baseUrl: baseUrl,
  apiVersion: 36,
}

const App = () => (
  <Provider config={appConfig}>
    <div className="container">
      <Router>
        <Routes/>
      </Router>        
    </div>
  </Provider>
)

export default App;
