// AgroPi Marketplace — Firebase Yapılandırması
// Firebase Auth KALDIRILDI — kimlik doğrulama Pi Network SDK ile yapılıyor.
// "Component auth has not been registered yet" hatası bu sayede çözüldü.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ Firebase Console > Proje Ayarları > Genel > Web uygulaması değerlerinizi girin
// Şimdilik Firestore/Storage devre dışı; değerleri girince aktif hale gelir.
const firebaseConfig = {
    apiKey: "AIzaSyAJ96on_B1ecgtif0UWRSGeSAPYHsP_-48",
    authDomain: "agropi-dfd49.firebaseapp.com",
    projectId: "agropi-dfd49",
    storageBucket: "agropi-dfd49.firebasestorage.app",
    messagingSenderId: "422933358585",
    appId: "1:422933358585:web:1be4e949f626c02f593f28",
    measurementId: "G-HF8G6FLD9P"
};

// Tekrar başlatma hatasını önle (hot-reload uyumlu)
let app;
try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
    console.warn('[AgroPi] Firebase başlatılamadı, offline modda çalışılıyor:', e.message);
    app = null;
}

// Firestore & Storage (app null ise undefined döner, uygulama çökmez)
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Koleksiyon yolları
export const KoleksiyonYollari = {
    KULLANICILAR: 'kullanicilar',
    UZMANLAR: 'uzmanlar',
    ODEMELER: 'odemeler',
    YORUMLAR: 'yorumlar',
    SERA_KAYITLARI: 'greenhouse_logs',
};

export default app;
