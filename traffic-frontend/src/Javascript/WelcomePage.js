import React, { useState, useEffect, useCallback } from 'react';
import '../Css/WelcomePage.css';

function WelcomePage() {
  const [apiKey] = useState('YHxmvVqqSDKO2zRHV0JQZGrAHkKlZxSU'); // Replace with your actual TomTom API key

  const getStyle = useCallback((state) => {
    const getTilesForEndpoint = (endpoint) => {
      return ['a', 'b', 'c', 'd'].map((hostname) => {
        return endpoint.replace('{cyclingHostname}', hostname);
      });
    };

    const mapEndpoint = `https://{cyclingHostname}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?tileSize=512&key=${apiKey}`;
    const trafficEndpoint = `https://{cyclingHostname}.api.tomtom.com/traffic/map/4/tile/flow/${state.style}/{z}/{x}/{y}.png?tileSize=512&key=${apiKey}`;
    const labelsEndpoint = `https://{cyclingHostname}.api.tomtom.com/map/1/tile/labels/main/{z}/{x}/{y}.png?tileSize=512&key=${apiKey}`;

    return {
      version: 8,
      sources: {
        'raster-tiles-map': {
          type: 'raster',
          tiles: getTilesForEndpoint(mapEndpoint),
          tileSize: 256
        },
        'raster-tiles-traffic': {
          type: 'raster',
          tiles: getTilesForEndpoint(trafficEndpoint),
          tileSize: 256
        },
        'raster-tiles-labels': {
          type: 'raster',
          tiles: getTilesForEndpoint(labelsEndpoint),
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'raster-layer-map',
          type: 'raster',
          source: 'raster-tiles-map'
        },
        {
          id: 'raster-layer-traffic',
          type: 'raster',
          source: 'raster-tiles-traffic'
        },
        {
          id: 'raster-layer-labels',
          type: 'raster',
          source: 'raster-tiles-labels'
        }
      ]
    };
  }, [apiKey]);

  const initMap = useCallback(() => {
    const state = {
      style: 'relative0'
    };

    const map = window.tt.map({
      key: apiKey,
      container: 'map',
      style: getStyle(state),
      center: [2.340822, 48.855462],
      zoom: 10,
      dragPan: !isMobileOrTablet()
    });

    map.addControl(new window.tt.FullscreenControl());
    map.addControl(new window.tt.NavigationControl());

    return map;
  }, [apiKey, getStyle]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.1/maps/maps-web.min.js';
    script.onload = () => {
      if (window.tt) {
        initMap();
      }
    };
    document.head.appendChild(script);
  }, [initMap]);

  const isMobileOrTablet = () => {
    return /Mobi|Tablet|iPad|iPhone/.test(navigator.userAgent);
  };

  return (
    <div className="App">
      <h1>Traffic Anomalies</h1>
      <div id="map"></div>
    </div>
  );
}

export default WelcomePage;
