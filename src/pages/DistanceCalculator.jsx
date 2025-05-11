import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './DistanceCalculator.css';

// Fix icon issues in Leaflet with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DistanceCalculator = () => {
  const [startPoint, setStartPoint] = useState({ lat: 21.0285, lng: 105.8542, name: 'Hồ Hoàn Kiếm, Hà Nội' });
  const [endPoint, setEndPoint] = useState({ lat: 21.0226, lng: 105.8412, name: 'Văn Miếu Quốc Tử Giám, Hà Nội' });
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [routeInfo, setRouteInfo] = useState([]);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);

  // Khởi tạo map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Fix Leaflet icon issues
      const DefaultIcon = L.icon({
        iconUrl: icon,
        iconRetinaUrl: iconRetina,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      L.Marker.prototype.options.icon = DefaultIcon;

      // Tạo map instance
      const map = L.map(mapRef.current).setView([startPoint.lat, startPoint.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Thêm routing control
      updateRoute();
    }

    return () => {
      if (mapInstanceRef.current) {
        // Xóa routing control trước khi xóa map
        if (routingControlRef.current) {
          try {
            mapInstanceRef.current.removeControl(routingControlRef.current);
          } catch (error) {
            console.error('Error removing routing control:', error);
          }
          routingControlRef.current = null;
        }

        // Sau đó xóa map
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cập nhật route khi có thay đổi điểm đầu hoặc điểm cuối
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateRoute();
    }
  }, [startPoint, endPoint]);

  // Hàm cập nhật route
  const updateRoute = () => {
    const map = mapInstanceRef.current;

    if (!map) return;

    try {
      // Xóa routing control cũ nếu có
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      // Tạo routing control mới
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(startPoint.lat, startPoint.lng),
          L.latLng(endPoint.lat, endPoint.lng)
        ],
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [
            { color: '#6366F1', opacity: 0.8, weight: 6 },
            { color: '#3B82F6', opacity: 0.9, weight: 4 }
          ]
        },
        createMarker: function (i, waypoint, n) {
          const marker = L.marker(waypoint.latLng, {
            draggable: true,
            icon: L.icon({
              iconUrl: icon,
              iconRetinaUrl: iconRetina,
              shadowUrl: iconShadow,
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          });

          return marker;
        }
      }).addTo(map);

      routingControlRef.current = routingControl;

      // Lấy thông tin khoảng cách và thời gian
      routingControl.on('routesfound', (e) => {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const summary = routes[0].summary;

          // Cập nhật khoảng cách và thời gian
          setDistance(summary.totalDistance / 1000); // Chuyển mét sang km
          setDuration(Math.round(summary.totalTime / 60)); // Chuyển giây sang phút

          // Cập nhật thông tin chi tiết các bước đi
          if (routes[0].instructions && Array.isArray(routes[0].instructions)) {
            const instructions = routes[0].instructions.map(instruction => ({
              text: instruction.text,
              distance: instruction.distance,
              time: Math.round(instruction.time / 60) // Chuyển giây sang phút
            }));

            setRouteInfo(instructions);
          }
        }
      });
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  // Hàm tìm kiếm địa điểm
  const searchPlace = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearchResults([]);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();

      const results = data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chọn địa điểm từ kết quả tìm kiếm
  const selectPlace = (place) => {
    if (activeInput === 'start') {
      setStartPoint({
        lat: place.lat,
        lng: place.lng,
        name: place.name
      });
    } else if (activeInput === 'end') {
      setEndPoint({
        lat: place.lat,
        lng: place.lng,
        name: place.name
      });
    }

    setSearchResults([]);
    setSearchQuery('');
    setActiveInput(null);
  };

  // Lấy vị trí hiện tại
  const getCurrentLocation = (target) => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Lấy địa chỉ từ tọa độ
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const placeName = data.display_name || `Vị trí (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;

          if (target === 'start') {
            setStartPoint({
              lat: latitude,
              lng: longitude,
              name: placeName
            });
          } else {
            setEndPoint({
              lat: latitude,
              lng: longitude,
              name: placeName
            });
          }
        } catch (error) {
          console.error('Error getting address:', error);
          const placeName = `Vị trí (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;

          if (target === 'start') {
            setStartPoint({
              lat: latitude,
              lng: longitude,
              name: placeName
            });
          } else {
            setEndPoint({
              lat: latitude,
              lng: longitude,
              name: placeName
            });
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí trong trình duyệt.');
      }
    );
  };

  // Đổi vị trí đầu và cuối
  const swapLocations = () => {
    setStartPoint(endPoint);
    setEndPoint(startPoint);
  };

  // Xử lý nhấn phím Enter khi tìm kiếm
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchPlace();
    }
  };

  return (
    <div className="distance-calculator">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
          Tính Khoảng Cách Giữa Hai Địa Điểm
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="location-inputs p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Chọn Địa Điểm</h2>

            {/* Nhập điểm bắt đầu */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Điểm xuất phát:</label>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery && activeInput === 'start' ? searchQuery : startPoint.name}
                  onClick={() => setActiveInput('start')}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveInput('start');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập địa điểm bắt đầu..."
                  className="flex-1 p-2 border rounded-l"
                />
                <button
                  onClick={() => {
                    if (activeInput === 'start') {
                      searchPlace();
                    } else {
                      setActiveInput('start');
                    }
                  }}
                  className="bg-blue-500 text-white p-2 rounded-r"
                >
                  Tìm
                </button>
                <button
                  onClick={() => getCurrentLocation('start')}
                  className="ml-2 bg-green-500 text-white p-2 rounded"
                  title="Lấy vị trí hiện tại"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Nút đổi vị trí */}
            <div className="flex justify-center my-4">
              <button
                onClick={swapLocations}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                title="Đổi điểm đầu và điểm cuối"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            {/* Nhập điểm kết thúc */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Điểm đến:</label>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery && activeInput === 'end' ? searchQuery : endPoint.name}
                  onClick={() => setActiveInput('end')}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveInput('end');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập địa điểm đến..."
                  className="flex-1 p-2 border rounded-l"
                />
                <button
                  onClick={() => {
                    if (activeInput === 'end') {
                      searchPlace();
                    } else {
                      setActiveInput('end');
                    }
                  }}
                  className="bg-blue-500 text-white p-2 rounded-r"
                >
                  Tìm
                </button>
                <button
                  onClick={() => getCurrentLocation('end')}
                  className="ml-2 bg-green-500 text-white p-2 rounded"
                  title="Lấy vị trí hiện tại"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Kết quả tìm kiếm */}
            {searchResults.length > 0 && (
              <div className="mt-4 border rounded max-h-60 overflow-y-auto">
                <h3 className="p-2 bg-gray-100 font-medium">Kết quả tìm kiếm:</h3>
                <ul>
                  {searchResults.map((result, index) => (
                    <li
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-t"
                      onClick={() => selectPlace(result)}
                    >
                      {result.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hiển thị kết quả khoảng cách */}
            {distance !== null && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">Kết quả:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700">Khoảng cách:</p>
                    <p className="text-2xl font-bold text-indigo-600">{distance.toFixed(2)} km</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Thời gian dự kiến:</p>
                    <p className="text-2xl font-bold text-indigo-600">{duration} phút</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hiển thị bản đồ */}
          <div className="map-container">
            <div ref={mapRef} className="map h-96 rounded-lg shadow-md"></div>

            {/* Hiển thị thông tin chi tiết tuyến đường */}
            {routeInfo.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-md max-h-60 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Chỉ dẫn đường đi:</h3>
                <ul className="space-y-2">
                  {routeInfo.map((step, index) => (
                    <li key={index} className="flex py-2 border-b border-gray-100 last:border-b-0">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800">{step.text}</p>
                        <p className="text-sm text-gray-500">
                          {step.distance > 1000
                            ? `${(step.distance / 1000).toFixed(2)} km`
                            : `${step.distance} m`}
                          {step.time > 0 && ` • ${step.time} phút`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistanceCalculator;