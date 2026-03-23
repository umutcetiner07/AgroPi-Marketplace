"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Script from "next/script";
import {
  Bell,
  ChevronDown,
  CloudSun,
  Droplets,
  FlaskConical,
  Leaf,
  Minus,
  RefreshCw,
  Shield,
  Sun,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Waves,
  Wind,
} from "lucide-react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { PiSandboxPayment } from "@/components/dashboard/PiSandboxPayment";
import { SensorReadingCard } from "@/components/dashboard/SensorReadingCard";
import type { IncompletePaymentDTO } from "@/types/pi";

const PI_APP_ID = process.env.NEXT_PUBLIC_PI_APP_ID ?? "";
const PI_SANDBOX =
  (process.env.NEXT_PUBLIC_PI_SANDBOX ?? "true").toLowerCase() === "true";

export default function Page() {
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [sdkReady, setSdkReady] = useState(false);
  const [paymentsScopeStatus, setPaymentsScopeStatus] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  
  const piInitialized = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const handleScriptLoad = useCallback(async () => {
    if (typeof window === "undefined" || !window.Pi || piInitialized.current) return;
    if (!PI_APP_ID) {
      console.warn(
        "NEXT_PUBLIC_PI_APP_ID eksik; Pi.init atlandı. .env.local kontrol edin."
      );
      return;
    }
    
    try {
      await window.Pi.init({
        version: "2.0",
        sandbox: PI_SANDBOX,
        appId: PI_APP_ID,
      });
      piInitialized.current = true;
      setSdkReady(true);
    } catch (error) {
      console.error("Pi SDK initialization failed:", error);
    }
  }, [PI_APP_ID, PI_SANDBOX]);

  const timeLabel = useMemo(
    () =>
      now.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [now]
  );

  const resumeIncompletePayment = useCallback(
    async (paymentDTO: IncompletePaymentDTO) => {
      const paymentId = paymentDTO.identifier;
      const txid = paymentDTO.transaction.txid;

      try {
        if (!paymentId || !txid) {
          throw new Error(
            "IncompletePaymentDTO beklenen alanları içermiyor (identifier / transaction.txid)."
          );
        }
        setPaymentStatus("Tamamlanmamış ödeme bulundu. Sunucu tamamlıyor…");
        const res = await fetch("/api/pi/complete-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ??
              "Tamamlanmamış ödeme tamamlama başarısız"
          );
        }
        setPaymentStatus("Tamamlanmamış ödeme başarıyla işlendi.");
      } catch (e) {
        setPaymentStatus(
          e instanceof Error
            ? e.message
            : "Tamamlanmamış ödeme işlenemedi."
        );
        console.error("[Pi] resumeIncompletePayment error:", e);
      }
    },
    []
  );

  const ensurePiAuthenticated = useCallback(async () => {
    if (typeof window === "undefined" || !window.Pi?.authenticate) return;
    if (!PI_APP_ID) throw new Error("PI_APP_ID eksik.");

    try {
      // KRITIK DÜZELTME: Pi.authenticate(['payments', 'username'], onIncompletePaymentFound) formatında
      const authResult = await window.Pi.authenticate(
        ["payments", "username"],
        resumeIncompletePayment
      );

      // SDK sürüm farklarına göre scope kontrolü
      const grantedScopes =
        (authResult as any)?.scopes ?? (authResult as any)?.grantedScopes;
      
      if (Array.isArray(grantedScopes) && grantedScopes.includes("payments")) {
        setPaymentsScopeStatus("granted");
        return "granted";
      } else {
        // İzin verilmediyse kullanıcıyı uyaralım
        setPaymentsScopeStatus("denied");
        return "denied";
      }
    } catch (err) {
      console.error("Auth hatası:", err);
      setPaymentsScopeStatus("denied");
      return "denied";
    }
  }, [PI_APP_ID, resumeIncompletePayment]);

  const startPayment = useCallback(async () => {
    console.log('startPayment called', { sdkReady, paymentBusy, hasWindowPi: !!window.Pi });
    
    if (typeof window === "undefined" || !window.Pi?.createPayment) {
      alert("Pi SDK yüklenemedi. Pi Browser içinde deneyin.");
      return;
    }
    if (paymentBusy) return;

    setPaymentBusy(true);
    setPaymentStatus("Pi izinlerini kontrol ediyor…");

    try {
      const authStatus = await ensurePiAuthenticated();
      
      if (authStatus === "denied") {
        setPaymentBusy(false);
        setPaymentStatus(
          "Ödeme yapmak için gerekli izinleri vermediniz. Lütfen uygulamayı yeniden başlatıp izinleri kabul edin."
        );
        return;
      }

      setPaymentStatus("Ödeme akışı başlatılıyor…");

      const orderRes = await fetch("/api/pi/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 0.1,
          memo: "AgroPi Test Payment — Field Sensor Access",
          intent: "test",
        }),
      });
      
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ??
            "orderId üretimi başarısız. Ödeme başlatılamadı."
        );
      }
      
      const { orderId } = (await orderRes.json()) as { orderId: string };

      await window.Pi.createPayment(
        {
          amount: 0.1,
          memo: "AgroPi Test Payment — Field Sensor Access",
          metadata: { orderId },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            setPaymentStatus("Sunucu onayı bekleniyor…");
            const res = await fetch("/api/pi/approve-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, orderId }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(
                (err as { error?: string }).error ?? "Onay isteği başarısız"
              );
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            setPaymentStatus("Blok zinciri onaylandı, sunucu tamamlıyor…");
            const res = await fetch("/api/pi/complete-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(
                (err as { error?: string }).error ??
                  "Tamamlama isteği başarısız"
              );
            }
            setPaymentStatus("Ödeme başarıyla tamamlandı.");
            setPaymentBusy(false);
          },
          onCancel: () => {
            setPaymentStatus("Ödeme iptal edildi. Dashboard hazır.");
            setPaymentBusy(false);
          },
          onError: (error) => {
            setPaymentStatus(
              error?.message ? `Ödeme hatası: ${error.message}` : "Ödeme hatası"
            );
            setPaymentBusy(false);
          },
        }
      );
    } catch (e) {
      setPaymentBusy(false);
      setPaymentStatus(e instanceof Error ? e.message : String(e));
    }
  }, [PI_APP_ID, ensurePiAuthenticated, paymentBusy]);

  return (
    <div className="min-h-screen bg-agropi-mist pb-36 text-neutral-900">
      <Script 
        src="https://sdk.minepi.com/pi-sdk.js" 
        strategy="afterInteractive" 
        onLoad={handleScriptLoad}
      />

      <header className="relative overflow-hidden bg-agropi-forest-deep px-4 pb-10 pt-6 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-lg items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">AgroPi</p>
            <h1 className="text-2xl font-bold tracking-tight">Smart Farming</h1>
          </div>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur"><RefreshCw className="h-5 w-5" /></button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-agropi-amber ring-2 ring-agropi-forest-deep" />
            </button>
          </div>
        </div>

        <button className="relative mx-auto mt-6 flex w-full max-w-lg items-center gap-3 rounded-full bg-black/25 px-4 py-3 text-left backdrop-blur-md transition hover:bg-black/30">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-agropi-amber text-sm font-bold text-neutral-900">A</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Field A — North <span className="text-agropi-amber">Tomatoes</span></p>
          </div>
          <ChevronDown className="h-5 w-5 shrink-0 text-white/80" />
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-lg -mt-6 space-y-4 px-4">
        <section className="rounded-3xl bg-white p-4 shadow-md ring-1 ring-black/5">
          <div className="grid grid-cols-3 gap-2 divide-x divide-neutral-100">
            <div className="pr-2 text-center">
              <CloudSun className="mx-auto mb-1 h-7 w-7 text-sky-500" />
              <p className="text-xs text-neutral-500">Partly Cloudy</p>
              <p className="text-lg font-bold text-agropi-forest">24°C</p>
            </div>
            <div className="px-2 text-center">
              <Droplets className="mx-auto mb-1 h-7 w-7 text-sky-600" />
              <p className="text-xs text-neutral-500">Humidity</p>
              <p className="text-lg font-bold text-agropi-forest">68%</p>
            </div>
            <div className="pl-2 text-center">
              <Wind className="mx-auto mb-1 h-7 w-7 text-neutral-400" />
              <p className="text-xs text-neutral-500">Wind</p>
              <p className="text-lg font-bold text-agropi-forest">8 km/h</p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-agropi-forest p-5 text-white shadow-md ring-1 ring-black/10">
          <div className="relative flex items-center gap-5">
            <HealthScoreRing score={92} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-200/90">Crop Health Score</p>
              <p className="mt-2 text-3xl font-bold">92%</p>
              <p className="text-sm text-emerald-200/80">Excellent condition</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-md ring-1 ring-black/5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">Field Sensors</h2>
            <button className="text-xs text-agropi-forest hover:text-agropi-forest-deep">
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Droplets className="h-6 w-6 text-agropi-forest" strokeWidth={1.75} />
                <span className="rounded-full bg-agropi-optimal px-2.5 py-0.5 text-[11px] font-semibold text-agropi-optimal-fg">
                  Optimal
                </span>
              </div>
              <div className="flex items-end justify-between gap-1">
                <div className="text-2xl font-bold tabular-nums text-agropi-forest">72%</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span>Rising</span>
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Thermometer className="h-6 w-6 text-agropi-forest" strokeWidth={1.75} />
                <span className="rounded-full bg-agropi-optimal px-2.5 py-0.5 text-[11px] font-semibold text-agropi-optimal-fg">
                  Optimal
                </span>
              </div>
              <div className="flex items-end justify-between gap-1">
                <div className="text-2xl font-bold tabular-nums text-agropi-forest">22°C</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Minus className="h-3.5 w-3.5 text-emerald-600" />
                <span>Stable</span>
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <FlaskConical className="h-6 w-6 text-agropi-forest" strokeWidth={1.75} />
                <span className="rounded-full bg-agropi-warning px-2.5 py-0.5 text-[11px] font-semibold text-agropi-warning-fg">
                  Warning
                </span>
              </div>
              <div className="flex items-end justify-between gap-1">
                <div className="text-2xl font-bold tabular-nums text-agropi-forest">6.8</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                <span>Falling</span>
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Waves className="h-6 w-6 text-agropi-forest" strokeWidth={1.75} />
                <span className="rounded-full bg-agropi-optimal px-2.5 py-0.5 text-[11px] font-semibold text-agropi-optimal-fg">
                  Optimal
                </span>
              </div>
              <div className="flex items-end justify-between gap-1">
                <div className="text-2xl font-bold tabular-nums text-agropi-forest">High</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span>Rising</span>
              </div>
            </div>
          </div>
        </section>

        <PiSandboxPayment
          busy={paymentBusy}
          status={paymentStatus}
          onPay={startPayment}
          disabled={false} // Geçici olarak her zaman enabled
        />
      </main>

      <BottomNav />
    </div>
  );
}
