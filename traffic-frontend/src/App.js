import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import WelcomePage from './Javascript/WelcomePage';
import TrafficFlowSegments from './Javascript/TrafficFlowSegments';
import HomeScreen
 from './Javascript/HomeScreen';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/traffic-raster-view" element={<WelcomePage />} />
          <Route path="/traffic-flow-segments" element={<TrafficFlowSegments />} />
          <Route path="/" element={<HomeScreen />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;