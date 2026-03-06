// AgroPi Marketplace — Uygulama Giriş Noktası
// Firebase tam yüklenmeden render etmez — loading spinner ile bekler
// Pi Network SDK entegrasyonu eklendi

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppNavigator from './src/navigasyon/AppNavigator';
import { PiSabitleri } from './src/pi/PiSabitleri';

export default function App() {
    const [firebaseHazir, setFirebaseHazir] = useState(false);
    const [piHazir, setPiHazir] = useState(false);
    const [kullanici, setKullanici] = useState(null);
    const [hata, setHata] = useState(null);

    // Pi Network kimlik doğrulama fonksiyonu
    const piAuthenticate = async () => {
        try {
            console.log('[AgroPi] Pi Network kimlik doğrulaması başlatılıyor...');
            
            if (typeof window !== 'undefined' && window.Pi) {
                const authResult = await window.Pi.authenticate([
                    'username',
                    'uid'
                ], {
                    onIncompletePaymentFound: (payment) => {
                        console.log('[AgroPi] Tamamlanmamış ödeme bulundu:', payment);
                    }
                });

                // Kullanıcı bilgilerini state'e kaydet
                setKullanici({
                    uid: authResult.user.uid,
                    username: authResult.user.username
                });

                console.log('[AgroPi] Kullanıcı başarıyla giriş yaptı:');
                console.log('UID:', authResult.user.uid);
                console.log('Username:', authResult.user.username);

            } else {
                console.error('[AgroPi] Pi SDK mevcut değil');
                setHata('Pi Network SDK mevcut değil');
            }
        } catch (err) {
            console.error('[AgroPi] Kimlik doğrulama hatası:', err);
            setHata(err.message);
        }
    };

    useEffect(() => {
        const uygulamayiBaslat = async () => {
            try {
                // 1. Pi Network SDK başlatma
                console.log('[AgroPi] Pi Network SDK başlatılıyor...');
                
                // Pi Browser kontrolü
                const userAgent = navigator?.userAgent || '';
                const piBrowserMi = userAgent.includes(PiSabitleri.PI_BROWSER_UA);
                
                if (!piBrowserMi) {
                    console.warn('[AgroPi] Pi Browser tespit edilemedi, mock modda çalışılıyor');
                }

                // Pi Network başlatma (Pi Browser içinde)
                if (typeof window !== 'undefined' && window.Pi) {
                    await window.Pi.init({
                        version: PiSabitleri.ORTAM === 'production' ? '2.0' : '1.0',
                        sandbox: PiSabitleri.ORTAM === 'sandbox',
                        appId: PiSabitleri.APP_ID
                    });
                    console.log('[AgroPi] Pi Network SDK başarıyla başlatıldı');
                } else {
                    console.log('[AgroPi] Pi SDK mevcut değil, development modunda devam ediliyor');
                }
                
                setPiHazir(true);

                // 2. Firebase başlatma
                console.log('[AgroPi] Firebase başlatılıyor...');
                await import('./src/config/firebase');
                console.log('[AgroPi] Firebase başarıyla başlatıldı');
                setFirebaseHazir(true);

            } catch (err) {
                console.error('[AgroPi] Uygulama başlatma hatası:', err);
                setHata(err.message);
                // Hata olsa bile uygulamayı göster
                setPiHazir(true);
                setFirebaseHazir(true);
            }
        };

        uygulamayiBaslat();
    }, []);

    // Pi ve Firebase yüklenene kadar spinner göster
    if (!piHazir || !firebaseHazir) {
        return (
            <View style={stiller.yukleniyor}>
                <Text style={stiller.logoMetin}>🌾π</Text>
                <ActivityIndicator
                    color="#F0C040"
                    size="large"
                    style={{ marginTop: 20 }}
                />
                <Text style={stiller.altMetin}>
                    {!piHazir ? 'Pi Network bağlanıyor...' : 'Firebase yükleniyor...'}
                </Text>
            </View>
        );
    }

    // Kullanıcı giriş yapmadıysa giriş butonu göster
    if (!kullanici) {
        return (
            <View style={stiller.girisEkrani}>
                <Text style={stiller.logoMetin}>🌾π</Text>
                <Text style={stiller.baslik}>AgroPi Marketplace</Text>
                <Text style={stiller.aciklama}>
                    AI destekli topraksız tarım ve lojistik yönetimi platformuna hoş geldiniz
                </Text>
                
                <TouchableOpacity 
                    style={stiller.girisButonu} 
                    onPress={piAuthenticate}
                >
                    <Text style={stiller.girisButonuMetin}>Pi Network ile Giriş Yap</Text>
                </TouchableOpacity>

                {hata && (
                    <Text style={stiller.hataMetni}>{hata}</Text>
                )}
            </View>
        );
    }

    return <AppNavigator kullanici={kullanici} />;
}

const stiller = StyleSheet.create({
    yukleniyor: {
        flex: 1,
        backgroundColor: '#12091F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoMetin: {
        fontSize: 52,
    },
    altMetin: {
        color: '#7A6A9A',
        fontSize: 14,
        marginTop: 16,
    },
    girisEkrani: {
        flex: 1,
        backgroundColor: '#12091F',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    baslik: {
        color: '#F0C040',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    aciklama: {
        color: '#7A6A9A',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    girisButonu: {
        backgroundColor: '#F0C040',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        minWidth: 250,
    },
    girisButonuMetin: {
        color: '#12091F',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    hataMetni: {
        color: '#FF6B6B',
        fontSize: 14,
        marginTop: 20,
        textAlign: 'center',
    },
});
