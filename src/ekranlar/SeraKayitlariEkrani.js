// AgroPi Marketplace — Sera Kayıtları Ekranı (Greenhouse Logs)
// Adım 9: pH Seviyesi, EC Seviyesi, Bitki Büyüme Durumu → greenhouse_logs koleksiyonu

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    StatusBar, ScrollView, Animated, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { kaydedilmisOturumAl } from '../pi/PiAuthService';
import Renkler from '../tema/renkler';

// Demo kayıtlar (Firebase bağlanana kadar gösterilir)
const DEMO_KAYITLAR = [
    {
        id: 'demo1',
        phSeviyesi: 6.2,
        ecSeviyesi: 1.8,
        bitkiBuyumeDurumu: 'Fideler sağlıklı görünüyor, kök gelişimi iyi.',
        olusturmaTarihi: { seconds: Date.now() / 1000 - 3600 },
    },
    {
        id: 'demo2',
        phSeviyesi: 6.5,
        ecSeviyesi: 2.1,
        bitkiBuyumeDurumu: 'Yaprak rengi açık, güneş ışığı artırıldı.',
        olusturmaTarihi: { seconds: Date.now() / 1000 - 86400 },
    },
];

// Zaman biçimleme yardımcısı
function zamanBicimle(timestamp) {
    if (!timestamp) return '—';
    const tarih = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return tarih.toLocaleString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// Kayıt kartı bileşeni
function KayitKarti({ kayit, gecikme }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: gecikme, useNativeDriver: true }).start();
    }, []);

    const phRenk = kayit.phSeviyesi < 5.5 ? Renkler.hata
        : kayit.phSeviyesi > 7.0 ? Renkler.uyari
        : Renkler.basarili;

    const ecRenk = kayit.ecSeviyesi > 3.0 ? Renkler.hata
        : kayit.ecSeviyesi < 1.0 ? Renkler.uyari
        : Renkler.agroYesilAcik;

    return (
        <Animated.View style={[s.kayitSarici, { opacity: fadeAnim }]}>
            <View style={s.kayitKart}>
                {/* Üst satır: pH + EC */}
                <View style={s.olcumSatiri}>
                    <View style={[s.olcumCip, { borderColor: phRenk, backgroundColor: `${phRenk}18` }]}>
                        <Text style={[s.olcumEtiket, { color: phRenk }]}>pH</Text>
                        <Text style={[s.olcumDeger, { color: phRenk }]}>{kayit.phSeviyesi}</Text>
                    </View>
                    <View style={[s.olcumCip, { borderColor: ecRenk, backgroundColor: `${ecRenk}18` }]}>
                        <Text style={[s.olcumEtiket, { color: ecRenk }]}>EC</Text>
                        <Text style={[s.olcumDeger, { color: ecRenk }]}>{kayit.ecSeviyesi}</Text>
                    </View>
                    <View style={s.zamanCip}>
                        <Text style={s.zamanMetin}>{zamanBicimle(kayit.olusturmaTarihi)}</Text>
                    </View>
                </View>

                {/* Bitki büyüme notu */}
                {kayit.bitkiBuyumeDurumu ? (
                    <View style={s.notKutu}>
                        <Text style={s.notEmoji}>🌿</Text>
                        <Text style={s.notMetin}>{kayit.bitkiBuyumeDurumu}</Text>
                    </View>
                ) : null}
            </View>
        </Animated.View>
    );
}

