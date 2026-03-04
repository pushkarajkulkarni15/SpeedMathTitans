import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// StrictMode intentionally omitted — it causes double-mount issues with game timers
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
