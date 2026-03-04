// AgroPi Marketplace — Ana Sayfa Ekranı
// 'Yeni İş Fırsatları' listesi + İş İlanı Ver butonu

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, Animated, RefreshControl,
} from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import Renkler from '../tema/renkler';

// Kategori renk haritası
const KAT_RENK = {
    'Topraksız Tarım Uzmanı': '#52B788',
    'Ziraat Mühendisi': '#F0C040',
    'Tarım Teknisyeni': '#42A5F5',
    'Üretim Müdürü': '#FF9800',
};

// Demo iş ilanları (Firestore bağlanana kadar gösterilir)
const DEMO_ILANLAR = [
    {
        id: 'd1', baslik: 'Hidroponik Sistem Kurulum Danışmanı',
        aciklama: '500 m² kapalı alan için NFT sistemi kurulumu ve işletme eğitimi verecek uzman aranıyor.',
        butce: 1200, kategori: 'Topraksız Tarım Uzmanı', kategoriEmoji: '🌱',
        durum: 'aktif',
    },
    {
        id: 'd2', baslik: 'Ziraat Mühendisi — Toprak Analizi',
        aciklama: 'Ege bölgesindeki 3 farklı arazi için toprak analizi, raporlama ve önerilerin sunulması.',
        butce: 800, kategori: 'Ziraat Mühendisi', kategoriEmoji: '🌾',
        durum: 'aktif',
    },
    {
        id: 'd3', baslik: 'Sera Teknik Bakım Teknisyeni',
        aciklama: 'Marmara bölgesinde büyük sera tesisimiz için haftalık düzenli teknik bakım ve arıza müdahalesi.',
        butce: 400, kategori: 'Tarım Teknisyeni', kategoriEmoji: '🔧',
        durum: 'aktif',
    },
    {
        id: 'd4', baslik: 'Üretim Müdürü — Yeni Sera Tesisi',
        aciklama: '2.000 da\'lık yeni domates sera kompleksi için süreç tasarımı ve ekip yönetimi.',
        butce: 3500, kategori: 'Üretim Müdürü', kategoriEmoji: '🏭',
        durum: 'aktif',
    },
];

