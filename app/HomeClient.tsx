'use client'

import { useState, useEffect } from 'react'
import { PiConfig, PiAuthResult } from '@/types/pi'
import AgroPiChatbot from '@/components/AgroPiChatbot'

// Pi Network Configuration
const PI_CONFIG: PiConfig = {
    version: "2.0",
    sandbox: false,
    appId: '68a6fed62cb50254172b6593'
}

export default function HomeClient() {
    const [piUser, setPiUser] = useState<PiAuthResult['user'] | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Initialize Pi SDK
    useEffect(() => {
        initializePi()
    }, [])

    async function initializePi() {
        try {
            if (typeof window !== 'undefined' && (window as any).Pi) {
                await (window as any).Pi.init({
                    version: "2.0",
                    sandbox: PI_CONFIG.sandbox,
                    appId: PI_CONFIG.appId,
                    network: 'mainnet' // Pi Browser için mainnet
                })
                console.log('Pi SDK başarıyla başlatıldı - Pi Browser modu')
                
                // Pi Browser kontrolü
                if (window.location.hostname.includes('pinet.com')) {
                    console.log('Pi Browser detected - enabling Pi Network features')
                    setStatusMessage('Pi Browser modu aktif')
                }
            } else {
                console.log('Pi SDK bulunamadı - normal browser modu')
                setStatusMessage('Pi SDK yükleniyor...')
            }
        } catch (error) {
            console.error('Pi SDK başlatma hatası:', error)
            setStatusMessage('Pi SDK başlatılamadı: ' + error.message)
        }
    }

    // Connect to Pi Network
    async function connectPi() {
        setIsLoading(true)
        try {
            if (!(window as any).Pi) {
                throw new Error('Pi SDK bulunamadı!')
            }

            const authResult = await (window as any).Pi.authenticate(['payments', 'username'], {
                network: PI_CONFIG.network,
                onIncompletePaymentFound: (payment: any) => {
                    console.log('Tamamlanmamış ödeme bulundu:', payment)
                }
            })

            setPiUser(authResult.user)
            setIsConnected(true)
            setStatusMessage('Pi Network ile başarıyla bağlantı kuruldu!')
            console.log('Pi Network auth başarılı:', authResult)

        } catch (error) {
            console.error('Pi Network bağlantı hatası:', error)
            setStatusMessage('Bağlantı hatası: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Disconnect from Pi Network
    function disconnectPi() {
        setPiUser(null)
        setIsConnected(false)
        setStatusMessage('Pi Network bağlantısı kesildi.')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-green-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">π</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">AgroPi Marketplace</h1>
                        </div>
                        
                        {/* Pi Network Connection */}
                        <div className="flex items-center space-x-4">
                            {isConnected ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">
                                        {piUser?.username || 'Kullanıcı'}
                                    </span>
                                    <button
                                        onClick={disconnectPi}
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        Çıkış
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={connectPi}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Bağlanıyor...' : 'Pi Network ile Bağlan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Pi Network ile
                        <span className="text-green-600"> Akıllı Tarım</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Pi Network tabanlı ödeme sistemi ile tarım ürünleri alım satım platformu. 
                        Güvenli, hızlı ve decentralize ticaret deneyimi.
                    </p>
                    
                    {!isConnected && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-yellow-800 text-sm">
                                Pi Network ile bağlanarak marketplace özelliklerini kullanabilirsiniz.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Platform Özellikleri
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🌱</span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Tarım Ürünleri</h4>
                            <p className="text-gray-600">
                                Taze ve organik tarım ürünleri, doğrudan çiftçiden size
                            </p>
                        </div>
                        
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">π</span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Pi Network Ödemeler</h4>
                            <p className="text-gray-600">
                                Hızlı ve güvenli Pi Network ile kripto ödeme sistemi
                            </p>
                        </div>
                        
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🤝</span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Güvenli Ticaret</h4>
                            <p className="text-gray-600">
                                Decentralize sistem ile güvenli alım satım deneyimi
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Status Message */}
            {statusMessage && (
                <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
                    <p className="text-blue-800 text-sm">{statusMessage}</p>
                </div>
            )}
            
            {/* AgroPi Chatbot */}
            <AgroPiChatbot />
        </div>
    )
}
