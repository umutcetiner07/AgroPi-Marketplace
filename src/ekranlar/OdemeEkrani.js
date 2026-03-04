// AgroPi Marketplace — Ödeme Ekranı
// İşveren, uzmanın hizmetini onaylar → Pi.createPayment() akışı başlar

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    StatusBar, Alert, ActivityIndicator, Animated,
} from 'react-native';
import { odemeBaslat, odemeOzetiOlustur } from '../pi/PiOdemeServisi';
import Renkler from '../tema/renkler';

const DURUM_RENK = {
    hazir: Renkler.piAltin,
    onayBekleniyor: Renkler.uyari,
    tamamlandi: Renkler.basarili,
    iptal: Renkler.hata,
    hata: Renkler.hata,
};

const DURUM_METIN = {
    hazir: '💳 Ödeme Yap (Testnet)',
    onayBekleniyor: '⏳ Onay Bekleniyor...',
    tamamlandi: '✅ Ödeme Tamamlandı!',
    iptal: '❌ Ödeme İptal Edildi',
    hata: '⚠️ Bir Hata Oluştu',
};

export default function OdemeEkrani({ route, navigation }) {
    const { ilan, uzman } = route.params || {};
    const [odumeDurum, setOdemeDurum] = useState('hazir');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [odemeId, setOdemeId] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const ozet = odemeOzetiOlustur({
        ilanBaslik: ilan?.baslik || 'Danışmanlık Hizmeti',
        uzmanAd: uzman?.ad || 'Uzman',
        miktar: 1,           // Testnet: 1 Pi
    });

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const odemeYap = async () => {
        Alert.alert(
            '💳 Ödeme Onayı',
            `${ozet.miktar} Pi (Testnet) ile ödeme yapılacak.\n\nAlıcı: ${uzman?.ad || 'Uzman'}\nİlan: ${ilan?.baslik || '-'}\n\n${ozet.not}`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Onayla ve Öde',
                    onPress: async () => {
                        setYukleniyor(true);
                        try {
                            await odemeBaslat({
                                miktar: 1,
                                memo: ozet.memo,
                                ilanId: ilan?.id,
                                isverenId: 'demo_isveren_001',
                                uzmanId: uzman?.kullaniciId || 'demo_uzman_001',
                                basariliCallback: (asama, pid, tx) => {
                                    if (asama === 'onay') setOdemeDurum('onayBekleniyor');
                                    if (asama === 'tamamlandi') {
                                        setOdemeDurum('tamamlandi');
                                        setOdemeId(pid);
                                        setTxHash(tx);
                                    }
                                },
                                basarisizCallback: (tip) => {
                                    setOdemeDurum(tip === 'iptal' ? 'iptal' : 'hata');
                                },
                            });
                        } catch (e) {
                            console.error('[AgroPi Ödeme UI] Hata:', e);
                            setOdemeDurum('hata');
                        } finally {
                            setYukleniyor(false);
                        }
                    },
                },
            ]
        );
    };

    const tamamlandi = odumeDurum === 'tamamlandi';
    const aktifRenk = DURUM_RENK[odumeDurum] || Renkler.piAltin;

    return (
        <View style={s.kapsayici}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.geriBtnMetin}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerBaslik}>Pi Ödeme</Text>
                <View style={{ width: 40 }} />
            </View>

            <Animated.View
                style={[s.icerik, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
            >
                {/* Pi logo ve miktar */}
                <View style={[s.piDaire, { borderColor: aktifRenk, shadowColor: aktifRenk }]}>
                    <Text style={s.piSimge}>π</Text>
                    <Text style={[s.piMiktar, { color: aktifRenk }]}>{ozet.miktar}</Text>
                    <Text style={s.piPara}>Pi Coin</Text>
                </View>

                {/* Ödeme detayları */}
                <View style={s.detayKart}>
                    {[
                        { ikon: '💼', etiket: 'İlan', deger: ilan?.baslik || '-' },
                        { ikon: '👤', etiket: 'Uzman', deger: uzman?.ad || '-' },
                        { ikon: '💵', etiket: 'Miktar', deger: `${ozet.miktar} Pi (Testnet)` },
                        { ikon: '📝', etiket: 'Açıklama', deger: ozet.memo },
                        { ikon: '🌐', etiket: 'Ortam', deger: ozet.not },
                    ].map(({ ikon, etiket, deger }) => (
                        <View key={etiket} style={s.detaySatiri}>
                            <Text style={s.detayIkon}>{ikon}</Text>
                            <Text style={s.detayEtiket}>{etiket}</Text>
                            <Text style={s.detayDeger} numberOfLines={2}>{deger}</Text>
                        </View>
                    ))}
                </View>

                {/* TX Hash (tamamlandıysa) */}
                {!!txHash && (
                    <View style={s.txKutu}>
                        <Text style={s.txBaslik}>✅ İşlem Hash</Text>
                        <Text style={s.txHash} numberOfLines={1}>{txHash}</Text>
                    </View>
                )}

                {/* Ödeme butonu */}
                <TouchableOpacity
                    style={[
                        s.odemeBtn,
                        { backgroundColor: aktifRenk, shadowColor: aktifRenk },
                        (yukleniyor || tamamlandi) && { opacity: 0.8 },
                    ]}
                    onPress={tamamlandi ? () => navigation.goBack() : odemeYap}
                    disabled={yukleniyor || odumeDurum === 'onayBekleniyor'}
                    activeOpacity={0.85}
                >
                    {yukleniyor
                        ? <ActivityIndicator color={Renkler.zeminkk} />
                        : <Text style={s.odemedBtnMetin}>
                            {tamamlandi ? '← Geri Dön' : DURUM_METIN[odumeDurum]}
                        </Text>
                    }
                </TouchableOpacity>

                {/* Güvenlik notu */}
                <Text style={s.guvenlikNot}>
                    🔒 Pi cüzdanınız Pi Browser tarafından güvenli şekilde işler.
                    {'\n'}Testnet transferleri gerçek değer taşımaz.
                </Text>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    kapsayici: { flex: 1, backgroundColor: Renkler.zemin },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: Renkler.ayirici,
    },
    geriBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Renkler.kartZemin, borderWidth: 1,
        borderColor: Renkler.ayirici, justifyContent: 'center', alignItems: 'center',
    },
    geriBtnMetin: { fontSize: 20, color: Renkler.metinAna, fontWeight: '700' },
    headerBaslik: { fontSize: 18, fontWeight: '800', color: Renkler.metinAna },

    icerik: {
        flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center',
    },

    // Pi coin görseli
    piDaire: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 3, justifyContent: 'center', alignItems: 'center',
        marginBottom: 28,
        shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 24,
        elevation: 10,
    },
    piSimge: { fontSize: 28, color: Renkler.metinFade, fontWeight: '900' },
    piMiktar: { fontSize: 48, fontWeight: '900', lineHeight: 54 },
    piPara: { fontSize: 13, color: Renkler.metinFade, marginTop: 2 },

    // Detay kartı
    detayKart: {
        width: '100%', backgroundColor: Renkler.kartZemin,
        borderRadius: 18, padding: 16, borderWidth: 1,
        borderColor: Renkler.ayirici, gap: 10, marginBottom: 16,
    },
    detaySatiri: { flexDirection: 'row', alignItems: 'flex-start' },
    detayIkon: { fontSize: 15, width: 28, marginTop: 1 },
    detayEtiket: { fontSize: 12, color: Renkler.metinFade, width: 72 },
    detayDeger: { fontSize: 12, color: Renkler.metinAna, fontWeight: '600', flex: 1 },

    // TX Hash
    txKutu: {
        width: '100%', backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: 12,
        padding: 12, borderWidth: 1, borderColor: 'rgba(76,175,80,0.3)', marginBottom: 16,
    },
    txBaslik: { fontSize: 12, fontWeight: '700', color: Renkler.basarili, marginBottom: 4 },
    txHash: { fontSize: 11, color: Renkler.metinFade, fontFamily: 'monospace' },

    // Ödeme butonu
    odemeBtn: {
        width: '100%', borderRadius: 16, paddingVertical: 18,
        alignItems: 'center', marginBottom: 16,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
    odemedBtnMetin: { fontSize: 16, fontWeight: '800', color: Renkler.zeminkk, letterSpacing: 0.3 },

    guvenlikNot: {
        fontSize: 11, color: Renkler.metinFade, textAlign: 'center', lineHeight: 18,
    },
});
