"use client";

import { useState, useEffect } from "react";

export function DashboardPage() {
  const [piUser, setPiUser] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [piSdkReady, setPiSdkReady] = useState(false);

  // Check Pi SDK readiness
  useEffect(() => {
    const checkPiSdk = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        console.log('Pi SDK detected:', window.Pi);
        setPiSdkReady(true);
      } else {
        console.log('Pi SDK not found, retrying...');
        setTimeout(checkPiSdk, 1000);
      }
    };
    
    checkPiSdk();
  }, []);

  // Test Payment Function
  async function testPayment() {
    setIsLoading(true);
    try {
      if (!window.Pi) {
        throw new Error('Pi SDK bulunamadı!');
      }

      console.log('Starting payment with new API key...');
      console.log('Current user:', piUser);
      console.log('Wallet available:', window.Pi.getWallet?.());

      const paymentResult = await window.Pi.createPayment({
        amount: 0.1,
        memo: 'Test payment for AgroPi Smart Farming',
        metadata: {
          productId: 'test-payment-001',
          userId: piUser?.uid || 'anonymous',
          walletAddress: 'GCXUX6I4AOOGDNS4HYDW4YH2KQD7X3M7TZUOG54EKXIWBI7GZNZV3RN5'
        }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('Payment ready for approval:', paymentId);
          setStatusMessage('Ödeme onaylanıyor...');
          
          // API Key ile otomatik onay
          try {
            const response = await fetch('https://api.minepi.com/v2/payments/approve', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ipqhskxaso0wqujzgwgsxrcpfwcjkk1kmgq1xvbptqh6lqpuq1xebsnjzz7v6gud`
              },
              body: JSON.stringify({
                paymentId,
                amount: 0.1,
                memo: 'Test payment for AgroPi Smart Farming'
              })
            });
            
            const result = await response.json();
            console.log('Approval result:', result);
            
            if (result.success) {
              setStatusMessage('Ödeme onaylandı! ✅');
            }
          } catch (error) {
            console.error('Approval error:', error);
            setStatusMessage('Onay hatası: ' + error.message);
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', paymentId, txid);
          setStatusMessage('Ödeme tamamlanıyor...');
          
          // API Key ile otomatik tamamlama
          try {
            const response = await fetch('https://api.minepi.com/v2/payments/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ipqhskxaso0wqujzgwgsxrcpfwcjkk1kmgq1xvbptqh6lqpuq1xebsnjzz7v6gud`
              },
              body: JSON.stringify({
                paymentId,
                txid,
                amount: 0.1
              })
            });
            
            const result = await response.json();
            console.log('Completion result:', result);
            
            if (result.success) {
              setStatusMessage('Ödeme başarıyla tamamlandı! ✅');
            }
          } catch (error) {
            console.error('Completion error:', error);
            setStatusMessage('Tamamlama hatası: ' + error.message);
          }
        },
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          setStatusMessage('Ödeme iptal edildi.');
        },
        onError: (error: any, payment?: any) => {
          console.error('Payment error:', error, payment);
          setStatusMessage('Ödeme hatası: ' + error.message);
        },
        onCompletion: (paymentId: string, txid: string) => {
          console.log('Payment completed:', paymentId, txid);
          setStatusMessage('Ödeme başarıyla tamamlandı! ✅');
        }
      });

      console.log('Payment initiated:', paymentResult);

    } catch (error) {
      console.error('Payment error:', error);
      setStatusMessage('Ödeme hatası: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Connect to Pi Network
  async function connectPi() {
    setIsLoading(true);
    try {
      if (!window.Pi) {
        throw new Error('Pi SDK bulunamadı!');
      }

      console.log('Initializing Pi SDK with sandbox: true...');
      
      // Ensure Pi.init completes before auth
      await window.Pi.init({ 
        version: '2.0', 
        sandbox: true 
      });
      
      console.log('Pi SDK initialized successfully');
      
      const authResult = await window.Pi.authenticate(['username', 'payments'], {
        network: 'testnet'
      });

      console.log('Auth successful:', authResult);
      setPiUser(authResult.user);
      setStatusMessage('Pi Network ile bağlantı kuruldu! ✅');

    } catch (error) {
      console.error('Pi Network bağlantı hatası:', error);
      setStatusMessage('Bağlantı hatası: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AgroPi Dashboard</h1>
      
      {!piUser ? (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <button
            onClick={connectPi}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? 'Connecting...' : 'Connect with Pi'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Connect to Pi Network to access payment features.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Welcome, {piUser.username}!</h2>
            <p className="text-gray-600 mb-4">Test Pi Network payment integration:</p>
            
            <button
              onClick={testPayment}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading ? 'Processing...' : 'Test Payment (0.1 Pi)'}
            </button>
            
            {statusMessage && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{statusMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
