// AgroPi Marketplace — Pi Auth Service
// Pi.authenticate() sonrası Firestore profil eşleştirme + AsyncStorage persistance
// Pi SDK sandbox modunda başlatılır

import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { piGirisYap } from './PiSDKKoprusu';
import PiSabitleri from './PiSabitleri';

const DEPOLAMA_ANAHTARI = '@agropi_pi_kullanici';

// ──────────────────────────────────────────────────────────────────────
// Pi SDK'yı sandbox modunda başlat (Pi Browser varsa)
// Pi'nin resmi SDK'sı window.Pi olarak inject edilir — init() çağrısı gerekir
// ──────────────────────────────────────────────────────────────────────
export const piSDKBaslat = () => {
    try {
        if (typeof global.Pi !== 'undefined' && typeof global.Pi.init === 'function') {
            global.Pi.init({
                version: '2.0',
                sandbox: PiSabitleri.ORTAM === 'sandbox',
            });
            console.log(`[AgroPi] Pi SDK başlatıldı — Mod: ${PiSabitleri.ORTAM.toUpperCase()}`);
        } else {
            console.log('[AgroPi] Pi SDK bulunamadı → Mock mod aktif');
        }
    } catch (e) {
        console.warn('[AgroPi] Pi SDK başlatma hatası:', e.message);
    }
};

// ──────────────────────────────────────────────────────────────────────
// Firestore profil eşleştirmesi
// 1. 'uzmanlar' koleksiyonunda uid'e göre ara
// 2. Bulunamazsa 'isverenler' koleksiyonunda ara
// 3. Hiçbiri yoksa yeni kayıt oluştur (uzman değil → işveren varsayımı)
// ──────────────────────────────────────────────────────────────────────
const profilEslestir = async (piKullanici) => {
    const { kullaniciId, kullaniciAdi, mockMod } = piKullanici;

    if (!db) {
        console.log('[AgroPi] Firestore offline → yerel profil kullanılıyor');
        return {
            ...piKullanici,
            profilTamamlandi: false,
            profilTipi: 'belirsiz',
        };
    }

    try {
        // Uzman profili ara
        const uzmanRef = doc(db, 'uzmanlar', kullaniciId);
        const uzmanSnap = await getDoc(uzmanRef);

        if (uzmanSnap.exists()) {
            console.log('[AgroPi] Uzman profili bulundu:', kullaniciAdi);
            return {
                ...piKullanici,
                ...uzmanSnap.data(),
                profilTamamlandi: true,
                profilTipi: 'uzman',
            };
        }

        // İşveren profili ara
        const isverenRef = doc(db, 'isverenler', kullaniciId);
        const isverenSnap = await getDoc(isverenRef);

        if (isverenSnap.exists()) {
            console.log('[AgroPi] İşveren profili bulundu:', kullaniciAdi);
            return {
                ...piKullanici,
                ...isverenSnap.data(),
                profilTamamlandi: true,
                profilTipi: 'isveren',
            };
        }

        // Yeni kullanıcı — minimal profil oluştur
        console.log('[AgroPi] Yeni kullanıcı → kayıt oluşturuluyor:', kullaniciAdi);
        const yeniProfil = {
            kullaniciId,
            kullaniciAdi,
            piKullaniciAdi: kullaniciAdi,
            profilTipi: 'belirsiz',     // ProfilTamamlama ekranında belirlenecek
            olusturmaTarihi: serverTimestamp(),
            mockMod,
        };
        await setDoc(doc(db, 'kullanicilar', kullaniciId), yeniProfil);

        return {
            ...piKullanici,
            ...yeniProfil,
            profilTamamlandi: false,
            profilTipi: 'belirsiz',
        };

    } catch (e) {
        console.warn('[AgroPi] Profil eşleştirme hatası:', e.message);
        return { ...piKullanici, profilTamamlandi: false, profilTipi: 'belirsiz' };
    }
};

// ──────────────────────────────────────────────────────────────────────
// Ana giriş akışı
// Pi.authenticate() → profil eşleştir → AsyncStorage'a kaydet
// ──────────────────────────────────────────────────────────────────────
export const piIleGirisYap = async () => {
    // 1. Pi authenticate
    const piKullanici = await piGirisYap();
    console.log('[AgroPi] Pi girişi OK:', piKullanici.kullaniciAdi, '| UID:', piKullanici.kullaniciId);

    // 2. Firestore profil eşleştir
    const tamProfil = await profilEslestir(piKullanici);

    // 3. AsyncStorage'a kaydet
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARI, JSON.stringify(tamProfil));
    console.log('[AgroPi] Kullanıcı AsyncStorage\'a kaydedildi');

    return tamProfil;
};

// ──────────────────────────────────────────────────────────────────────
// Kayıtlı oturumu kontrol et (uygulama açılışında)
// ──────────────────────────────────────────────────────────────────────
export const kaydedilmisOturumAl = async () => {
    try {
        const json = await AsyncStorage.getItem(DEPOLAMA_ANAHTARI);
        if (!json) return null;
        const kullanici = JSON.parse(json);
        console.log('[AgroPi] Kayıtlı oturum bulundu:', kullanici.kullaniciAdi);
        return kullanici;
    } catch (e) {
        console.warn('[AgroPi] Oturum okuma hatası:', e.message);
        return null;
    }
};

// ──────────────────────────────────────────────────────────────────────
// Çıkış yap — AsyncStorage temizle
// ──────────────────────────────────────────────────────────────────────
export const cikisYap = async () => {
    try {
        await AsyncStorage.removeItem(DEPOLAMA_ANAHTARI);
        console.log('[AgroPi] Oturum temizlendi');
    } catch (e) {
        console.warn('[AgroPi] Çıkış hatası:', e.message);
    }
};
