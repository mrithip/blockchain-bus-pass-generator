import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import axios from 'axios';

function App() {
  const [result, setResult] = useState('');
  const [scanning, setScanning] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning && videoRef.current) {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, [scanning]);

  const startScanner = async () => {
    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
    } catch (error) {
      console.error('Scanner start error:', error);
      setValidationResult({
        valid: false,
        message: '❌ Camera Error',
        reason: 'Unable to access camera: ' + error.message,
        status: 'error'
      });
    }
  };

  const handleScan = async (result) => {
    if (result && !validating) {
      const scannedText = result.data;
      setResult(scannedText);

      // Stop scanning
      if (scannerRef.current) {
        scannerRef.current.stop();
      }

      setScanning(false);
      setValidating(true);

      try {
        // Parse QR data and validate using blockchain
        let qrData;
        try {
          qrData = JSON.parse(scannedText);
        } catch (error) {
          // If not JSON, treat as direct passHash
          qrData = { passHash: scannedText };
        }

        // Use blockchain verification (call backend method directly if needed)
        const validationResponse = await axios.post('http://localhost:5000/api/payments/passes/verify', {
          passHash: qrData.passHash,
          passId: qrData.passId,
          timestamp: new Date().toISOString()
        });

        if (validationResponse.data.success) {
          setValidationResult({
            valid: true,
            message: '✅ Pass is Valid',
            details: validationResponse.data.pass,
            status: 'success'
          });
        } else {
          setValidationResult({
            valid: false,
            message: '❌ Pass is Invalid',
            reason: validationResponse.data.message,
            status: 'error'
          });
        }
      } catch (error) {
        setValidationResult({
          valid: false,
          message: '❌ Validation Error',
          reason: error.response?.data?.message || 'Network error - check backend connection',
          status: 'error'
        });
      } finally {
        setValidating(false);
      }
    }
  };

  const resetScanner = () => {
    setResult('');
    setScanning(true);
    setValidating(false);
    setValidationResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">🚇 Bus Pass Scanner</h1>
            <p className="text-gray-300 text-sm mt-1">Scan QR codes to validate blockchain passes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full space-y-6">

          {/* QR Scanner Section */}
          {scanning && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  📱
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Scan Pass QR Code</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Position the QR code within the camera frame
                </p>
              </div>

              <div className="px-6 pb-6">
                <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none"></div>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Make sure the QR code is well-lit and clearly visible
                </p>
              </div>
            </div>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className={`rounded-2xl shadow-xl p-6 text-center ${
              validationResult.status === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>

              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                validationResult.status === 'success'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {validationResult.status === 'success' ? '✅' : '❌'}
              </div>

              <h3 className={`text-xl font-semibold mb-2 ${
                validationResult.status === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {validationResult.message}
              </h3>

              {validationResult.details ? (
                <div className="bg-white rounded-lg p-4 mt-4 border border-gray-200">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{validationResult.details.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-medium text-gray-900">{validationResult.details.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(validationResult.details.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Block:</span>
                      <span className="font-mono text-gray-900">#{validationResult.details.blockIndex}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  {validationResult.reason}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {validating && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-blue-900">Validating Pass...</h3>
              <p className="text-sm text-blue-700 mt-1">
                Checking pass authenticity on blockchain
              </p>
            </div>
          )}

          {/* Scan Another Button */}
          {!scanning && !validating && (
            <button
              onClick={resetScanner}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9V3m0 0h6m-6 0l7 7m8 4v6m0 0H9m6 0l-7-7M3 9V3m0 0h6m-6 0l7 7m8 4v6m0 0H9m6 0l-7-7" />
              </svg>
              <span>Scan Another Pass</span>
            </button>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <h4 className="font-medium text-gray-900 mb-2">How to Use:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Allow camera access when prompted</li>
              <li>Point camera at the passenger's QR code</li>
              <li>System automatically validates with blockchain</li>
              <li>Verify passenger details and expiry date</li>
              <li>Allow boarding for valid passes only</li>
            </ol>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            Blockchain Bus Pass Scanner - Powered by Decentralized Technology
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
