// AgroPi Marketplace — Uzman Bul Ekranı (Profesyonel Pazar Yeri)
// Kalıcı filtre paneli: Kategori + Hizmet Bölgesi (her zaman görünür)
// Gerçek zamanlı arama: ad + referans proje

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, TextInput, Animated, ScrollView,
} from 'react-native';
import Renkler from '../tema/renkler';
import UzmanKarti from '../bilesanler/UzmanKarti';

// ── Demo Veri ───────────────────────────────────────────────────
const DEMO_UZMANLAR = [
    {
        id: '1', ad: 'Dr. Ayşe Kaya',
        kategori: 'Ziraat Mühendisi', kategoriEmoji: '🌾',
        konum: 'İzmir', puan: 4.9, yorumSayisi: 47, ucret: 2.5,
        biyografi: 'Toprak analizi ve sulama sistemleri uzmanı. 12 yıl saha deneyimi.',
        aktif: true, piKullaniciAdi: 'aysekaya_pi',
        usdUcret: 45, hizmetBolgesi: 'Ege, İç Anadolu',
        deneyimYili: 12, referansProje: 'Ege Zeytin Tarlaları Sulama Projesi',
    },
    {
        id: '2', ad: 'Murat Demir',
        kategori: 'Topraksız Tarım Uzmanı', kategoriEmoji: '🌱',
        konum: 'Konya', puan: 4.7, yorumSayisi: 31, ucret: 1.8,
        biyografi: 'Hidroponik ve aeroponik sistemler kurulum ve yönetim uzmanı.',
        aktif: true, piKullaniciAdi: 'muratdemir_pi',
        usdUcret: 35, hizmetBolgesi: 'İç Anadolu, Tüm Türkiye',
        deneyimYili: 8, referansProje: 'Konya Büyükşehir Dikey Tarım Tesisi',
    },
    {
        id: '3', ad: 'Fatma Erdoğan',
        kategori: 'Tarım Teknisyeni', kategoriEmoji: '🔧',
        konum: 'Muğla', puan: 4.8, yorumSayisi: 22, ucret: 1.2,
        biyografi: 'Sera ekipmanları kurulumu, bakımı ve arıza tespiti konusunda uzman.',
        aktif: false, piKullaniciAdi: 'fatmaerdogan_pi',
        usdUcret: 25, hizmetBolgesi: 'Ege, Akdeniz',
        deneyimYili: 6, referansProje: 'Muğla Organize Sera Bölgesi Teknik Destek',
    },
    {
        id: '4', ad: 'Kemal Yıldız',
        kategori: 'Üretim Müdürü', kategoriEmoji: '🏭',
        konum: 'Ankara', puan: 4.6, yorumSayisi: 58, ucret: 3.0,
        biyografi: 'Büyük ölçekli sera üretim süreçleri planlama ve ekip yönetimi.',
        aktif: true, piKullaniciAdi: 'kemalyildiz_pi',
        usdUcret: 60, hizmetBolgesi: 'Tüm Türkiye',
        deneyimYili: 15, referansProje: 'TARSİM Domates Sera Kompleksi (500 da)',
    },
    {
        id: '5', ad: 'Hasan Çelik',
        kategori: 'Tarım Teknisyeni', kategoriEmoji: '🔧',
        konum: 'Şanlıurfa', puan: 4.5, yorumSayisi: 18, ucret: 0.8,
        biyografi: 'Damla sulama ve gübreleme sistemleri kurulum ve bakım uzmanı.',
        aktif: true, piKullaniciAdi: 'hasancelik_pi',
        usdUcret: 20, hizmetBolgesi: 'Güneydoğu Anadolu',
        deneyimYili: 9, referansProje: 'GAP Sulama Modernizasyon Projesi',
    },
    {
        id: '6', ad: 'Selin Aydın',
        kategori: 'Topraksız Tarım Uzmanı', kategoriEmoji: '🌱',
        konum: 'Bursa', puan: 4.9, yorumSayisi: 35, ucret: 2.0,
        biyografi: 'NFT ve DWC hidroponik sistemlerde marul, fesleğen ve çilek üretimi.',
        aktif: true, piKullaniciAdi: 'selinaydin_pi',
        usdUcret: 50, hizmetBolgesi: 'Marmara, Tüm Türkiye',
        deneyimYili: 11, referansProje: 'Bursa Sofralık Çilek Hidroponik Çiftliği',
    },
];

// ── Filtre Yapılandırmaları ──────────────────────────────────────
const KATEGORILER = [
    { id: 'hepsi', emoji: '✨', ad: 'Hepsi', eslestir: null },
    { id: 'topraksiz', emoji: '🌱', ad: 'Topraksız Tarım', eslestir: 'Topraksız Tarım Uzmanı' },
    { id: 'ziraat', emoji: '🌾', ad: 'Ziraat Mühendisi', eslestir: 'Ziraat Mühendisi' },
    { id: 'teknisyen', emoji: '🔧', ad: 'Tarım Teknisyeni', eslestir: 'Tarım Teknisyeni' },
    { id: 'mudur', emoji: '🏭', ad: 'Üretim Müdürü', eslestir: 'Üretim Müdürü' },
];

