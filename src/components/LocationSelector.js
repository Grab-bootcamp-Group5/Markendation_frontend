import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiNavigation, FiX } from "react-icons/fi";
import { userService } from '../services/userService';

const LocationSelector = ({ onLocationChange, initialLocation }) => {
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(initialLocation || {
        address: 'Regent Street, A4, A4201, London',
        latitude: 51.5093,
        longitude: -0.1367
    });
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isSavingLocation, setIsSavingLocation] = useState(false);
    const [error, setError] = useState('');
    const [map, setMap] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const mapRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (showLocationModal && window.google && !map) {
            initMap();
        }
    }, [showLocationModal]);

    // Load Google Maps API
    useEffect(() => {
        const existingScript = document.getElementById('google-maps-script');
        if (!window.google && !existingScript) {
            const googleMapScript = document.createElement('script');
            googleMapScript.id = 'google-maps-script';
            googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`;
            googleMapScript.async = true;
            googleMapScript.defer = true;
            googleMapScript.onload = () => {
                if (showLocationModal) {
                    initMap();
                }
            };
            document.body.appendChild(googleMapScript);
        } else if (window.google && showLocationModal && !map) {
            initMap();
        }

        return () => { };
    }, [showLocationModal]);

    const initMap = () => {
        if (!mapRef.current || !window.google) {
            console.log('Map reference or Google API not available');
            return;
        }

        // Initialize the map
        const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: {
                lat: currentLocation.latitude || 21.0285,
                lng: currentLocation.longitude || 105.8542
            },
            zoom: 14,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        // Create marker for selected location
        const marker = new window.google.maps.Marker({
            position: {
                lat: currentLocation.latitude || 21.0285,
                lng: currentLocation.longitude || 105.8542
            },
            map: mapInstance,
            draggable: true,
            animation: window.google.maps.Animation.DROP
        });

        window.google.maps.event.addListener(marker, 'dragend', () => {
            const position = marker.getPosition();
            const newLocation = {
                latitude: position.lat(),
                longitude: position.lng(),
                address: 'Loading address...'
            };

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: position }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    newLocation.address = results[0].formatted_address;
                    setCurrentLocation(newLocation);
                }
            });
        });

        // Initialize Places Autocomplete
        if (inputRef.current) {
            const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current);
            autocompleteInstance.setFields(['address_components', 'formatted_address', 'geometry', 'name']);

            autocompleteInstance.addListener('place_changed', () => {
                const place = autocompleteInstance.getPlace();

                if (!place.geometry) {
                    setError('Không tìm thấy thông tin cho địa điểm này');
                    return;
                }

                // Update marker and map
                marker.setPosition(place.geometry.location);
                mapInstance.setCenter(place.geometry.location);

                // Update location state
                const newLocation = {
                    address: place.formatted_address,
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                };

                setCurrentLocation(newLocation);
            });

            setAutocomplete(autocompleteInstance);
        }

        setMap(mapInstance);
    };

    // Get current location using browser geolocation API
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Trình duyệt của bạn không hỗ trợ định vị.');
            return;
        }

        setIsGettingLocation(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                const location = {
                    latitude,
                    longitude,
                    address: 'Loading address...'
                };

                if (map && window.google) {
                    const latLng = new window.google.maps.LatLng(latitude, longitude);

                    map.setCenter(latLng);

                    map.markers?.forEach(marker => {
                        marker.setPosition(latLng);
                    });

                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            location.address = results[0].formatted_address;
                            setCurrentLocation(location);
                        } else {
                            location.address = 'Vị trí hiện tại của bạn';
                            setCurrentLocation(location);
                        }
                    });
                } else {
                    location.address = 'Vị trí hiện tại của bạn';
                    setCurrentLocation(location);
                }

                setIsGettingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setError('Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí.');
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const confirmSelection = async () => {
        try {
            setIsSavingLocation(true);
            setError('');

            const locationData = {
                address: currentLocation.address,
                longitude: currentLocation.longitude,
                latitude: currentLocation.latitude
            };

            const result = await userService.updateUserLocation(locationData);

            onLocationChange(result.location || currentLocation);

            setShowLocationModal(false);
        } catch (error) {
            console.error('Failed to update location:', error);
            setError(error.response?.data?.message || 'Không thể cập nhật vị trí. Vui lòng thử lại sau.');
        } finally {
            setIsSavingLocation(false);
        }
    };

    return (
        <>
            {/* Location Button in Header */}
            <div className="flex items-center">
                <FiMapPin className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-700 mr-3 truncate max-w-xs">
                    {currentLocation.address}
                </span>
                <button
                    className="text-orange-500 font-medium"
                    onClick={() => setShowLocationModal(true)}
                >
                    Đổi vị trí
                </button>
            </div>

            {/* Location Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Chọn vị trí của bạn</h2>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {/* Search Box */}
                        <div className="relative mb-4">
                            <div className="flex">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Nhập địa chỉ hoặc tên địa điểm..."
                                    className="w-full p-3 border border-gray-300 rounded"
                                />
                            </div>
                        </div>

                        {/* Current Location Button */}
                        <button
                            className="w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded mb-4 hover:bg-blue-700 transition-colors"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                        >
                            {isGettingLocation ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang lấy vị trí...
                                </span>
                            ) : (
                                <>
                                    <FiNavigation className="mr-2" /> Dùng vị trí hiện tại
                                </>
                            )}
                        </button>

                        {/* Map Container */}
                        <div
                            ref={mapRef}
                            className="w-full h-64 rounded-lg border border-gray-300 bg-gray-100 mb-4"
                        >
                            {!window.google && <div className="h-full flex items-center justify-center">Đang tải bản đồ...</div>}
                        </div>

                        {/* Selected Location */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-1">Vị trí đã chọn:</h3>
                            <div className="flex items-start">
                                <FiMapPin className="mt-1 mr-2 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-700">{currentLocation.address}</span>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={confirmSelection}
                            disabled={isSavingLocation}
                            className={`w-full bg-green-600 text-white font-medium p-3 rounded hover:bg-green-700 transition-colors ${isSavingLocation ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSavingLocation ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang lưu vị trí...
                                </span>
                            ) : (
                                'Xác nhận vị trí này'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default LocationSelector;