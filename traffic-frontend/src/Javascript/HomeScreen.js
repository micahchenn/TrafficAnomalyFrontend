import React from 'react';
import { Link } from 'react-router-dom';
import '../Css/HomeScreen.css';

const HomeScreen = () => {
  return (
    <div className="arcadis-home-screen">
      <header className="arcadis-header">
        <div className="arcadis-logo-title">

          <h1>Arcadis Traffic App</h1>
        </div>
        <div className="arcadis-products">
          <a href="#about-us" className="arcadis-hover-element">About Us</a>
          <a href="#features" className="arcadis-hover-element">Features</a>
          <a href="#contact" className="arcadis-hover-element">Contact</a>
        </div>
      </header>
      <div className="arcadis-home-screen-content">
        <p className="arcadis-home-screen-description">
          Welcome to the Arcadis Traffic App. Choose an option below to view traffic segment flow maps or traffic raster views.
        </p>
        <div className="arcadis-home-screen-buttons">
          <Link to="/traffic-flow-segments" className="arcadis-home-screen-button">
            Traffic Segment Flow Map
          </Link>
          <Link to="/traffic-raster-view" className="arcadis-home-screen-button">
            Traffic Raster View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
