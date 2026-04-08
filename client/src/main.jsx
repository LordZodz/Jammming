import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './index.css';

/**
 * This is the main entry point of the React application.
 * It imports the required modules and renders the App component inside a StrictMode wrapper.
 * 
 * The StrictMode is a tool for highlighting potential problems in an application. It activates additional checks and warnings for its descendants.
 * The createRoot function is used to create a root for the React application, and the render method is called to render the App component into the DOM element with the id 'root'.
 */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);