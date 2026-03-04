// AgroPi Marketplace — Sohbet Ekranı
// İşveren ↔ Uzman bire-bir mesajlaşma ekranı

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import {
    collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Renkler from '../tema/renkler';

// Demo mesajlar (Firestore offline ise)
const DEMO_MESAJLAR = [
    {
        id: 'm0', metin: 'Merhaba! İlanınıza başvurdum, görüşmek ister misiniz?',
        gonderen: 'uzman', zaman: new Date(Date.now() - 600000),
    },
];

export default function SohbetEkrani({ route, navigation }) {
    const { basvuran, ilan } = route.params || {};

    const sohbetId = `${ilan?.id || 'demo'}_${basvuran?.uzmanId || 'uzman'}`;
    const benId = 'isveren_ben'; // Gerçekte Pi kullanıcı ID kullanılır

    const [mesajlar, setMesajlar] = useState(DEMO_MESAJLAR);
    const [metin, setMetin] = useState('');
    const [gonderiyor, setGonderiyor] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const listRef = useRef(null);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

        // Firestore realtime listener
        if (!db) return;
        const q = query(
            collection(db, 'chats', sohbetId, 'messages'),
            orderBy('zaman', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            if (!snap.empty) {
                setMesajlar(snap.docs.map(d => ({
                    id: d.id, ...d.data(),
                    zaman: d.data().zaman?.toDate?.() || new Date(),
                })));
            }
        }, (e) => console.warn('[AgroPi] Sohbet yüklenemedi:', e.message));

        return () => unsubscribe();
    }, []);

    const mesajGonder = async () => {
        if (!metin.trim()) return;
        const metinKopyasi = metin.trim();
        setMetin('');
        setGonderiyor(true);

        const yeniMesaj = {
            id: `local_${Date.now()}`,
            metin: metinKopyasi,
            gonderen: benId,
            zaman: new Date(),
        };
        // Optimistic update
        setMesajlar(prev => [...prev, yeniMesaj]);

        try {
            if (db) {
                await addDoc(collection(db, 'chats', sohbetId, 'messages'), {
                    metin: metinKopyasi,
                    gonderen: benId,
                    zaman: serverTimestamp(),
                });
            }
        } catch (e) {
            console.warn('[AgroPi] Mesaj gönderilemedi:', e.message);
        } finally {
            setGonderiyor(false);
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const zamanStr = (t) => {
        if (!t) return '';
        const d = t instanceof Date ? t : new Date(t);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={s.kapsayici}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.geriBtnMetin}>←</Text>
                </TouchableOpacity>
                <View style={s.headerOrta}>
                    <Text style={s.headerIsim}>{basvuran?.uzmanAd || 'Uzman'}</Text>
                    <Text style={s.headerAlt}>{ilan?.baslik || 'Sohbet'}</Text>
                </View>
                <View style={s.cevrimiciNokta} />
            </View>

            {/* Mesaj Listesi */}
            <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
                <FlatList
                    ref={listRef}
                    data={mesajlar}
                    keyExtractor={m => m.id}
                    contentContainerStyle={s.mesajListe}
                    onContentSizeChange={() => listRef.current?.scrollToEnd()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const benden = item.gonderen === benId;
                        return (
                            <View style={[s.balonSarici, benden ? s.sag : s.sol]}>
                                <View style={[s.balon, benden ? s.balonBen : s.balonKarsi]}>
                                    <Text style={[s.balonMetin, benden && s.balonMetinBen]}>
                                        {item.metin}
                                    </Text>
                                    <Text style={[s.zamanMetin, benden && s.zamanMetinBen]}>
                                        {zamanStr(item.zaman)}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={s.bosListe}>
                            <Text style={s.bosEmoji}>💬</Text>
                            <Text style={s.bosMetin}>Sohbeti siz başlatın!</Text>
                        </View>
                    }
                />
            </Animated.View>

            {/* Input alanı */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={s.inputSatiri}>
                    <TextInput
                        style={s.input}
                        value={metin}
                        onChangeText={setMetin}
                        placeholder="Mesaj yazın..."
                        placeholderTextColor={Renkler.metinFade}
                        multiline
                        maxLength={500}
                        onSubmitEditing={mesajGonder}
                    />
                    <TouchableOpacity
                        style={[s.gonderBtn, (!metin.trim() || gonderiyor) && s.gonderBtnPassif]}
                        onPress={mesajGonder}
                        disabled={!metin.trim() || gonderiyor}
                    >
                        <Text style={s.gonderBtnMetin}>→</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    kapsayici: { flex: 1, backgroundColor: Renkler.zemin },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: Renkler.ayirici, gap: 12,
    },
    geriBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Renkler.kartZemin, borderWidth: 1,
        borderColor: Renkler.ayirici, justifyContent: 'center', alignItems: 'center',
    },
    geriBtnMetin: { fontSize: 20, color: Renkler.metinAna, fontWeight: '700' },
    headerOrta: { flex: 1 },
    headerIsim: { fontSize: 16, fontWeight: '800', color: Renkler.metinAna },
    headerAlt: { fontSize: 11, color: Renkler.metinFade, marginTop: 2 },
    cevrimiciNokta: { width: 10, height: 10, borderRadius: 5, backgroundColor: Renkler.basarili },

    // Mesaj listesi
    mesajListe: { padding: 16, gap: 8 },

    balonSarici: { flexDirection: 'row' },
    sag: { justifyContent: 'flex-end' },
    sol: { justifyContent: 'flex-start' },
    balon: {
        maxWidth: '75%', borderRadius: 18, padding: 12,
    },
    balonBen: {
        backgroundColor: Renkler.piAltin,
        borderBottomRightRadius: 4,
    },
    balonKarsi: {
        backgroundColor: Renkler.kartZemin,
        borderWidth: 1, borderColor: Renkler.ayirici,
        borderBottomLeftRadius: 4,
    },
    balonMetin: { fontSize: 15, color: Renkler.metinIkincil, lineHeight: 21 },
    balonMetinBen: { color: Renkler.zeminkk },
    zamanMetin: { fontSize: 10, color: Renkler.metinFade, marginTop: 4, textAlign: 'right' },
    zamanMetinBen: { color: 'rgba(0,0,0,0.4)' },

    // Boş durum
    bosListe: { flex: 1, alignItems: 'center', paddingTop: 80 },
    bosEmoji: { fontSize: 48, marginBottom: 12 },
    bosMetin: { fontSize: 15, color: Renkler.metinFade },

    // Input
    inputSatiri: {
        flexDirection: 'row', alignItems: 'flex-end', gap: 10,
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: Renkler.ayirici,
        backgroundColor: Renkler.kartZemin,
    },
    input: {
        flex: 1, backgroundColor: Renkler.girdiZemin,
        borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
        fontSize: 15, color: Renkler.metinAna, maxHeight: 100,
        borderWidth: 1, borderColor: Renkler.ayirici,
    },
    gonderBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Renkler.piAltin,
        justifyContent: 'center', alignItems: 'center',
    },
    gonderBtnPassif: { backgroundColor: Renkler.ayirici },
    gonderBtnMetin: { fontSize: 20, color: Renkler.zeminkk, fontWeight: '900' },
});
