// AgroPi Marketplace — İş Detay Ekranı
// İlan detayları + Başvuru Yap + İşveren: başvuranlar listesi

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Alert, ActivityIndicator, Animated,
} from 'react-native';
import {
    collection, addDoc, getDocs, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Renkler from '../tema/renkler';

// Kategori renkleri
const KAT_RENK = {
    'Topraksız Tarım Uzmanı': '#52B788',
    'Ziraat Mühendisi': '#F0C040',
    'Tarım Teknisyeni': '#42A5F5',
    'Üretim Müdürü': '#FF9800',
};

// Demo başvuranlar (Firestore offline ise)
const DEMO_BASVURANLAR = [];

export default function IsDetayEkrani({ route, navigation }) {
    const { ilan } = route.params || {};

    const [basvuranlar, setBasvuranlar] = useState(DEMO_BASVURANLAR);
    const [basvuruYapildi, setBasvuruYapildi] = useState(false);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [listYukleniyor, setListYukleniyor] = useState(false);
    const [isverenGorunu, setIsverenGorunu] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        if (ilan?.id) basvuranlariYukle(ilan.id);
    }, []);

    // Firestore'dan başvuranları çek
    const basvuranlariYukle = async (ilanId) => {
        if (!db) return;
        setListYukleniyor(true);
        try {
            const q = query(
                collection(db, 'jobs', ilanId, 'applications'),
                orderBy('basvuruTarihi', 'desc')
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                setBasvuranlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (e) {
            console.warn('[AgroPi] Başvuranlar yüklenemedi:', e.message);
        } finally {
            setListYukleniyor(false);
        }
    };

    // Başvuru Yap — Firestore 'jobs/{id}/applications' alt koleksiyonu
    const basvuruYap = async () => {
        if (basvuruYapildi) {
            Alert.alert('Zaten Başvurdunuz', 'Bu ilana daha önce başvurdiniz.');
            return;
        }
        Alert.alert(
            'Başvuru Yap',
            `"${ilan?.baslik}" ilanına başvurmak istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Başvur',
                    onPress: async () => {
                        setYukleniyor(true);
                        try {
                            const basvuruVerisi = {
                                uzmanId: 'demo_uzman_001',
                                uzmanAd: 'Demo Kullanıcı',
                                basvuruTarihi: serverTimestamp(),
                                durum: 'beklemede',
                            };

                            if (db) {
                                await addDoc(
                                    collection(db, 'jobs', ilan.id, 'applications'),
                                    basvuruVerisi
                                );
                                console.log('[AgroPi] Başvuru kaydedildi:', ilan.id);
                            } else {
                                console.log('[AgroPi] Offline başvuru:', basvuruVerisi);
                            }

                            setBasvuruYapildi(true);
                            setBasvuranlar(prev => [{
                                id: `local_${Date.now()}`,
                                ...basvuruVerisi,
                                basvuruTarihi: new Date(),
                            }, ...prev]);

                            Alert.alert(
                                '✅ Başvurunuz Alındı!',
                                'İşveren en kısa sürede sizinle iletişime geçecek.'
                            );
                        } catch (hata) {
                            console.error('[AgroPi] Başvuru hatası:', hata);
                            Alert.alert('Hata', 'Başvuru gönderilirken bir sorun oluştu.');
                        } finally {
                            setYukleniyor(false);
                        }
                    },
                },
            ]
        );
    };

    if (!ilan) {
        return (
            <View style={s.hataEkrani}>
                <Text style={s.hataMetin}>İlan bulunamadı.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={s.geriMetin}>← Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renk = KAT_RENK[ilan.kategori] || Renkler.piAltin;

    return (
        <View style={s.kapsayici}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.geriBtnMetin}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerBaslik} numberOfLines={1}>İş Detayı</Text>
                <View style={{ width: 40 }} />
            </View>

            <Animated.ScrollView
                style={{ opacity: fadeAnim }}
                contentContainerStyle={s.kaydirma}
                showsVerticalScrollIndicator={false}
            >
                {/* Kategori badge */}
                <View style={[s.badge, { backgroundColor: `${renk}22`, borderColor: renk }]}>
                    <Text style={s.badgeEmoji}>{ilan.kategoriEmoji}</Text>
                    <Text style={[s.badgeMetin, { color: renk }]}>{ilan.kategori}</Text>
                </View>

                {/* Başlık */}
                <Text style={s.baslik}>{ilan.baslik}</Text>

                {/* Bütçe + Durum satırı */}
                <View style={s.ozet}>
                    <View style={s.ozetKutu}>
                        <Text style={s.ozetEtiket}>💵 Bütçe</Text>
                        <Text style={s.ozetDeger}>${ilan.butce}</Text>
                    </View>
                    <View style={s.ozetAyirici} />
                    <View style={s.ozetKutu}>
                        <Text style={s.ozetEtiket}>📋 Durum</Text>
                        <View style={s.aktifSatir}>
                            <View style={s.aktifNokta} />
                            <Text style={s.aktifMetin}>Aktif</Text>
                        </View>
                    </View>
                    <View style={s.ozetAyirici} />
                    <View style={s.ozetKutu}>
                        <Text style={s.ozetEtiket}>👥 Başvuran</Text>
                        <Text style={s.ozetDeger}>{basvuranlar.length}</Text>
                    </View>
                </View>

                {/* Detaylı Açıklama */}
                <View style={s.bolum}>
                    <Text style={s.bolumBaslik}>📝 İş Açıklaması</Text>
                    <Text style={s.aciklama}>{ilan.aciklama}</Text>
                </View>

                {/* Başvuru Butonu */}
                <TouchableOpacity
                    style={[
                        s.basvuruBtn,
                        basvuruYapildi && s.basvuruBtnTamamlandi,
                        yukleniyor && { opacity: 0.7 },
                    ]}
                    onPress={basvuruYap}
                    disabled={yukleniyor || basvuruYapildi}
                    activeOpacity={0.85}
                >
                    {yukleniyor ? (
                        <ActivityIndicator color={Renkler.zeminkk} />
                    ) : basvuruYapildi ? (
                        <Text style={s.basvuruBtnMetin}>✅ Başvurunuz Alındı</Text>
                    ) : (
                        <Text style={s.basvuruBtnMetin}>🚀 Başvuru Yap</Text>
                    )}
                </TouchableOpacity>

                {/* ── İşveren Görünümü: Başvuranlar ── */}
                <TouchableOpacity
                    style={s.isverenToggle}
                    onPress={() => setIsverenGorunu(!isverenGorunu)}
                    activeOpacity={0.8}
                >
                    <Text style={s.isverenToggleMetin}>
                        👔 İşveren Görünümü {isverenGorunu ? '▲' : '▼'}
                    </Text>
                    {basvuranlar.length > 0 && (
                        <View style={s.isverenRozet}>
                            <Text style={s.isverenRozetMetin}>{basvuranlar.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {isverenGorunu && (
                    <View style={s.basvuranlarKutu}>
                        <Text style={s.basvuranlarBaslik}>
                            Başvuranlar ({basvuranlar.length})
                        </Text>

                        {listYukleniyor ? (
                            <ActivityIndicator color={Renkler.piAltin} style={{ marginVertical: 20 }} />
                        ) : basvuranlar.length === 0 ? (
                            <View style={s.basvuranBos}>
                                <Text style={s.basvuranBosEmoji}>📭</Text>
                                <Text style={s.basvuranBosMetin}>
                                    Henüz başvuru yok
                                </Text>
                            </View>
                        ) : (
                            basvuranlar.map((b, i) => (
                                <View key={b.id} style={s.basvuranSatir}>
                                    <View style={s.basvuranNumara}>
                                        <Text style={s.basvuranNumaraMetin}>{i + 1}</Text>
                                    </View>
                                    <View style={s.basvuranBilgi}>
                                        <Text style={s.basvuranAd}>{b.uzmanAd || b.uzmanId}</Text>
                                        <Text style={s.basvuranTarih}>
                                            {b.basvuruTarihi?.toDate
                                                ? b.basvuruTarihi.toDate().toLocaleDateString('tr-TR')
                                                : 'Az önce'}
                                        </Text>
                                    </View>
                                    <View style={[
                                        s.durumEtiket,
                                        b.durum === 'kabul' && s.durumKabul,
                                        b.durum === 'red' && s.durumRed,
                                    ]}>
                                        <Text style={s.durumMetin}>
                                            {b.durum === 'kabul' ? '✅ Kabul'
                                                : b.durum === 'red' ? '❌ Reddedildi'
                                                    : '⏳ Beklemede'}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    kapsayici: { flex: 1, backgroundColor: Renkler.zemin },

    // Header
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
    headerBaslik: { fontSize: 18, fontWeight: '700', color: Renkler.metinAna, flex: 1, textAlign: 'center' },

    // İçerik
    kaydirma: { padding: 20 },

    // Badge
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'flex-start', borderRadius: 20, borderWidth: 1,
        paddingHorizontal: 12, paddingVertical: 6, marginBottom: 14,
    },
    badgeEmoji: { fontSize: 14 },
    badgeMetin: { fontSize: 12, fontWeight: '700' },

    // Başlık
    baslik: {
        fontSize: 22, fontWeight: '800', color: Renkler.metinAna,
        lineHeight: 30, marginBottom: 18,
    },

    // Özet kutusu
    ozet: {
        flexDirection: 'row', backgroundColor: Renkler.kartZemin,
        borderRadius: 16, borderWidth: 1, borderColor: Renkler.ayirici,
        padding: 16, marginBottom: 24, alignItems: 'center',
    },
    ozetKutu: { flex: 1, alignItems: 'center' },
    ozetEtiket: { fontSize: 11, color: Renkler.metinFade, marginBottom: 6 },
    ozetDeger: { fontSize: 18, fontWeight: '800', color: Renkler.metinAna },
    ozetAyirici: { width: 1, height: 36, backgroundColor: Renkler.ayirici },
    aktifSatir: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    aktifNokta: { width: 8, height: 8, borderRadius: 4, backgroundColor: Renkler.basarili },
    aktifMetin: { fontSize: 14, fontWeight: '700', color: Renkler.basarili },

    // Bölüm
    bolum: { marginBottom: 24 },
    bolumBaslik: { fontSize: 14, fontWeight: '800', color: Renkler.metinIkincil, marginBottom: 10 },
    aciklama: { fontSize: 15, color: Renkler.metinAna, lineHeight: 24 },

    // Başvuru butonu
    basvuruBtn: {
        backgroundColor: Renkler.piAltin, borderRadius: 16,
        paddingVertical: 18, alignItems: 'center', marginBottom: 16,
        shadowColor: Renkler.piAltin, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
    basvuruBtnTamamlandi: {
        backgroundColor: Renkler.basarili,
        shadowColor: Renkler.basarili,
    },
    basvuruBtnMetin: { fontSize: 16, fontWeight: '800', color: Renkler.zeminkk },

    // İşveren toggle
    isverenToggle: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Renkler.kartZemin, borderRadius: 14, borderWidth: 1,
        borderColor: Renkler.ayirici, padding: 14, marginBottom: 12,
    },
    isverenToggleMetin: { fontSize: 14, fontWeight: '700', color: Renkler.metinIkincil },
    isverenRozet: {
        backgroundColor: Renkler.piAltin, borderRadius: 12, minWidth: 22,
        height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
    },
    isverenRozetMetin: { fontSize: 12, fontWeight: '800', color: Renkler.zeminkk },

    // Başvuranlar kutusu
    basvuranlarKutu: {
        backgroundColor: Renkler.kartZemin, borderRadius: 16,
        borderWidth: 1, borderColor: Renkler.ayirici, padding: 16,
    },
    basvuranlarBaslik: {
        fontSize: 14, fontWeight: '800', color: Renkler.metinAna, marginBottom: 14,
    },
    basvuranBos: { alignItems: 'center', paddingVertical: 20 },
    basvuranBosEmoji: { fontSize: 36, marginBottom: 8 },
    basvuranBosMetin: { fontSize: 14, color: Renkler.metinFade },

    // Başvuran satırı
    basvuranSatir: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Renkler.ayirici,
    },
    basvuranNumara: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Renkler.yarimSeffafAltin, justifyContent: 'center', alignItems: 'center',
    },
    basvuranNumaraMetin: { fontSize: 13, fontWeight: '800', color: Renkler.piAltin },
    basvuranBilgi: { flex: 1 },
    basvuranAd: { fontSize: 14, fontWeight: '700', color: Renkler.metinAna },
    basvuranTarih: { fontSize: 11, color: Renkler.metinFade, marginTop: 2 },

    durumEtiket: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
        backgroundColor: 'rgba(255,152,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,152,0,0.35)',
    },
    durumKabul: { backgroundColor: 'rgba(76,175,80,0.15)', borderColor: 'rgba(76,175,80,0.35)' },
    durumRed: { backgroundColor: 'rgba(239,83,80,0.15)', borderColor: 'rgba(239,83,80,0.35)' },
    durumMetin: { fontSize: 11, fontWeight: '700', color: Renkler.metinIkincil },

    // Hata ekranı
    hataEkrani: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Renkler.zemin },
    hataMetin: { fontSize: 16, color: Renkler.metinFade, marginBottom: 16 },
    geriMetin: { fontSize: 14, color: Renkler.piAltin, fontWeight: '700' },
});
