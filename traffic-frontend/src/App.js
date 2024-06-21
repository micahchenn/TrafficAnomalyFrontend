import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import WelcomePage from './Javascript/WelcomePage';
import TrafficFlowSegments from './Javascript/TrafficFlowSegments';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/traffic-flow-segments" element={<TrafficFlowSegments />} />
          <Route path="/" element={
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;