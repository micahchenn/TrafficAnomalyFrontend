import React, { useState } from 'react';
import api from '../api'; // Assuming api.js is configured for axios requests

function TrafficAnomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const response = await api.post('traffic/', {
        point: '29.72852,-95.4686'  // Example point
      });
      setAnomalies(response.data.anomalies);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch anomalies:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Traffic Anomalies</h1>
      <button onClick={fetchAnomalies}>Fetch Anomalies</button>
      {loading && <p>Loading...</p>}
      <div>
        {anomalies.length > 0 ? (
          anomalies.map((anomaly, index) => (
            <div key={index}>
              <p>Current Speed: {anomaly.currentSpeed}</p>
              <p>Threshold: {anomaly.threshold}</p>
              <p>Confidence: {anomaly.confidence}</p>
              <p>Road Closure: {anomaly.roadClosure ? 'Yes' : 'No'}</p>
              <p>Coordinates:</p>
              <ul>
                {anomaly.location.map((coord, idx) => (
                  <li key={idx}>{coord.latitude}, {coord.longitude}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No anomalies detected.</p>
        )}
      </div>
    </div>
  );
}

export default TrafficAnomalies;
