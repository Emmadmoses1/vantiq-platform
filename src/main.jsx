import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

window.addEventListener('error', (e) => {
  alert('APP CRASH: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  alert('UNHANDLED PROMISE: ' + (e.reason?.message || JSON.stringify(e.reason)));
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);