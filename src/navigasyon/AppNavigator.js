// AgroPi Marketplace — Navigasyon Yöneticisi
// Tab navigator: Ana Sayfa (İş İlanları) + Uzman Bul + Profilim
// Stack: UzmanDetay + İş İlanı Ver (modal)

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Ekranlar
import GirisEkrani from '../ekranlar/GirisEkrani';
import ProfilTamamlamaEkrani from '../ekranlar/ProfilTamamlamaEkrani';
import AnaSayfaEkrani from '../ekranlar/AnaSayfaEkrani';
import MarketplaceEkrani from '../ekranlar/MarketplaceEkrani';
import UzmanDetayEkrani from '../ekranlar/UzmanDetayEkrani';
import IsIlaniEkrani from '../ekranlar/IsIlaniEkrani';
import IsDetayEkrani from '../ekranlar/IsDetayEkrani';
import SohbetEkrani from '../ekranlar/SohbetEkrani';
import OdemeEkrani from '../ekranlar/OdemeEkrani';
import ProfilEkrani from '../ekranlar/ProfilEkrani';

import Renkler from '../tema/renkler';
import { kaydedilmisOturumAl, piSDKBaslat } from '../pi/PiAuthService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Alt Sekme Navigatörü ───────────────────────────────────────
function AnaTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Renkler.kartZemin,
                    borderTopColor: Renkler.ayirici,
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: Renkler.piAltin,
                tabBarInactiveTintColor: Renkler.metinFade,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
            }}
        >
            {/* 1. Tab: Ana Sayfa — İş Fırsatları */}
            <Tab.Screen
                name="AnaSayfa"
                component={AnaSayfaEkrani}
                options={{
                    tabBarLabel: 'İş Fırsatları',
                    tabBarBadge: undefined,   // Gerçek uygulamada: yeniBasvuruSayisi > 0 ? yeniBasvuruSayisi : undefined
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size - 4, color }}>💼</Text>
                    ),
                }}
            />

            {/* 2. Tab: Uzman Bul — Marketplace */}
            <Tab.Screen
                name="Marketplace"
                component={MarketplaceEkrani}
                options={{
                    tabBarLabel: 'Uzman Bul',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size - 4, color }}>🌾</Text>
                    ),
                }}
            />

            {/* 3. Tab: Profilim */}
            <Tab.Screen
                name="Profilim"
                component={ProfilEkrani}
                options={{
                    tabBarLabel: 'Profilim',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size - 4, color }}>👤</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// ── Kimlik Doğrulama Yığını ────────────────────────────────────
function KimlikYigini() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="GirisEkrani" component={GirisEkrani} />
            <Stack.Screen name="ProfilTamamlama" component={ProfilTamamlamaEkrani} />
        </Stack.Navigator>
    );
}

// ── Ana Uygulama Yığını (Giriş Sonrası) ───────────────────────
function UygulamaYigini() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Renkler.zemin },
            }}
        >
            <Stack.Screen name="AnaTabs" component={AnaTabNavigator} />
            <Stack.Screen
                name="UzmanDetay"
                component={UzmanDetayEkrani}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="IsIlaniVer"
                component={IsIlaniEkrani}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="IsDetay"
                component={IsDetayEkrani}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="Sohbet"
                component={SohbetEkrani}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="Odeme"
                component={OdemeEkrani}
                options={{ animation: 'slide_from_bottom' }}
            />
        </Stack.Navigator>
    );
}

// ── Ana Navigasyon ─────────────────────────────────────────────
export default function AppNavigator() {
    const [piKullanici, setPiKullanici] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        const baslat = async () => {
            try {
                piSDKBaslat();
                const kayitliKullanici = await kaydedilmisOturumAl();
                if (kayitliKullanici) {
                    setPiKullanici(kayitliKullanici);
                }
            } catch (e) {
                console.warn('[AgroPi] Oturum yükleme hatası:', e.message);
            } finally {
                setYukleniyor(false);
            }
        };
        baslat();
    }, []);

    if (yukleniyor) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Renkler.zemin }}>
                <ActivityIndicator color={Renkler.piAltin} size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {piKullanici ? <UygulamaYigini /> : <KimlikYigini />}
        </NavigationContainer>
    );
}
