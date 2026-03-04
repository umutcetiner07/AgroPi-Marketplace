// AgroPi Marketplace — Giriş Ekranı
// Pi Network hesabıyla giriş yapılan ekran.
// AgroPi-v2'deki Pi.authenticate() akışı buraya uyarlandı.

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Animated,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { piSDKBaslat, piIleGirisYap } from '../pi/PiAuthService';
import { piBrowserMi } from '../pi/PiSDKKoprusu';
import Renkler from '../tema/renkler';

const { width, height } = Dimensions.get('window');

export default function GirisEkrani({ navigation }) {
    const [yukleniyor, setYukleniyor] = useState(false);
    const [mockMod, setMockMod] = useState(false);

    // Animasyonlar
    const logoBuyume = useRef(new Animated.Value(0.7)).current;
    const soluklamaAnim = useRef(new Animated.Value(0)).current;
    const asagiAnim = useRef(new Animated.Value(40)).current;
    const donmeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setMockMod(!piBrowserMi());

        // Pi SDK'yı sandbox modunda başlat
        piSDKBaslat();

        // Giriş animasyonları
        Animated.parallel([
            Animated.spring(logoBuyume, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }),
            Animated.timing(soluklamaAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(asagiAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        // Arka plan orb animasyonu
        Animated.loop(
            Animated.timing(donmeAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
        ).start();
    }, []);

    const orbDonme = donmeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Pi ile giriş yap
    const girisYap = async () => {
        setYukleniyor(true);
        try {
            // PiAuthService: Pi.authenticate → Firestore eşleştir → AsyncStorage kaydet
            const tamProfil = await piIleGirisYap();

            if (tamProfil.profilTamamlandi) {
                // Mevcut kullanıcı → doğrudan uygulamaya
                navigation.replace('AnaTabs', { piKullanici: tamProfil });
            } else {
                // Yeni kullanıcı → profil tamamlama ekranı
                navigation.navigate('ProfilTamamlama', {
                    piKullanici: tamProfil,
                    yeniKullanici: true,
                });
            }
        } catch (hata) {
            Alert.alert(
                'Giriş Başarısız',
                hata.message || 'Pi Network ile bağlantı kurulamadı.',
                [{ text: 'Tamam' }]
            );
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <View style={stiller.kapsayici}>
            <StatusBar barStyle="light-content" backgroundColor={Renkler.zeminkk} />

            {/* Arka plan dekoratif orb */}
            <Animated.View
                style={[stiller.orb, { transform: [{ rotate: orbDonme }] }]}
            />
            <View style={stiller.orb2} />

            {/* Ana içerik */}
            <Animated.View
                style={[
                    stiller.icerik,
                    { opacity: soluklamaAnim, transform: [{ translateY: asagiAnim }] },
                ]}
            >
                {/* Logo alanı */}
                <Animated.View
                    style={[stiller.logoBolum, { transform: [{ scale: logoBuyume }] }]}
                >
                    <View style={stiller.logoHalka}>
                        <View style={stiller.logoIcHalka}>
                            <Text style={stiller.logoEmoji}>π</Text>
                        </View>
                    </View>
                    <Text style={stiller.uygulamaAdi}>AgroPi</Text>
                    <Text style={stiller.uygulamaAltAdi}>Marketplace</Text>
                </Animated.View>

                {/* Slogan */}
                <View style={stiller.sloganBolum}>
                    <Text style={stiller.sloganBaslik}>
                        Pi Ekosisteminin{'\n'}Tarım Profesyonelleri
                    </Text>
                    <Text style={stiller.sloganAlt}>
                        Uzman bul • Danışmanlık al • Pi ile öde
                    </Text>
                </View>

                {/* Mock mod uyarısı — AgroPi-v2'deki log paneli mantığı */}
                {mockMod && (
                    <View style={stiller.mockBanner}>
                        <Text style={stiller.mockMetin}>
                            🔧 Geliştirici Modu — Pi Browser dışındasınız
                        </Text>
                        <Text style={stiller.mockAlt}>Mock SDK ile test ediliyor</Text>
                    </View>
                )}

                {/* Pi ile Giriş Yap butonu */}
                <TouchableOpacity
                    style={stiller.piButon}
                    onPress={girisYap}
                    disabled={yukleniyor}
                    activeOpacity={0.8}
                >
                    {yukleniyor ? (
                        <ActivityIndicator color={Renkler.zeminkk} size="small" />
                    ) : (
                        <>
                            <Text style={stiller.piButonEmoji}>π</Text>
                            <Text style={stiller.piButonMetin}>
                                {mockMod ? 'Mock Pi ile Giriş Yap' : 'Pi Network ile Giriş Yap'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Alt not */}
                <Text style={stiller.altNot}>
                    🔒 Pi kullanıcı adınız dışında bilgi paylaşılmaz
                </Text>
            </Animated.View>
        </View>
    );
}

const stiller = StyleSheet.create({
    kapsayici: {
        flex: 1,
        backgroundColor: Renkler.zemin,
        overflow: 'hidden',
    },

    // Dekoratif arka plan
    orb: {
        position: 'absolute',
        top: -120,
        right: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: Renkler.yarimSeffafMor,
        borderWidth: 1,
        borderColor: 'rgba(108, 63, 197, 0.3)',
    },
    orb2: {
        position: 'absolute',
        bottom: 60,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(240, 192, 64, 0.06)',
    },

    // Ana içerik
    icerik: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },

    // Logo
    logoBolum: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoHalka: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: Renkler.piAltin,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Renkler.piAltin,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    logoIcHalka: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Renkler.yarimSeffafAltin,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEmoji: {
        fontSize: 52,
        color: Renkler.piAltin,
        fontWeight: '900',
    },
    uygulamaAdi: {
        fontSize: 38,
        fontWeight: '900',
        color: Renkler.metinAna,
        letterSpacing: 2,
    },
    uygulamaAltAdi: {
        fontSize: 14,
        fontWeight: '600',
        color: Renkler.piAltin,
        letterSpacing: 6,
        textTransform: 'uppercase',
        marginTop: 2,
    },

    // Slogan
    sloganBolum: {
        alignItems: 'center',
        marginBottom: 40,
    },
    sloganBaslik: {
        fontSize: 22,
        fontWeight: '700',
        color: Renkler.metinAna,
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 12,
    },
    sloganAlt: {
        fontSize: 13,
        color: Renkler.metinIkincil,
        textAlign: 'center',
    },

    // Mock mod uyarısı
    mockBanner: {
        backgroundColor: 'rgba(255, 152, 0, 0.12)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 28,
        alignItems: 'center',
    },
    mockMetin: {
        fontSize: 13,
        color: Renkler.uyari,
        fontWeight: '600',
    },
    mockAlt: {
        fontSize: 11,
        color: Renkler.metinFade,
        marginTop: 2,
    },

    // Pi Giriş butonu
    piButon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Renkler.piAltin,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        width: '100%',
        marginBottom: 20,
        shadowColor: Renkler.piAltin,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
        gap: 10,
    },
    piButonEmoji: {
        fontSize: 22,
        color: Renkler.zeminkk,
        fontWeight: '900',
    },
    piButonMetin: {
        fontSize: 16,
        fontWeight: '800',
        color: Renkler.zeminkk,
        letterSpacing: 0.3,
    },

    // Alt not
    altNot: {
        fontSize: 12,
        color: Renkler.metinFade,
        textAlign: 'center',
    },
});
