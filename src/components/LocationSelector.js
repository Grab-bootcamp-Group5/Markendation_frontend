import React, { useState, useEffect } from 'react';
import { FiMapPin, FiNavigation, FiX } from "react-icons/fi";
import { userService } from '../services/userService'; // Import the userService

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
    const [manualAddress, setManualAddress] = useState('');

    useEffect(() => {
        try {
            const savedLocation = localStorage.getItem('userLocation');
            if (savedLocation) {
                const parsedLocation = JSON.parse(savedLocation);
                if (parsedLocation && parsedLocation.address) {
                    if (!initialLocation ||
                        parsedLocation.latitude !== initialLocation.latitude ||
                        parsedLocation.longitude !== initialLocation.longitude) {
                        setCurrentLocation(parsedLocation);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
        }
    }, [initialLocation]);

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
                console.log("Vị trí hiện tại:", latitude, longitude);

                const location = {
                    latitude,
                    longitude,
                    address: `Vị trí của bạn (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
                };

                setCurrentLocation(location);
                setIsGettingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Không thể lấy vị trí của bạn.';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += ' Vui lòng cho phép truy cập vị trí trong trình duyệt của bạn.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += ' Thông tin vị trí không khả dụng.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += ' Yêu cầu vị trí đã hết thời gian.';
                        break;
                }

                setError(errorMessage);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleManualAddressChange = (e) => {
        setManualAddress(e.target.value);
    };

    const setManualLocation = () => {
        if (!manualAddress.trim()) {
            setError('Vui lòng nhập địa chỉ');
            return;
        }

        setCurrentLocation({
            address: manualAddress,
            latitude: 10.8231,
            longitude: 106.6297
        });

        setManualAddress('');
        setError('');
    };

    const sendLocationToBackend = async (locationData) => {
        try {
            console.log('Sending location to backend:', JSON.stringify(locationData, null, 2));

            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.log('User not logged in, skipping API call');
                return { success: true, message: 'User not logged in' };
            }

            const result = await userService.updateUserLocation(locationData);
            console.log('Location updated successfully:', result);

            return result;

        } catch (error) {
            console.error('Error sending location to backend:', error);
            return { success: false, error: error.message };
        }
    };

    const confirmSelection = async () => {
        try {
            setIsSavingLocation(true);

            console.log("Location being saved:", JSON.stringify(currentLocation, null, 2));

            localStorage.setItem('userLocation', JSON.stringify(currentLocation));
            await sendLocationToBackend(currentLocation);
            if (onLocationChange) {
                onLocationChange(currentLocation);
            }

            const event = new CustomEvent('locationUpdated', { detail: currentLocation });
            window.dispatchEvent(event);
            setShowLocationModal(false);

        } catch (error) {
            console.error('Error saving location:', error);
            setError('Không thể lưu vị trí. Vị trí đã được lưu cục bộ.');
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

            {/* Location Modal - Simplified version without maps */}
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

                        {/* Manual Address Input */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Hoặc nhập địa chỉ thủ công:
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={manualAddress}
                                    onChange={handleManualAddressChange}
                                    placeholder="Nhập địa chỉ của bạn..."
                                    className="flex-1 p-3 border border-gray-300 rounded-l"
                                />
                                <button
                                    onClick={setManualLocation}
                                    className="bg-gray-200 text-gray-700 px-4 rounded-r border border-gray-300 border-l-0"
                                >
                                    Đặt
                                </button>
                            </div>
                        </div>

                        {/* Selected Location */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Vị trí đã chọn:</h3>
                            <div className="flex items-start">
                                <FiMapPin className="mt-1 mr-2 text-orange-500 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-700">{currentLocation.address}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Tọa độ: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                    </p>
                                </div>
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