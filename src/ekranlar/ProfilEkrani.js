// AgroPi Marketplace — Profilim Ekranı (Düzenlenebilir)
// Uzmanlar tüm profil bilgilerini görüntüler ve düzenleyebilir

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Alert, TextInput, ActivityIndicator, Animated,
} from 'react-native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { cikisYap as piCikisYap } from '../pi/PiAuthService';
import Renkler from '../tema/renkler';
import PiSabitleri from '../pi/PiSabitleri';

const DEMO_PROFIL = {
    ad: 'Umut Çetiner',
    kategori: 'Tarım Yatırımcısı',
    kategoriEmoji: '💼',
    konum: 'İstanbul',
    puan: 4.8,
    yorumSayisi: 12,
    ucret: 5.0,
    biyografi: 'Pi ekosistemi ve tarım teknolojileri girişimcisi.',
    piKullaniciAdi: 'umutcetiner07',
    kullaniciId: 'demo_uzman_001',
    toplamKazanc: 0,
    tamamlananDanismanlik: 0,
    usdUcret: 80,
    hizmetBolgesi: 'Tüm Türkiye',
    deneyimYili: 7,
    referansProje: 'AgroPi Marketplace Geliştirme',
};

export default function ProfilEkrani() {
    const [profil, setProfil] = useState(DEMO_PROFIL);
    const [duzenleme, setDuzenleme] = useState(false);
    const [form, setForm] = useState({ ...DEMO_PROFIL });
    const [kaydediyor, setKaydediyor] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const duzenlemeAc = () => {
        setForm({ ...profil });
        setDuzenleme(true);
    };

    const iptalEt = () => {
        setDuzenleme(false);
        setForm({ ...profil });
    };

    const kaydet = async () => {
        if (!form.ad?.trim()) {
            Alert.alert('Hata', 'Ad boş bırakılamaz.'); return;
        }
        setKaydediyor(true);
        try {
            const guncelleme = {
                ...form,
                usdUcret: form.usdUcret ? parseFloat(form.usdUcret) : 0,
                deneyimYili: form.deneyimYili ? parseInt(form.deneyimYili, 10) : 0,
                guncellenmeTarihi: serverTimestamp(),
            };
            if (db) {
                await setDoc(
                    doc(db, 'uzmanlar', profil.kullaniciId),
                    guncelleme,
                    { merge: true }
                );
            }
            setProfil(guncelleme);
            setDuzenleme(false);
            Alert.alert('✅ Kaydedildi', 'Profiliniz güncellendi.');
        } catch (e) {
            console.error('[AgroPi] Profil kayıt hatası:', e);
            Alert.alert('Hata', 'Profil kaydedilemedi.');
        } finally {
            setKaydediyor(false);
        }
    };

    const cikisYap = () => {
        Alert.alert('Çıkış Yap', 'Oturumu kapatmak istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Çıkış Yap', style: 'destructive', onPress: () =>
                    console.log('[AgroPi] Kullanıcı çıkış yaptı.')
            },
        ]);
    };

    // --- Düzenleme formu ---
    if (duzenleme) {
        return (
            <View style={s.kapsayici}>
                <StatusBar barStyle="light-content" />
                <View style={s.header}>
                    <TouchableOpacity onPress={iptalEt} style={s.geriBtn}>
                        <Text style={s.geriBtnMetin}>✕</Text>
                    </TouchableOpacity>
                    <Text style={s.headerBaslik}>Profili Düzenle</Text>
                    <TouchableOpacity
                        style={[s.kaydetBtn, kaydediyor && { opacity: 0.6 }]}
                        onPress={kaydet} disabled={kaydediyor}
                    >
                        {kaydediyor
                            ? <ActivityIndicator color={Renkler.zeminkk} size="small" />
                            : <Text style={s.kaydetBtnMetin}>Kaydet</Text>
                        }
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={s.formKaydirma} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {[
                        { label: '👤 Ad Soyad *', key: 'ad', placeholder: 'Ad Soyad' },
                        { label: '📍 Konum', key: 'konum', placeholder: 'Şehir' },
                        { label: '🗺️ Hizmet Bölgesi', key: 'hizmetBolgesi', placeholder: 'Ege, Marmara...' },
                        { label: '📅 Deneyim Yılı', key: 'deneyimYili', placeholder: '5', keyboard: 'number-pad' },
                        { label: '💵 Saatlik USD Ücreti', key: 'usdUcret', placeholder: '50', keyboard: 'decimal-pad' },
                        { label: '🏆 Referans Proje', key: 'referansProje', placeholder: 'Proje adı' },
                    ].map(alan => (
                        <View key={alan.key}>
                            <Text style={s.formEtiket}>{alan.label}</Text>
                            <TextInput
                                style={s.formInput}
                                value={String(form[alan.key] ?? '')}
                                onChangeText={v => setForm(f => ({ ...f, [alan.key]: v }))}
                                placeholder={alan.placeholder}
                                placeholderTextColor={Renkler.metinFade}
                                keyboardType={alan.keyboard || 'default'}
                            />
                        </View>
                    ))}

                    <Text style={s.formEtiket}>📝 Biyografi</Text>
                    <TextInput
                        style={[s.formInput, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                        value={form.biyografi ?? ''}
                        onChangeText={v => setForm(f => ({ ...f, biyografi: v }))}
                        placeholder="Kendinizi tanıtın..."
                        placeholderTextColor={Renkler.metinFade}
                        multiline
                    />
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        );
    }

    // --- Görüntüleme modu ---
    return (
        <View style={s.kapsayici}>
            <StatusBar barStyle="light-content" />
            <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>

                {/* Profil Header */}
                <View style={s.profilHeader}>
                    <View style={s.avatarDaire}>
                        <Text style={s.avatarEmoji}>{profil.kategoriEmoji}</Text>
                    </View>
                    <Text style={s.ad}>{profil.ad}</Text>
                    <View style={s.piSatiri}>
                        <Text style={s.piSimge}>π</Text>
                        <Text style={s.piKullanici}>{profil.piKullaniciAdi}</Text>
                    </View>
                    <View style={s.kategoriEtiket}>
                        <Text style={s.kategoriMetin}>{profil.kategoriEmoji} {profil.kategori}</Text>
                    </View>
                    <Text style={s.konum}>📍 {profil.konum}</Text>
                    <TouchableOpacity style={s.duzenleBtn} onPress={duzenlemeAc}>
                        <Text style={s.duzenleMetin}>✏️ Profili Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {/* İstatistikler */}
                <View style={s.istatistikler}>
                    {[
                        { deger: `π ${profil.ucret}`, etiket: '/saat (Pi)' },
                        { deger: `$${profil.usdUcret}`, etiket: '/saat (USD)' },
                        { deger: profil.tamamlananDanismanlik, etiket: 'Danışmanlık' },
                        { deger: `${profil.puan} ⭐`, etiket: `${profil.yorumSayisi} yorum` },
                    ].map((item, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <View style={s.ayiriciDik} />}
                            <View style={s.istatKutu}>
                                <Text style={s.istatDeger}>{item.deger}</Text>
                                <Text style={s.istatEtiket}>{item.etiket}</Text>
                            </View>
                        </React.Fragment>
                    ))}
                </View>

                {/* Profil Detayları */}
                <View style={s.bolum}>
                    <Text style={s.bolumBaslik}>Profil Bilgileri</Text>
                    <View style={s.bilgiKart}>
                        {[
                            { ikon: '🗺️', etiket: 'Hizmet Bölgesi', deger: profil.hizmetBolgesi },
                            { ikon: '📅', etiket: 'Deneyim', deger: `${profil.deneyimYili} yıl` },
                            { ikon: '🏆', etiket: 'Referans Proje', deger: profil.referansProje },
                            { ikon: '🌐', etiket: 'Pi Ortamı', deger: PiSabitleri.ORTAM === 'sandbox' ? '🔧 Sandbox' : '🟢 Production' },
                        ].map(({ ikon, etiket, deger }) => deger ? (
                            <View key={etiket} style={s.bilgiSatiri}>
                                <Text style={s.bilgiIkon}>{ikon}</Text>
                                <Text style={s.bilgiEtiket}>{etiket}</Text>
                                <Text style={s.bilgiDeger} numberOfLines={1}>{deger}</Text>
                            </View>
                        ) : null)}
                    </View>
                </View>

                {/* Biyografi */}
                {!!profil.biyografi && (
                    <View style={s.bolum}>
                        <Text style={s.bolumBaslik}>Hakkımda</Text>
                        <Text style={s.biyografi}>{profil.biyografi}</Text>
                    </View>
                )}

                {/* Çıkış */}
                <TouchableOpacity style={s.cikisButon} onPress={cikisYap}>
                    <Text style={s.cikisMetin}>Oturumu Kapat</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    kapsayici: { flex: 1, backgroundColor: Renkler.zemin },

    // Header (düzenleme modu)
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: Renkler.ayirici,
    },
    geriBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Renkler.kartZemin,
        borderWidth: 1, borderColor: Renkler.ayirici, justifyContent: 'center', alignItems: 'center',
    },
    geriBtnMetin: { fontSize: 18, color: Renkler.metinAna, fontWeight: '700' },
    headerBaslik: { fontSize: 18, fontWeight: '800', color: Renkler.metinAna },
    kaydetBtn: {
        backgroundColor: Renkler.piAltin, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 8,
    },
    kaydetBtnMetin: { fontSize: 14, fontWeight: '800', color: Renkler.zeminkk },

    // Form
    formKaydirma: { padding: 20 },
    formEtiket: {
        fontSize: 12, fontWeight: '700', color: Renkler.metinIkincil,
        marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    formInput: {
        backgroundColor: Renkler.girdiZemin, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 13,
        fontSize: 15, color: Renkler.metinAna, borderWidth: 1, borderColor: Renkler.ayirici,
    },

    // Profil header (görüntüleme)
    profilHeader: {
        alignItems: 'center', paddingTop: 72, paddingBottom: 24, paddingHorizontal: 24,
        borderBottomWidth: 1, borderBottomColor: Renkler.ayirici,
    },
    avatarDaire: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: Renkler.yarimSeffafAltin, borderWidth: 2, borderColor: Renkler.piAltin,
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
        shadowColor: Renkler.piAltin, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
    },
    avatarEmoji: { fontSize: 44 },
    ad: { fontSize: 22, fontWeight: '800', color: Renkler.metinAna, marginBottom: 6 },
    piSatiri: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    piSimge: { fontSize: 14, color: Renkler.piMorAcik, fontWeight: '900' },
    piKullanici: { fontSize: 14, color: Renkler.piMorAcik },
    kategoriEtiket: {
        backgroundColor: Renkler.yarimSeffafAltin, borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1,
        borderColor: Renkler.piAltin, marginBottom: 8,
    },
    kategoriMetin: { fontSize: 13, color: Renkler.piAltin, fontWeight: '700' },
    konum: { fontSize: 13, color: Renkler.metinFade, marginBottom: 16 },
    duzenleBtn: {
        backgroundColor: Renkler.kartZemin, borderRadius: 20,
        paddingHorizontal: 18, paddingVertical: 9, borderWidth: 1.5, borderColor: Renkler.piAltin,
    },
    duzenleMetin: { fontSize: 13, color: Renkler.piAltin, fontWeight: '700' },

    // İstatistikler
    istatistikler: {
        flexDirection: 'row', justifyContent: 'space-around',
        backgroundColor: Renkler.kartZemin, marginHorizontal: 16, marginTop: 16,
        borderRadius: 16, paddingVertical: 18, borderWidth: 1, borderColor: Renkler.ayirici,
    },
    istatKutu: { alignItems: 'center', flex: 1 },
    istatDeger: { fontSize: 16, fontWeight: '800', color: Renkler.piAltin },
    istatEtiket: { fontSize: 11, color: Renkler.metinFade, marginTop: 3, textAlign: 'center' },
    ayiriciDik: { width: 1, height: 36, backgroundColor: Renkler.ayirici },

    // Bölümler
    bolum: { paddingHorizontal: 20, paddingTop: 24 },
    bolumBaslik: {
        fontSize: 12, fontWeight: '700', color: Renkler.metinIkincil,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
    },
    bilgiKart: {
        backgroundColor: Renkler.kartZemin, borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: Renkler.ayirici, gap: 10,
    },
    bilgiSatiri: { flexDirection: 'row', alignItems: 'center' },
    bilgiIkon: { fontSize: 16, width: 28 },
    bilgiEtiket: { fontSize: 13, color: Renkler.metinFade, width: 110 },
    bilgiDeger: { fontSize: 13, color: Renkler.metinAna, fontWeight: '600', flex: 1 },

    biyografi: { fontSize: 14, color: Renkler.metinAna, lineHeight: 22 },

    // Çıkış
    cikisButon: {
        marginHorizontal: 20, marginTop: 28, paddingVertical: 14, borderRadius: 14,
        borderWidth: 1.5, borderColor: 'rgba(239,83,80,0.35)', alignItems: 'center',
        backgroundColor: 'rgba(239,83,80,0.08)',
    },
    cikisMetin: { fontSize: 15, fontWeight: '700', color: Renkler.hata },
});
