"use client";
import { useEffect } from "react";
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    const initPi = async () => {
      if (window.Pi) {
        await window.Pi.init({ version: '2.0', sandbox: true });
      }
    };
    initPi();
  }, []);

  const startPayment = async () => {
    try {
      const payment = await window.Pi.createPayment({
        amount: 0.1,
        memo: "AgroPi Final Test",
        metadata: { orderId: "final-10" }
      }, {
        onReadyForServerApproval: (paymentId) => {
          return fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': 'Key ipqhskxaso0wqujzgwgsxrcpfwcjkk1kmgq1xvbptqh6lqpuq1xebsnjzz7v6gud' }
          });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          return fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': 'Key ipqhskxaso0wqujzgwgsxrcpfwcjkk1kmgq1xvbptqh6lqpuq1xebsnjzz7v6gud' },
            body: JSON.stringify({ txid })
          });
        },
        onCancel: (paymentId) => console.log("Iptal"),
        onError: (error, payment) => alert("Hata: " + error.message)
      });
    } catch (e) { alert(e); }
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
      <h1 style={{ marginBottom: '20px' }}>AgroPi 10. Madde Onay Sayfası</h1>
      <button 
        onClick={startPayment}
        style={{ backgroundColor: '#4CAF50', color: 'white', padding: '20px 40px', fontSize: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
      >
        PI ILE ODEME YAP (0.1 PI)
      </button>
    </div>
  );
}
