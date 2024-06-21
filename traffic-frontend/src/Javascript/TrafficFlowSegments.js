import React, { useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import * as ttServices from '@tomtom-international/web-sdk-services';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

const TrafficFlowSegments = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const initMapCenter = [4.889516830444336, 52.37297919217682];
    const maxZoomLevel = 18;

    const state = { style: 'relative0' };

    const isMobileOrTablet = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const formatters = {
      convertToSpeedFormat: (speed, unit) => `${speed}${unit}`,
      formatToDurationTimeString: (time) => `${time} mins`
    };

    const roadType = {
      'FRC0': 'Motorway, freeway or other major road',
      'FRC1': 'Major road, less important than a motorway',
      'FRC2': 'Other major road',
      'FRC3': 'Secondary road',
      'FRC4': 'Local connecting road',
      'FRC5': 'Local road of high importance',
      'FRC6': 'Local road',
      'FRC7': 'Local road of minor importance',
      'FRC8': 'Other road'
    };

    const units = {
      'KMPH': ' km/h',
      'MPH': ' mph'
    };

    const map = tt.map({
      key: 'YHxmvVqqSDKO2zRHV0JQZGrAHkKlZxSU',
      center: initMapCenter,
      container: mapRef.current,
      minZoom: 5,
      maxZoom: maxZoomLevel,
      style: getCurrentStyleUrl(state),
      stylesVisibility: { trafficFlow: true },
      zoom: 15,
      dragPan: !isMobileOrTablet(),
    });

    let errorHint = { setMessage: (msg) => console.error(msg), hide: () => console.log('Hide error') };
    let isPositionIncorrect;
    let popupElement = null;
    let popupPosition = initMapCenter;
    let trafficFlowPosition;
    let unitValue = 'KMPH';

    map.addControl(new tt.FullscreenControl());
    map.addControl(new tt.NavigationControl());
    map.on('load', handleMapLoad);
    map.on('click', handleTrafficFlowSegmentsRequest);
    map.on('zoomend', handleTrafficFlowSegmentsRequest);

    function addLayer(routeJson) {
      map.addLayer({
        id: 'flow',
        type: 'line',
        source: {
          type: 'geojson',
          data: routeJson,
        },
        layout: {
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#5A00FF',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 15,
            15, 10,
          ],
        },
      });
    }

    function cleanMapData() {
      if (!map.getLayer('flow')) {
        return;
      }
      if (popupElement) {
        popupElement.remove();
      }
      map.removeLayer('flow');
      map.removeSource('flow');
    }

    function convertToLineGeoJson(points) {
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: points.map((point) => [point.lng, point.lat]),
        },
      };
    }

    function createOptimalPopupPosition(coordinates) {
      let length = coordinates.length;
      let pin;
      for (let i = 0; i < length; i++) {
        if (!pin || coordinates[i].lat > pin.lat) {
          pin = {
            lat: coordinates[i].lat,
            lng: coordinates[i].lng,
          };
        }
      }
      return pin;
    }

    function generatePopupContent(flowSegmentData) {
      return flowSegmentData.roadClosure
        ? '<div><div class="pop-up-result-header">Road Closed</div></div>'
        : '<div>' +
            '<div class="pop-up-result-header">' + roadType[flowSegmentData.frc] + '</div>' +
            '<div class="pop-up-result-title">Average speed:</div>' +
            '<div class="pop-up-result-traffic -important">with traffic: ' +
              formatters.convertToSpeedFormat(flowSegmentData.currentSpeed, units[unitValue]) +
            '</div>' +
            '<div class="pop-up-result-traffic">w/o traffic: ' +
              formatters.convertToSpeedFormat(flowSegmentData.freeFlowSpeed, units[unitValue]) +
            '</div>' +
            '<div class="pop-up-result-title">Travel time:</div>' +
            '<div class="pop-up-result-traffic -important">with traffic: ' +
              formatters.formatToDurationTimeString(flowSegmentData.currentTravelTime) +
            '</div>' +
            '<div class="pop-up-result-traffic">w/o traffic: ' +
              formatters.formatToDurationTimeString(flowSegmentData.freeFlowTravelTime) +
            '</div>' +
          '</div>';
    }

    function handleTrafficFlowSegmentsRequest(event) {
      if (shouldRequestBeAborted(event)) {
        return;
      }
      if (event && event.lngLat) {
        popupPosition = event.lngLat;
        trafficFlowPosition = event.lngLat;
      }
      if (popupElement) {
        popupElement.remove();
      }
      isPositionIncorrect = false;
      performTrafficFlowSegmentsData()
        .then(function (response) {
          let flowSegmentData = response.flowSegmentData;
          let coordinates = flowSegmentData.coordinates.coordinate;
          let popupContent = generatePopupContent(flowSegmentData);
          let routeJson = convertToLineGeoJson(coordinates);
          errorHint.hide();
          cleanMapData();
          addLayer(routeJson);
          popupPosition = createOptimalPopupPosition(coordinates);
          map.panTo(popupPosition);
          popupElement = showPopup(popupContent);
        })
        .catch(function (error) {
          if (!error || !error.data) {
            return;
          }
          isPositionIncorrect = true;
          cleanMapData();
          errorHint.setMessage(error.data.error);
        });
    }

    function handleMapLoad() {
      const unitElements = document.querySelectorAll('input[name=unit]');
      if (unitElements.length > 0) {
        unitElements.forEach(function (unit) {
          unit.addEventListener('click', handleUnitChange);
        });
      }
      popupElement = showPopup('Click somewhere on the road to get information about traffic flow data.');
    }

    function handleUnitChange(event) {
      unitValue = event.target.id;
      handleTrafficFlowSegmentsRequest();
    }

    async function performTrafficFlowSegmentsData() {
      if (popupPosition === initMapCenter) {
        return Promise.reject();
      }
      const callParameters = {
        key: 'YHxmvVqqSDKO2zRHV0JQZGrAHkKlZxSU',
        point: trafficFlowPosition,
        style: document.getElementById('trafficStyle')?.value || 'relative0',
        unit: unitValue,
        zoom: Math.floor(map.getZoom()),
      };
      return ttServices.services.trafficFlowSegmentData(callParameters);
    }

    function getCurrentStyleUrl(state) {
      return `https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&traffic_flow=flow_${state.style}&poi=poi_main&key=YHxmvVqqSDKO2zRHV0JQZGrAHkKlZxSU`;
    }

    function shouldRequestBeAborted(event) {
      if (!event && popupPosition !== initMapCenter) {
        return false;
      }
      if ((!event || event.type !== 'click') && popupPosition === initMapCenter) {
        return true;
      }
      if (event && event.type !== 'click' && map.getZoom() === maxZoomLevel) {
        return true;
      }
      return event && event.type !== 'click' && isPositionIncorrect;
    }

    function showPopup(text) {
      return new tt.Popup()
        .setLngLat(popupPosition)
        .setHTML('<div class="tt-pop-up-container">' +
          '<div class="pop-up-content">' +
          text +
          '</div>' +
          '</div>')
        .addTo(map);
    }
  }, []);

  return <div id="map" ref={mapRef} style={{ height: '100%', width: '100%' }}></div>;
};

export default TrafficFlowSegments;
