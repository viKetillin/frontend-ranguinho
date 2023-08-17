import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './routes';

// css imports
// import 'bootstrap/dist/css/bootstrap.min.css';
import './css/tailwind.css';
import './css/index.css';
import "aos/dist/aos.css";

const root = ReactDOM.createRoot(
  document.getElementById('App') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
