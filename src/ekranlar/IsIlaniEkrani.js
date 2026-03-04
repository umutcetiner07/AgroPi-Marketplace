// AgroPi Marketplace — İş İlanı Ver Ekranı
// İşverenler iş ilanı oluşturur → Firestore 'jobs' koleksiyonuna kaydölir

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    StatusBar, ScrollView, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { doc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import Renkler from '../tema/renkler';

// 4 uzman kategorisi
const KATEGORILER = [
    { id: 'topraksiz', emoji: '🌱', ad: 'Topraksız Tarım Uzmanı' },
    { id: 'ziraat', emoji: '🌾', ad: 'Ziraat Mühendisi' },
    { id: 'teknisyen', emoji: '🔧', ad: 'Tarım Teknisyeni' },
    { id: 'mudur', emoji: '🏭', ad: 'Üretim Müdürü' },
];

export default function IsIlaniEkrani({ navigation }) {
    const [baslik, setBaslik] = useState('');
    const [aciklama, setAciklama] = useState('');
    const [butce, setButce] = useState('');
    const [kategori, setKategori] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    }, []);

    const ilaniYayimla = async () => {
        if (!baslik.trim()) {
            Alert.alert('Eksik Alan', 'Lütfen iş başlığını girin.'); return;
        }
        if (!aciklama.trim()) {
            Alert.alert('Eksik Alan', 'Lütfen iş açıklamasını girin.'); return;
        }
        if (!kategori) {
            Alert.alert('Eksik Alan', 'Lütfen bir kategori seçin.'); return;
        }
        if (!butce.trim() || isNaN(parseFloat(butce))) {
            Alert.alert('Geçersiz Bütçe', 'Lütfen geçerli bir bütçe girin.'); return;
        }

        setYukleniyor(true);
        try {
            const ilanId = `job_${Date.now()}`;
            const ilanVerisi = {
                id: ilanId,
                baslik: baslik.trim(),
                aciklama: aciklama.trim(),
                butce: parseFloat(butce),
                kategori: kategori.ad,
                kategoriId: kategori.id,
                kategoriEmoji: kategori.emoji,
                durum: 'aktif',
                olusturmaTarihi: serverTimestamp(),
            };

            if (db) {
                await setDoc(doc(collection(db, 'jobs'), ilanId), ilanVerisi);
                console.log('[AgroPi] İş ilanı Firestore\'a kaydedildi:', ilanId);
            } else {
                console.log('[AgroPi] Firebase offline — ilan konsola yazıldı:', ilanVerisi);
            }

            Alert.alert(
                '✅ İlan Yayımlandı!',
                `"${baslik}" ilanınız başarıyla yayımlandı.`,
                [{ text: 'Harika!', onPress: () => navigation.goBack() }]
            );
        } catch (hata) {
            console.error('[AgroPi] İlan kayıt hatası:', hata);
            Alert.alert('Hata', 'İlan yayımlanamadı. Lütfen tekrar deneyin.');
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <View style={s.kapsayici}>
            <StatusBar barStyle="light-content" />

            {/* Başlık */}
            <View style={s.header}>
                <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.geriBtnMetin}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={s.headerBaslik}>İş İlanı Ver</Text>
                    <Text style={s.headerAlt}>Doğru uzmana ulaşın</Text>
                </View>
                <View style={s.piRozet}><Text style={s.piRozetMetin}>π</Text></View>
            </View>

            <Animated.ScrollView
                style={{ opacity: fadeAnim }}
                contentContainerStyle={s.kaydirma}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* İş Başlığı */}
                <Text style={s.etiket}>📌 İş Başlığı *</Text>
                <TextInput
                    style={s.input}
                    value={baslik}
                    onChangeText={setBaslik}
                    placeholder="örn. Sera kurulum danışmanı aranıyor"
                    placeholderTextColor={Renkler.metinFade}
                    maxLength={80}
                />
                <Text style={s.karakter}>{baslik.length}/80</Text>

                {/* İş Açıklaması */}
                <Text style={s.etiket}>📝 İş Açıklaması *</Text>
                <TextInput
                    style={[s.input, s.inputCok]}
                    value={aciklama}
                    onChangeText={setAciklama}
                    placeholder="İşin detaylarını, beklentileri ve proje süresini yazın..."
                    placeholderTextColor={Renkler.metinFade}
                    multiline
                    numberOfLines={5}
                    maxLength={500}
                    textAlignVertical="top"
                />
                <Text style={s.karakter}>{aciklama.length}/500</Text>

                {/* Kategori */}
                <Text style={s.etiket}>🏷️ İhtiyaç Duyulan Uzmanlık *</Text>
                <View style={s.kategoriIzgara}>
                    {KATEGORILER.map(k => {
                        const secili = kategori?.id === k.id;
                        return (
                            <TouchableOpacity
                                key={k.id}
                                style={[s.katKart, secili && s.katKartSecili]}
                                onPress={() => setKategori(k)}
                                activeOpacity={0.75}
                            >
                                <Text style={s.katEmoji}>{k.emoji}</Text>
                                <Text style={[s.katMetin, secili && s.katMetinSecili]} numberOfLines={2}>
                                    {k.ad}
                                </Text>
                                {secili && <View style={s.checkIsareti}><Text style={s.checkMetin}>✓</Text></View>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Bütçe */}
                <Text style={s.etiket}>💵 Bütçe (USD) *</Text>
                <View style={s.butceSarici}>
                    <Text style={s.butceDolar}>$</Text>
                    <TextInput
                        style={s.butceInput}
                        value={butce}
                        onChangeText={setButce}
                        placeholder="0.00"
                        placeholderTextColor={Renkler.metinFade}
                        keyboardType="decimal-pad"
                    />
                    <Text style={s.butceSaat}>USD / toplam</Text>
                </View>

                {/* Bilgi kutusu */}
                <View style={s.bilgiKutu}>
                    <Text style={s.bilgiMetin}>
                        💡 İlanınız yayımlandıktan sonra uygun uzmanlar sizinle iletişime geçebilir.
                        Ödeme Pi Network üzerinden güvenli şekilde yapılır.
                    </Text>
                </View>

                {/* Yayımla Butonu */}
                <TouchableOpacity
                    style={[s.yayimlaBtn, yukleniyor && { opacity: 0.7 }]}
                    onPress={ilaniYayimla}
                    disabled={yukleniyor}
                    activeOpacity={0.85}
                >
                    {yukleniyor
                        ? <ActivityIndicator color={Renkler.zeminkk} />
                        : <Text style={s.yayimlaBtnMetin}>🚀 İlanı Yayımla</Text>
                    }
                </TouchableOpacity>

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
        paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: Renkler.ayirici,
    },
    geriBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Renkler.kartZemin, borderWidth: 1,
        borderColor: Renkler.ayirici, justifyContent: 'center', alignItems: 'center',
    },
    geriBtnMetin: { fontSize: 20, color: Renkler.metinAna, fontWeight: '700' },
    headerBaslik: { fontSize: 20, fontWeight: '800', color: Renkler.metinAna },
    headerAlt: { fontSize: 12, color: Renkler.metinFade, marginTop: 2 },
    piRozet: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Renkler.yarimSeffafAltin, borderWidth: 1.5, borderColor: Renkler.piAltin,
        justifyContent: 'center', alignItems: 'center',
    },
    piRozetMetin: { fontSize: 18, color: Renkler.piAltin, fontWeight: '900' },

    // Form
    kaydirma: { padding: 20, paddingTop: 24 },
    etiket: {
        fontSize: 13, fontWeight: '700', color: Renkler.metinIkincil,
        marginBottom: 10, marginTop: 20, letterSpacing: 0.4,
    },
    input: {
        backgroundColor: Renkler.girdiZemin, borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 15, color: Renkler.metinAna,
        borderWidth: 1, borderColor: Renkler.ayirici,
    },
    inputCok: { height: 120, textAlignVertical: 'top', paddingTop: 14 },
    karakter: { fontSize: 11, color: Renkler.metinFade, textAlign: 'right', marginTop: 4 },

    // Kategori kart ızgarası
    kategoriIzgara: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    katKart: {
        width: '47%', backgroundColor: Renkler.kartZemin,
        borderRadius: 14, padding: 14, alignItems: 'center',
        borderWidth: 1.5, borderColor: Renkler.ayirici, position: 'relative',
    },
    katKartSecili: { borderColor: Renkler.piAltin, backgroundColor: Renkler.yarimSeffafAltin },
    katEmoji: { fontSize: 26, marginBottom: 8 },
    katMetin: { fontSize: 12, fontWeight: '600', color: Renkler.metinIkincil, textAlign: 'center' },
    katMetinSecili: { color: Renkler.piAltin },
    checkIsareti: {
        position: 'absolute', top: 8, right: 8,
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: Renkler.piAltin, justifyContent: 'center', alignItems: 'center',
    },
    checkMetin: { fontSize: 11, color: Renkler.zeminkk, fontWeight: '900' },

    // Bütçe satırı
    butceSarici: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Renkler.girdiZemin, borderRadius: 14,
        borderWidth: 1, borderColor: Renkler.ayirici, overflow: 'hidden',
    },
    butceDolar: {
        paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 22, color: '#4CAF50', fontWeight: '800',
        borderRightWidth: 1, borderRightColor: Renkler.ayirici,
    },
    butceInput: {
        flex: 1, paddingHorizontal: 14, fontSize: 20,
        color: Renkler.metinAna, fontWeight: '700',
    },
    butceSaat: {
        paddingHorizontal: 12, fontSize: 12, color: Renkler.metinFade,
    },

    // Bilgi kutusu
    bilgiKutu: {
        marginTop: 24, backgroundColor: 'rgba(66,165,245,0.08)',
        borderRadius: 14, padding: 14, borderWidth: 1,
        borderColor: 'rgba(66,165,245,0.25)',
    },
    bilgiMetin: { fontSize: 13, color: Renkler.bilgi, lineHeight: 20 },

    // Yayımla butonu
    yayimlaBtn: {
        backgroundColor: Renkler.piAltin, borderRadius: 16,
        paddingVertical: 18, alignItems: 'center',
        marginTop: 28,
        shadowColor: Renkler.piAltin, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
    yayimlaBtnMetin: { fontSize: 16, fontWeight: '800', color: Renkler.zeminkk, letterSpacing: 0.3 },
});
