import React from 'react';
import './App.css';
import { Provider } from '@dhis2/app-runtime';
import { Routes } from './Routes';
import { HashRouter as Router } from 'react-router-dom';
/*import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
*/
const isProd = process.env.NODE_ENV === 'production';
const baseUrl = isProd
    ?'../../..'
    :process.env.REACT_APP_DHIS2_BASE_URL;

const appConfig = {
  baseUrl: baseUrl,
  apiVersion: 36,
}


// Define a default query function that will receive the query key
/*export const defaultQueryFn = async ({ queryKey }) => {
  const data = await fetch(
    `${baseUrl}${queryKey[0]}`,
  )
  if(! data.ok){
    console.log("Network failed");
    return "Failed";
  }
  return data.json();
}*/

// Create Query Client with provide the default query function to your app with defaultOptions
/*const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
})*/
//const queryClient = new QueryClient();

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
