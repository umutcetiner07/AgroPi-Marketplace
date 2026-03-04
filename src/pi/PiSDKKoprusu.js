// AgroPi Marketplace — Pi SDK Köprüsü
// AgroPi-v2 reposundaki Pi.authenticate() ve Pi.createPayment() akışlarını
// React Native ortamına uyarlayan servis katmanı.
//
// Referans: github.com/umutcetiner07/AgroPi-v2
// - Sandbox / production ortam seçimi
// - Pi Browser dışında mock mod (geliştirme kolaylığı)

import { Platform } from 'react-native';
import PiSabitleri from './PiSabitleri';

// ─────────────────────────────────────────
// Mock Pi SDK (Pi Browser dışı geliştirme)
// AgroPi-v2'deki localhost mock mantığının React Native karşılığı
// ─────────────────────────────────────────
const MockPiSDK = {
    // Sahte kullanıcı verisi döner
    authenticate: (izinler, onSuccess, onError) => {
        console.log('[AgroPi Mock SDK] authenticate() çağrıldı');
        setTimeout(() => {
            onSuccess({
                accessToken: 'mock_token_agropi_dev_12345',
                user: {
                    uid: 'mock_uid_001',
                    username: 'agropi_test_kullanici',
                },
            });
        }, 1200);
    },

    // Sahte ödeme akışı
    createPayment: (odemeVerisi, geriCagrimlar) => {
        console.log('[AgroPi Mock SDK] createPayment() çağrıldı:', odemeVerisi);
        setTimeout(() => {
            geriCagrimlar.onReadyForServerApproval('mock_odeme_id_001');
        }, 800);
        setTimeout(() => {
            geriCagrimlar.onReadyForServerCompletion('mock_odeme_id_001', 'mock_txid_001');
        }, 2000);
    },

    openShareDialog: (baslik, aciklama, url) => {
        console.log('[AgroPi Mock SDK] openShareDialog():', baslik);
    },
};

// ─────────────────────────────────────────
// Pi Browser tespiti
// AgroPi-v2'deki navigatör kontrolünün React Native versiyonu
// ─────────────────────────────────────────
export const piBrowserMi = () => {
    // React Native'de global Pi nesnesi Pi Browser'da inject edilir
    return typeof global.Pi !== 'undefined';
};

// Aktif SDK'yı al (gerçek veya mock)
export const piSDKAl = () => {
    if (piBrowserMi()) {
        return global.Pi;
    }
    console.warn('[AgroPi] Pi Browser tespit edilemedi → Mock mod aktif');
    return MockPiSDK;
};

// ─────────────────────────────────────────
// Pi ile Giriş Yap
// AgroPi-v2: Pi.authenticate(scopes, onSuccess, onError)
// ─────────────────────────────────────────
export const piGirisYap = () => {
    return new Promise((resolve, reject) => {
        const sdk = piSDKAl();

        const basarili = (auth) => {
            console.log('[AgroPi] Pi girişi başarılı:', auth.user.username);
            resolve({
                kullaniciAdi: auth.user.username,
                kullaniciId: auth.user.uid,
                erisimToken: auth.accessToken,
                mockMod: !piBrowserMi(),
            });
        };

        const basarisiz = (hata) => {
            console.error('[AgroPi] Pi giriş hatası:', hata);
            reject(new Error('Pi girişi başarısız: ' + (hata?.message || 'Bilinmeyen hata')));
        };

        try {
            sdk.authenticate(PiSabitleri.IZINLER, basarili, basarisiz);
        } catch (hata) {
            reject(hata);
        }
    });
};

// ─────────────────────────────────────────
// Pi ile Ödeme Başlat
// AgroPi-v2: Pi.createPayment(paymentData, callbacks)
// ─────────────────────────────────────────
export const odemeBaslat = ({
    miktar,
    aciklama,
    aliciKullaniciId,
    uygMetaVeri = {},
}) => {
    return new Promise((resolve, reject) => {
        const sdk = piSDKAl();

        // Ödeme verisi (AgroPi-v2 formatıyla uyumlu)
        const odemeVerisi = {
            amount: miktar,
            memo: aciklama,
            metadata: {
                alici: aliciKullaniciId,
                platform: 'AgroPi-Marketplace',
                ortam: PiSabitleri.ORTAM,
                ...uygMetaVeri,
            },
        };

        // Geri çağrım fonksiyonları
        const geriCagrimlar = {
            // Backend'e ödemeyi onayla
            onReadyForServerApproval: (odemeId) => {
                console.log('[AgroPi] Sunucu onayı bekleniyor. Ödeme ID:', odemeId);
                resolve({ durum: 'onay_bekleniyor', odemeId });
            },

            // Backend'e ödemeyi tamamla
            onReadyForServerCompletion: (odemeId, txId) => {
                console.log('[AgroPi] Ödeme tamamlandı. TX:', txId);
                resolve({ durum: 'tamamlandi', odemeId, txId });
            },

            // Kullanıcı iptali
            onCancel: (odemeId) => {
                console.log('[AgroPi] Ödeme iptal edildi:', odemeId);
                reject({ iptal: true, odemeId });
            },

            // Hata
            onError: (hata, odeme) => {
                console.error('[AgroPi] Ödeme hatası:', hata);
                reject({ hata, odeme });
            },
        };

        try {
            sdk.createPayment(odemeVerisi, geriCagrimlar);
        } catch (hata) {
            reject(hata);
        }
    });
};

// ─────────────────────────────────────────
// Mevcut kullanıcıyı getir (cache'den)
// ─────────────────────────────────────────
export const mevcutPiKullanicisiniAl = () => {
    if (!piBrowserMi()) {
        return { uid: 'mock_uid_001', username: 'agropi_test', mockMod: true };
    }
    return null;
};