// İlan Kartı bileşeni
function IlanKarti({ ilan, onBasildi, gecikme }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: gecikme, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: gecikme, useNativeDriver: true }),
        ]).start();
    }, []);

    const renk = KAT_RENK[ilan.kategori] || Renkler.piAltin;

    return (
        <Animated.View style={[s.ilanSarici, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={s.ilanKart} onPress={onBasildi} activeOpacity={0.82}>
                {/* Üst: Badge + Bütçe */}
                <View style={s.ilanUst}>
                    <View style={[s.badge, { backgroundColor: `${renk}22`, borderColor: renk }]}>
                        <Text style={s.badgeEmoji}>{ilan.kategoriEmoji}</Text>
                        <Text style={[s.badgeMetin, { color: renk }]}>{ilan.kategori}</Text>
                    </View>
                    <View style={s.butceCip}>
                        <Text style={s.butceMetin}>${ilan.butce}</Text>
                    </View>
                </View>

                {/* Başlık */}
                <Text style={s.ilanBaslik} numberOfLines={2}>{ilan.baslik}</Text>

                {/* Açıklama */}
                <Text style={s.ilanAciklama} numberOfLines={2}>{ilan.aciklama}</Text>

                {/* Alt: Durum + Teklif Ver */}
                <View style={s.ilanAlt}>
                    <View style={s.aktifCip}>
                        <View style={s.aktifNokta} />
                        <Text style={s.aktifMetin}>Aktif İlan</Text>
                    </View>
                    <TouchableOpacity style={s.teklifBtn} onPress={onBasildi}>
                        <Text style={s.teklifBtnMetin}>Teklif Ver →</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// Ana bileşen
export default function AnaSayfaEkrani({ navigation }) {
    const [ilanlar, setIlanlar] = useState(DEMO_ILANLAR);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [yenileniyor, setYenileniyor] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        firestoreIlanlariYukle();
    }, []);

    const firestoreIlanlariYukle = async () => {
        if (!db) return; // Firebase offline → demo veri kullanılır
        try {
            setYukleniyor(true);
            const q = query(collection(db, 'jobs'), orderBy('olusturmaTarihi', 'desc'), limit(20));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const veriler = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setIlanlar(veriler);
            }
        } catch (e) {
            console.warn('[AgroPi] İlanlar yüklenemedi, demo veri kullanılıyor:', e.message);
        } finally {
            setYukleniyor(false);
            setYenileniyor(false);
        }
    };

    const yenile = () => {
        setYenileniyor(true);
        firestoreIlanlariYukle();
    };

    return (
        <View style={s.kapsayici}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <Animated.View style={[s.header, { opacity: fadeAnim }]}>
                <View>
                    <Text style={s.headerBaslik}>Yeni İş Fırsatları 💼</Text>
                    <Text style={s.headerAlt}>{ilanlar.length} aktif ilan</Text>
                </View>
                {/* İlan Ver Butonu */}
                <TouchableOpacity
                    style={s.ilanVerBtn}
                    onPress={() => navigation.navigate('IsIlaniVer')}
                    activeOpacity={0.85}
                >
                    <Text style={s.ilanVerMetin}>+ İlan Ver</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* İlan listesi */}
            <FlatList
                data={ilanlar}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => (
                    <IlanKarti
                        ilan={item}
                        gecikme={index * 60}
                        onBasildi={() => navigation.navigate('IsDetay', { ilan: item })}
                    />
                )}
                contentContainerStyle={s.liste}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={yenileniyor}
                        onRefresh={yenile}
                        tintColor={Renkler.piAltin}
                        colors={[Renkler.piAltin]}
                    />
                }
                ListEmptyComponent={
                    <View style={s.bos}>
                        <Text style={s.bosEmoji}>📭</Text>
                        <Text style={s.bosBaslik}>Henüz ilan yok</Text>
                        <Text style={s.bosAlt}>İlk ilanı siz verin!</Text>
                        <TouchableOpacity
                            style={s.bosBtn}
                            onPress={() => navigation.navigate('IsIlaniVer')}
                        >
                            <Text style={s.bosBtnMetin}>+ İlan Ver</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const s = StyleSheet.create({
    kapsayici: { flex: 1, backgroundColor: Renkler.zemin },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingTop: 56,
        paddingHorizontal: 20, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: Renkler.ayirici,
    },
    headerBaslik: { fontSize: 22, fontWeight: '800', color: Renkler.metinAna },
    headerAlt: { fontSize: 13, color: Renkler.metinFade, marginTop: 2 },

    ilanVerBtn: {
        backgroundColor: Renkler.piAltin, borderRadius: 20,
        paddingHorizontal: 18, paddingVertical: 10,
        shadowColor: Renkler.piAltin, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    ilanVerMetin: { fontSize: 14, fontWeight: '800', color: Renkler.zeminkk },

    // Liste
    liste: { padding: 16, paddingTop: 14 },

    // İlan kartı
    ilanSarici: { marginBottom: 14 },
    ilanKart: {
        backgroundColor: Renkler.kartZemin, borderRadius: 18,
        padding: 16, borderWidth: 1, borderColor: Renkler.ayirici,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
    },
    ilanUst: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
    },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderRadius: 20, borderWidth: 1,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    badgeEmoji: { fontSize: 13 },
    badgeMetin: { fontSize: 11, fontWeight: '700' },

    butceCip: {
        backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(76,175,80,0.35)',
        paddingHorizontal: 10, paddingVertical: 4,
    },
    butceMetin: { fontSize: 14, fontWeight: '800', color: '#4CAF50' },

    ilanBaslik: {
        fontSize: 16, fontWeight: '800', color: Renkler.metinAna,
        marginBottom: 6, lineHeight: 22,
    },
    ilanAciklama: {
        fontSize: 13, color: Renkler.metinIkincil,
        lineHeight: 19, marginBottom: 14,
    },

    ilanAlt: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderTopWidth: 1,
        borderTopColor: Renkler.ayirici, paddingTop: 10,
    },
    aktifCip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    aktifNokta: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: Renkler.basarili,
    },
    aktifMetin: { fontSize: 12, color: Renkler.basarili, fontWeight: '600' },

    teklifBtn: {
        backgroundColor: Renkler.yarimSeffafAltin, borderRadius: 12,
        borderWidth: 1, borderColor: Renkler.piAltin,
        paddingHorizontal: 14, paddingVertical: 7,
    },
    teklifBtnMetin: { fontSize: 13, color: Renkler.piAltin, fontWeight: '700' },

    // Boş durum
    bos: { alignItems: 'center', paddingTop: 80 },
    bosEmoji: { fontSize: 52, marginBottom: 14 },
    bosBaslik: { fontSize: 20, fontWeight: '800', color: Renkler.metinAna },
    bosAlt: { fontSize: 14, color: Renkler.metinFade, marginTop: 6, marginBottom: 24 },
    bosBtn: {
        backgroundColor: Renkler.piAltin, borderRadius: 20,
        paddingHorizontal: 24, paddingVertical: 12,
    },
    bosBtnMetin: { fontSize: 14, fontWeight: '800', color: Renkler.zeminkk },
});
