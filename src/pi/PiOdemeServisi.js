// AgroPi Marketplace — Pi Ödeme Servisi
// Testnet (sandbox) üzerinde Pi.createPayment() akışı
// onReadyForServerApproval → Firestore 'onayBekleniyor'
// onReadyForServerCompletion → Firestore 'odendi'

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { piSDKAl } from './PiSDKKoprusu';
import PiSabitleri from './PiSabitleri';

// ──────────────────────────────────────────────────────────────────────
// Firestore iş ilanı durumunu güncelle
// ──────────────────────────────────────────────────────────────────────
const ilanDurumGuncelle = async (ilanId, yeniDurum, ekBilgi = {}) => {
    if (!db || !ilanId) return;
    try {
        await updateDoc(doc(db, 'jobs', ilanId), {
            durum: yeniDurum,
            ...ekBilgi,
            guncellenmeTarihi: serverTimestamp(),
        });
        console.log(`[AgroPi Ödeme] İlan ${ilanId} → ${yeniDurum}`);
    } catch (e) {
        console.warn('[AgroPi Ödeme] Firestore güncelleme hatası:', e.message);
    }
};

// ──────────────────────────────────────────────────────────────────────
// Ana ödeme fonksiyonu
// miktar  : Pi miktarı (testnet için simgesel 1 Pi)
// memo    : Kullanıcıya gösterilecek açıklama
// ilanId  : Ödemeyle ilişkili iş ilanı ID'si
// isverenId / uzmanId : taraflar
// ──────────────────────────────────────────────────────────────────────
export const odemeBaslat = ({
    miktar = 1,                   // Testnet: 1 Pi
    memo = 'AgroPi Danışmanlık Ücreti',
    ilanId,
    isverenId = 'demo_isveren_001',
    uzmanId = 'demo_uzman_001',
    basariliCallback,
    basarisizCallback,
}) => {
    return new Promise((resolve, reject) => {
        const sdk = piSDKAl();

        const odemeVerisi = {
            amount: miktar,
            memo: memo,
            metadata: {
                ilanId,
                isverenId,
                uzmanId,
                platform: 'AgroPi-Marketplace',
                ortam: PiSabitleri.ORTAM,   // 'sandbox'
                testnet: PiSabitleri.ORTAM === 'sandbox',
            },
        };

        console.log('[AgroPi Ödeme] Başlatılıyor:', odemeVerisi);

        const geriCagrimlar = {
            // ── Adım 1: Backend onayı gerekiyor ──────────────────────
            onReadyForServerApproval: async (paymentId) => {
                console.log('[AgroPi Ödeme] Sunucu onayı bekleniyor. ID:', paymentId);

                await ilanDurumGuncelle(ilanId, 'onayBekleniyor', {
                    odemeId: paymentId,
                    odemeMiktar: miktar,
                });

                basariliCallback?.('onay', paymentId);

                // Gerçek backend'e POST /payments/approve gönderilir
                // Sandbox: backend yoksa Pi onayı otomatik ilerler
                console.log('[AgroPi Ödeme] POST /payments/approve →', PiSabitleri.BACKEND_URL);
                // fetch(`${PiSabitleri.BACKEND_URL}/payments/approve`, { method:'POST', body: JSON.stringify({paymentId}) })

                resolve({ durum: 'onayBekleniyor', odemeId: paymentId });
            },

            // ── Adım 2: İşlem tamamlandı ─────────────────────────────
            onReadyForServerCompletion: async (paymentId, txid) => {
                console.log('[AgroPi Ödeme] Tamamlandı! TX Hash:', txid);

                await ilanDurumGuncelle(ilanId, 'odendi', {
                    odemeId: paymentId,
                    txHash: txid,
                    odendiAt: serverTimestamp(),
                });

                basariliCallback?.('tamamlandi', paymentId, txid);
                resolve({ durum: 'tamamlandi', odemeId: paymentId, txid });
            },

            // ── İptal ────────────────────────────────────────────────
            onCancel: async (paymentId) => {
                console.log('[AgroPi Ödeme] İptal edildi:', paymentId);
                await ilanDurumGuncelle(ilanId, 'iptalEdildi', { odemeId: paymentId });
                basarisizCallback?.('iptal');
                reject({ durum: 'iptal', paymentId });
            },

            // ── Hata ─────────────────────────────────────────────────
            onError: (error, payment) => {
                console.error('[AgroPi Ödeme] Hata:', error);
                basarisizCallback?.('hata', error);
                reject({ durum: 'hata', error, payment });
            },
        };

        try {
            sdk.createPayment(odemeVerisi, geriCagrimlar);
        } catch (e) {
            console.error('[AgroPi Ödeme] createPayment çağrısı başarısız:', e);
            reject(e);
        }
    });
};

// ──────────────────────────────────────────────────────────────────────
// Testnet ödeme özeti oluştur (UI'da göstermek için)
// ──────────────────────────────────────────────────────────────────────
export const odemeOzetiOlustur = ({ ilanBaslik, uzmanAd, miktar = 1 }) => ({
    miktar,
    para: 'π Pi (Testnet)',
    memo: `AgroPi: ${ilanBaslik} — ${uzmanAd}`,
    not: PiSabitleri.ORTAM === 'sandbox'
        ? '🔧 Sandbox modu — gerçek Pi transferi yapılmaz'
        : '🟢 Production — gerçek Pi transferi',
});