const BOLGELER = [
    { id: 'hepsi', ad: 'Tüm Bölgeler', anahtar: null },
    { id: 'ege', ad: '🌊 Ege', anahtar: 'ege' },
    { id: 'akdeniz', ad: '☀️ Akdeniz', anahtar: 'akdeniz' },
    { id: 'marmara', ad: '🏙️ Marmara', anahtar: 'marmara' },
    { id: 'ic_anadolu', ad: '🌾 İç Anadolu', anahtar: 'iç anadolu' },
    { id: 'guneydogu', ad: '🏜️ Güneydoğu', anahtar: 'güneydoğu' },
    { id: 'tum_turkiye', ad: '🇹🇷 Tüm Türkiye', anahtar: 'tüm türkiye' },
];

// ── Bileşen ─────────────────────────────────────────────────────
export default function MarketplaceEkrani({ navigation }) {
    const [aramaMetni, setAramaMetni] = useState('');
    const [seciliKategori, setSeciliKategori] = useState('hepsi');
    const [seciliBolge, setSeciliBolge] = useState('hepsi');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    // Gerçek zamanlı birleşik filtre
    const filtreliUzmanlar = useCallback(() => {
        const ara = aramaMetni.toLowerCase().trim();
        const kat = KATEGORILER.find(k => k.id === seciliKategori);
        const bolge = BOLGELER.find(b => b.id === seciliBolge);

        return DEMO_UZMANLAR.filter(u => {
            // 1. Metin araması: ad VEYA referans proje
            const aramaOK = !ara ||
                u.ad.toLowerCase().includes(ara) ||
                (u.referansProje || '').toLowerCase().includes(ara);

            // 2. Kategori (kesin eşleşme)
            const katOK = !kat?.eslestir || u.kategori === kat.eslestir;

            // 3. Bölge (kısmi eşleşme)
            const bolgeOK = !bolge?.anahtar ||
                (u.hizmetBolgesi || '').toLowerCase().includes(bolge.anahtar);

            return aramaOK && katOK && bolgeOK;
        });
    }, [aramaMetni, seciliKategori, seciliBolge]);

    const sonuclar = filtreliUzmanlar();

    const aktifFiltre = (seciliKategori !== 'hepsi' ? 1 : 0) + (seciliBolge !== 'hepsi' ? 1 : 0);

    const filtreleriTemizle = () => {
        setAramaMetni('');
        setSeciliKategori('hepsi');
        setSeciliBolge('hepsi');
    };

    return (
        <View style={stiller.kapsayici}>
            <StatusBar barStyle="light-content" backgroundColor={Renkler.zeminkk} />

            <Animated.View style={[stiller.ust, { opacity: fadeAnim }]}>

                {/* ── Başlık satırı ── */}
                <View style={stiller.baslikSatiri}>
                    <View>
                        <Text style={stiller.baslik}>Uzman Bul 🌾</Text>
                        <Text style={stiller.altBaslik}>
                            {sonuclar.length} profesyonel listeleniyor
                        </Text>
                    </View>
                    {aktifFiltre > 0 && (
                        <TouchableOpacity style={stiller.temizleBtn} onPress={filtreleriTemizle}>
                            <Text style={stiller.temizleBtnMetin}>✕ Filtreleri Sıfırla ({aktifFiltre})</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Arama çubuğu: Ad + Referans Proje ── */}
                <View style={stiller.aramaKutu}>
                    <Text style={stiller.aramaSimge}>🔍</Text>
                    <TextInput
                        style={stiller.aramaInput}
                        value={aramaMetni}
                        onChangeText={setAramaMetni}
                        placeholder="Ad veya referans proje adı ara..."
                        placeholderTextColor={Renkler.metinFade}
                        returnKeyType="search"
                    />
                    {aramaMetni.length > 0 && (
                        <TouchableOpacity onPress={() => setAramaMetni('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={stiller.aramaTemizle}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Filtre Paneli ── */}
                <View style={stiller.filtrePanel}>
                    {/* Kategori */}
                    <Text style={stiller.filtreBaslik}>📂 KATEGORİ</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={stiller.cipSatir}>
                        {KATEGORILER.map(kat => {
                            const secili = seciliKategori === kat.id;
                            return (
                                <TouchableOpacity
                                    key={kat.id}
                                    style={[stiller.cip, secili && stiller.cipSecili]}
                                    onPress={() => setSeciliKategori(kat.id)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={stiller.cipEmoji}>{kat.emoji}</Text>
                                    <Text style={[stiller.cipMetin, secili && stiller.cipMetinSecili]}>
                                        {kat.ad}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Bölge */}
                    <Text style={[stiller.filtreBaslik, { marginTop: 10 }]}>🗺️ HİZMET BÖLGESİ</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={stiller.cipSatir}>
                        {BOLGELER.map(bolge => {
                            const secili = seciliBolge === bolge.id;
                            return (
                                <TouchableOpacity
                                    key={bolge.id}
                                    style={[stiller.cip, secili && stiller.cipBolgeSecili]}
                                    onPress={() => setSeciliBolge(bolge.id)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[stiller.cipMetin, secili && stiller.cipBolgeMetinSecili]}>
                                        {bolge.ad}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Animated.View>

            {/* ── Uzman Listesi ── */}
            <FlatList
                data={sonuclar}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => (
                    <UzmanKarti
                        uzman={item}
                        onBasildi={() => navigation.navigate('UzmanDetay', { uzman: item })}
                        gecikme={index * 60}
                    />
                )}
                contentContainerStyle={stiller.liste}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <View style={stiller.bosEkran}>
                        <Text style={stiller.bosEmoji}>🌾</Text>
                        <Text style={stiller.bosBaslik}>Uzman Bulunamadı</Text>
                        <Text style={stiller.bosAlt}>
                            Bu kriterlere uygun uzman bulunamadı.{'\n'}Farklı bir kategori veya bölge seçin.
                        </Text>
                        <TouchableOpacity style={stiller.bosBtn} onPress={filtreleriTemizle}>
                            <Text style={stiller.bosBtnMetin}>Tüm Filtreleri Kaldır</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

// ── Stiller ─────────────────────────────────────────────────────
const stiller = StyleSheet.create({
    kapsayici: { flex: 1, backgroundColor: Renkler.zemin },

    // Header
    ust: {
        paddingTop: 56,
        paddingHorizontal: 20,
        backgroundColor: Renkler.zemin,
        borderBottomWidth: 1,
        borderBottomColor: Renkler.ayirici,
    },
    baslikSatiri: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
    },
    baslik: { fontSize: 24, fontWeight: '800', color: Renkler.metinAna },
    altBaslik: { fontSize: 13, color: Renkler.metinFade, marginTop: 2 },

    temizleBtn: {
        backgroundColor: 'rgba(239,83,80,0.12)',
        borderRadius: 16, borderWidth: 1,
        borderColor: 'rgba(239,83,80,0.4)',
        paddingHorizontal: 12, paddingVertical: 6,
    },
    temizleBtnMetin: { fontSize: 12, color: Renkler.hata, fontWeight: '700' },

    // Arama
    aramaKutu: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Renkler.girdiZemin,
        borderRadius: 14, paddingHorizontal: 14,
        marginBottom: 14, borderWidth: 1, borderColor: Renkler.ayirici,
        height: 46,
    },
    aramaSimge: { fontSize: 16, marginRight: 8 },
    aramaInput: { flex: 1, fontSize: 14, color: Renkler.metinAna },
    aramaTemizle: { fontSize: 14, color: Renkler.metinFade, padding: 4 },

    // Filtre paneli
    filtrePanel: {
        backgroundColor: Renkler.kartZemin,
        borderRadius: 16, borderWidth: 1,
        borderColor: Renkler.ayirici,
        padding: 14, marginBottom: 14,
    },
    filtreBaslik: {
        fontSize: 10, fontWeight: '800', color: Renkler.metinFade,
        letterSpacing: 1.2, marginBottom: 8,
    },
    cipSatir: { gap: 8, paddingBottom: 2 },
    cip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1.5,
        borderColor: Renkler.ayirici,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    cipSecili: {
        borderColor: Renkler.piAltin,
        backgroundColor: 'rgba(240,192,64,0.15)',
    },
    cipBolgeSecili: {
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76,175,80,0.15)',
    },
    cipEmoji: { fontSize: 13 },
    cipMetin: { fontSize: 13, color: Renkler.metinIkincil, fontWeight: '600' },
    cipMetinSecili: { color: Renkler.piAltin },
    cipBolgeMetinSecili: { color: '#4CAF50' },

    // Liste
    liste: { padding: 16, paddingTop: 12 },

    // Boş durum
    bosEkran: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
    bosEmoji: { fontSize: 52, marginBottom: 14 },
    bosBaslik: { fontSize: 20, fontWeight: '800', color: Renkler.metinAna, marginBottom: 8 },
    bosAlt: {
        fontSize: 14, color: Renkler.metinFade, textAlign: 'center',
        lineHeight: 22, marginBottom: 24,
    },
    bosBtn: {
        paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: 20, borderWidth: 1.5, borderColor: Renkler.piAltin,
    },
    bosBtnMetin: { fontSize: 14, color: Renkler.piAltin, fontWeight: '700' },
});
