// AgroPi Marketplace — Gelişmiş Uzman Kart Bileşeni
// Profesyonel hiyerarşi: Branş badge + Bölge + Deneyim + USD ücret

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Renkler from '../tema/renkler';

// Kategori → renk eşleştirmesi
const KATEGORI_RENK = {
    'Topraksız Tarım Uzmanı': { bg: 'rgba(82,183,136,0.15)', border: '#52B788', text: '#52B788' },
    'Ziraat Mühendisi': { bg: 'rgba(240,192,64,0.15)', border: '#F0C040', text: '#F0C040' },
    'Tarım Teknisyeni': { bg: 'rgba(66,165,245,0.15)', border: '#42A5F5', text: '#42A5F5' },
    'Üretim Müdürü': { bg: 'rgba(255,152,0,0.15)', border: '#FF9800', text: '#FF9800' },
};

export default function UzmanKarti({ uzman, onBasildi, gecikme = 0 }) {
    const slideAnim = useRef(new Animated.Value(24)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 380, delay: gecikme, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 380, delay: gecikme, useNativeDriver: true }),
        ]).start();
    }, []);

    const kategoriRenk = KATEGORI_RENK[uzman.kategori] || {
        bg: 'rgba(155,114,232,0.15)', border: '#9B72E8', text: '#9B72E8',
    };

    const yildizStr = (p) => '⭐'.repeat(Math.floor(p)) + (p % 1 >= 0.5 ? '✨' : '');

    return (
        <Animated.View style={[stiller.sarici, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={stiller.kart} onPress={onBasildi} activeOpacity={0.82}>

                {/* ── ÜSTÜ: Avatar + İsim + Durum noktası ── */}
                <View style={stiller.ustSatir}>
                    {/* Avatar */}
                    <View style={[stiller.avatar, { borderColor: kategoriRenk.border }]}>
                        <Text style={stiller.avatarEmoji}>{uzman.kategoriEmoji}</Text>
                    </View>

                    {/* İsim + durum + badge */}
                    <View style={stiller.ustSagKolon}>
                        <View style={stiller.isimSatiri}>
                            <Text style={stiller.isim} numberOfLines={1}>{uzman.ad}</Text>
                            <View style={[stiller.durumNokta, uzman.aktif ? stiller.aktif : stiller.pasif]} />
                        </View>

                        {/* 🔖 Branş badge */}
                        <View style={[stiller.badge, { backgroundColor: kategoriRenk.bg, borderColor: kategoriRenk.border }]}>
                            <Text style={[stiller.badgeMetin, { color: kategoriRenk.text }]}>
                                {uzman.kategoriEmoji} {uzman.kategori}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── BİYOGRAFİ ── */}
                {!!uzman.biyografi && (
                    <Text style={stiller.biyografi} numberOfLines={2}>{uzman.biyografi}</Text>
                )}

                {/* ── BİLGİ SATIRLARI ── */}
                <View style={stiller.bilgiKutu}>
                    {/* Hizmet Bölgesi */}
                    {!!uzman.hizmetBolgesi && (
                        <View style={stiller.bilgiSatir}>
                            <Text style={stiller.bilgiIcon}>🗺️</Text>
                            <Text style={stiller.bilgiEtiket}>Hizmet Bölgesi</Text>
                            <Text style={stiller.bilgiDeger} numberOfLines={1}>{uzman.hizmetBolgesi}</Text>
                        </View>
                    )}
                    {/* Deneyim Yılı */}
                    {uzman.deneyimYili > 0 && (
                        <View style={stiller.bilgiSatir}>
                            <Text style={stiller.bilgiIcon}>📅</Text>
                            <Text style={stiller.bilgiEtiket}>Deneyim</Text>
                            <Text style={stiller.bilgiDeger}>{uzman.deneyimYili} yıl</Text>
                        </View>
                    )}
                    {/* Saatlik USD */}
                    {uzman.usdUcret > 0 && (
                        <View style={stiller.bilgiSatir}>
                            <Text style={stiller.bilgiIcon}>💵</Text>
                            <Text style={stiller.bilgiEtiket}>Saatlik Ücret</Text>
                            <Text style={[stiller.bilgiDeger, stiller.bilgiYesil]}>${uzman.usdUcret} / saat</Text>
                        </View>
                    )}
                    {/* Referans Proje */}
                    {!!uzman.referansProje && (
                        <View style={stiller.bilgiSatir}>
                            <Text style={stiller.bilgiIcon}>🏆</Text>
                            <Text style={stiller.bilgiEtiket}>Referans</Text>
                            <Text style={[stiller.bilgiDeger, stiller.bilgiAltin]} numberOfLines={1}>
                                {uzman.referansProje}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── ALT: Puan + Pi Ücreti + Konum ── */}
                <View style={stiller.altSatir}>
                    <View style={stiller.puanSol}>
                        <Text style={stiller.yildizlar}>{yildizStr(uzman.puan)}</Text>
                        <Text style={stiller.puanMetin}>{uzman.puan} ({uzman.yorumSayisi} yorum)</Text>
                    </View>
                    <View style={stiller.ucretSag}>
                        <Text style={stiller.konumMetin}>📍 {uzman.konum}</Text>
                        <View style={stiller.piUcret}>
                            <Text style={stiller.piSembol}>π</Text>
                            <Text style={stiller.piMiktar}>{uzman.ucret}</Text>
                            <Text style={stiller.piSaat}>/sa</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const stiller = StyleSheet.create({
    sarici: { marginBottom: 14 },
    kart: {
        backgroundColor: Renkler.kartZemin,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: Renkler.ayirici,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },

    // Üst satır
    ustSatir: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    avatarEmoji: { fontSize: 26 },
    ustSagKolon: { flex: 1 },
    isimSatiri: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    isim: { fontSize: 16, fontWeight: '800', color: Renkler.metinAna, flex: 1 },
    durumNokta: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
    aktif: { backgroundColor: Renkler.basarili },
    pasif: { backgroundColor: Renkler.metinFade },

    // Branş badge
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeMetin: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

    // Biyografi
    biyografi: {
        fontSize: 13, color: Renkler.metinIkincil,
        lineHeight: 19, marginBottom: 12,
    },

    // Bilgi kutusu
    bilgiKutu: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Renkler.ayirici,
        marginBottom: 12,
        gap: 2,
    },
    bilgiSatir: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    bilgiIcon: { fontSize: 14, marginRight: 8, width: 20 },
    bilgiEtiket: { fontSize: 12, color: Renkler.metinFade, width: 90, fontWeight: '500' },
    bilgiDeger: { fontSize: 12, color: Renkler.metinAna, fontWeight: '600', flex: 1 },
    bilgiYesil: { color: '#4CAF50' },
    bilgiAltin: { color: Renkler.piAltin, fontStyle: 'italic' },

    // Alt satır
    altSatir: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: Renkler.ayirici, paddingTop: 10,
    },
    puanSol: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    yildizlar: { fontSize: 11 },
    puanMetin: { fontSize: 11, color: Renkler.metinFade },
    ucretSag: { alignItems: 'flex-end', gap: 2 },
    konumMetin: { fontSize: 11, color: Renkler.metinFade },
    piUcret: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    piSembol: { fontSize: 14, color: Renkler.piAltin, fontWeight: '900' },
    piMiktar: { fontSize: 20, fontWeight: '800', color: Renkler.piAltin },
    piSaat: { fontSize: 12, color: Renkler.metinFade },
});