export default function SeraKayitlariEkrani({ navigation }) {
    const [phSeviyesi, setPhSeviyesi] = useState('');
    const [ecSeviyesi, setEcSeviyesi] = useState('');
    const [bitkiBuyumeDurumu, setBitkiBuyumeDurumu] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [kayitlar, setKayitlar] = useState(DEMO_KAYITLAR);
    const [listeYukleniyor, setListeYukleniyor] = useState(false);
    const [piKullanici, setPiKullanici] = useState(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
        kayitlariYukle();
        // Pi oturumunu al
        kaydedilmisOturumAl().then(k => { if (k) setPiKullanici(k); });
    }, []);

    const kayitlariYukle = async () => {
        if (!db) return;
        try {
            setListeYukleniyor(true);
            const q = query(
                collection(db, 'greenhouse_logs'),
                orderBy('olusturmaTarihi', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const veriler = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setKayitlar(veriler);
            }
        } catch (e) {
            console.warn('[AgroPi] Sera kayıtları yüklenemedi:', e.message);
        } finally {
            setListeYukleniyor(false);
        }
    };

    const kayitKaydet = async () => {
        const ph = parseFloat(phSeviyesi);
        const ec = parseFloat(ecSeviyesi);

        if (isNaN(ph) || ph < 0 || ph > 14) {
            Alert.alert('Geçersiz pH', 'pH değeri 0 ile 14 arasında olmalıdır.'); return;
        }
        if (isNaN(ec) || ec < 0) {
            Alert.alert('Geçersiz EC', 'EC değeri 0 veya daha büyük olmalıdır.'); return;
        }

        setYukleniyor(true);
        try {
            const yeniKayit = {
                phSeviyesi: ph,
                ecSeviyesi: ec,
                bitkiBuyumeDurumu: bitkiBuyumeDurumu.trim(),
                olusturmaTarihi: serverTimestamp(),
                // Pi Network kullanıcı bilgileri
                piKullaniciId: piKullanici?.kullaniciId ?? null,
                piKullaniciAdi: piKullanici?.kullaniciAdi ?? null,
            };

            if (db) {
                await addDoc(collection(db, 'greenhouse_logs'), yeniKayit);
                console.log('[AgroPi] Sera kaydı Firestore\'a eklendi');
                await kayitlariYukle();
            } else {
                // Offline: yerel listeye ekle
                const localKayit = {
                    ...yeniKayit,
                    id: `local_${Date.now()}`,
                    olusturmaTarihi: { seconds: Date.now() / 1000 },
                };
                setKayitlar(onceki => [localKayit, ...onceki]);
            }

            setPhSeviyesi('');
            setEcSeviyesi('');
            setBitkiBuyumeDurumu('');

            Alert.alert('Kaydedildi', 'Sera kaydı başarıyla eklendi.');
        } catch (hata) {
            console.error('[AgroPi] Sera kayıt hatası:', hata);
            Alert.alert('Hata', 'Kayıt eklenemedi. Lütfen tekrar deneyin.');
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <View style={s.kapsayici}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.geriBtnMetin}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={s.headerBaslik}>Sera Kayıtları 🌡️</Text>
                    <Text style={s.headerAlt}>pH · EC · Bitki Durumu</Text>
                </View>
                <View style={s.seraRozet}><Text style={s.seraRozetMetin}>🌿</Text></View>
            </View>

            <Animated.ScrollView
                style={{ opacity: fadeAnim, flex: 1 }}
                contentContainerStyle={s.kaydirma}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Form başlığı */}
                <View style={s.formBaslik}>
                    <Text style={s.formBaslikMetin}>Yeni Ölçüm Ekle</Text>
                </View>

                {/* pH Seviyesi */}
                <Text style={s.etiket}>🧪 pH Seviyesi *</Text>
                <TextInput
                    style={s.input}
                    value={phSeviyesi}
                    onChangeText={setPhSeviyesi}
                    placeholder="örn. 6.5 (0 - 14 arası)"
                    placeholderTextColor={Renkler.metinFade}
                    keyboardType="decimal-pad"
                />

                {/* EC Seviyesi */}
                <Text style={s.etiket}>⚡ EC Seviyesi *</Text>
                <TextInput
                    style={s.input}
                    value={ecSeviyesi}
                    onChangeText={setEcSeviyesi}
                    placeholder="örn. 1.8 (mS/cm)"
                    placeholderTextColor={Renkler.metinFade}
                    keyboardType="decimal-pad"
                />

                {/* Bitki Büyüme Durumu */}
                <Text style={s.etiket}>🌱 Bitki Büyüme Durumu</Text>
                <TextInput
                    style={[s.input, s.inputCok]}
                    value={bitkiBuyumeDurumu}
                    onChangeText={setBitkiBuyumeDurumu}
                    placeholder="Gözlemlerinizi, notlarınızı buraya yazın..."
                    placeholderTextColor={Renkler.metinFade}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                />
                <Text style={s.karakter}>{bitkiBuyumeDurumu.length}/500</Text>

                {/* Kaydet Butonu */}
                <TouchableOpacity
                    style={[s.kaydetBtn, yukleniyor && { opacity: 0.7 }]}
                    onPress={kayitKaydet}
                    disabled={yukleniyor}
                    activeOpacity={0.85}
                >
                    {yukleniyor
                        ? <ActivityIndicator color={Renkler.zeminkk} />
                        : <Text style={s.kaydetBtnMetin}>💾 Kaydet</Text>
                    }
                </TouchableOpacity>

                {/* Geçmiş Kayıtlar Başlığı */}
                <View style={s.gecmisBaslik}>
                    <Text style={s.gecmisBaslikMetin}>Geçmiş Kayıtlar</Text>
                    <TouchableOpacity onPress={kayitlariYukle}>
                        <Text style={s.yenileMetin}>↻ Yenile</Text>
                    </TouchableOpacity>
                </View>

                {listeYukleniyor ? (
                    <ActivityIndicator color={Renkler.piAltin} style={{ marginVertical: 20 }} />
                ) : kayitlar.length === 0 ? (
                    <View style={s.bos}>
                        <Text style={s.bosEmoji}>📋</Text>
                        <Text style={s.bosMetin}>Henüz kayıt yok</Text>
                    </View>
                ) : (
                    kayitlar.map((kayit, index) => (
                        <KayitKarti key={kayit.id} kayit={kayit} gecikme={index * 60} />
                    ))
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
    seraRozet: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(45,106,79,0.25)', borderWidth: 1.5,
        borderColor: Renkler.agroYesilAcik, justifyContent: 'center', alignItems: 'center',
    },
    seraRozetMetin: { fontSize: 18 },

    // Form
    kaydirma: { padding: 20, paddingTop: 24 },
    formBaslik: {
        marginBottom: 8, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: Renkler.ayirici,
    },
    formBaslikMetin: { fontSize: 16, fontWeight: '800', color: Renkler.metinAna },

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
    inputCok: { height: 110, textAlignVertical: 'top', paddingTop: 14 },
    karakter: { fontSize: 11, color: Renkler.metinFade, textAlign: 'right', marginTop: 4 },

    // Kaydet butonu
    kaydetBtn: {
        backgroundColor: Renkler.agroYesilAcik, borderRadius: 16,
        paddingVertical: 18, alignItems: 'center', marginTop: 28,
        shadowColor: Renkler.agroYesilAcik, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 7,
    },
    kaydetBtnMetin: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

    // Geçmiş başlık
    gecmisBaslik: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 36, marginBottom: 14,
        borderTopWidth: 1, borderTopColor: Renkler.ayirici, paddingTop: 20,
    },
    gecmisBaslikMetin: { fontSize: 16, fontWeight: '800', color: Renkler.metinAna },
    yenileMetin: { fontSize: 13, color: Renkler.piAltin, fontWeight: '700' },

    // Kayıt kartı
    kayitSarici: { marginBottom: 12 },
    kayitKart: {
        backgroundColor: Renkler.kartZemin, borderRadius: 16,
        padding: 14, borderWidth: 1, borderColor: Renkler.ayirici,
    },
    olcumSatiri: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    olcumCip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderRadius: 20, borderWidth: 1,
        paddingHorizontal: 12, paddingVertical: 5,
    },
    olcumEtiket: { fontSize: 11, fontWeight: '700' },
    olcumDeger: { fontSize: 16, fontWeight: '900' },
    zamanCip: { marginLeft: 'auto' },
    zamanMetin: { fontSize: 11, color: Renkler.metinFade },

    // Not kutusu
    notKutu: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        marginTop: 10, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: Renkler.ayirici,
    },
    notEmoji: { fontSize: 14, marginTop: 1 },
    notMetin: { flex: 1, fontSize: 13, color: Renkler.metinIkincil, lineHeight: 19 },

    // Boş durum
    bos: { alignItems: 'center', paddingVertical: 40 },
    bosEmoji: { fontSize: 40, marginBottom: 10 },
    bosMetin: { fontSize: 15, color: Renkler.metinFade },
});
