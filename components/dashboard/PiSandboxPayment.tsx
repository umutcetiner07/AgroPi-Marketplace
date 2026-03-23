"use client";

import { Zap } from "lucide-react";

type PiSandboxPaymentProps = {
  onPay: () => void;
  busy?: boolean;
  disabled?: boolean;
  status?: string | null;
};

function PiMark({ className }: { className?: string }) {
  return (
    <span
      className={className}
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: "0.65em",
        lineHeight: 1,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      π
    </span>
  );
}

export function PiSandboxPayment({
  onPay,
  busy,
  disabled,
  status,
}: PiSandboxPaymentProps) {
  return (
    <section
      className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm"
      aria-labelledby="pi-payment-heading"
    >
      <div className="flex items-center gap-3 bg-agropi-forest px-4 py-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-agropi-gold/80 bg-agropi-forest-deep text-lg text-agropi-gold"
          aria-hidden
        >
          <PiMark />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-200/90">
            Developer Portal • Step 10
          </p>
          <h2
            id="pi-payment-heading"
            className="truncate text-base font-semibold text-white"
          >
            Process a Transaction
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-agropi-sandbox px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-900">
          Sandbox
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-agropi-mist text-agropi-forest">
            <PiMark className="text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-neutral-500">User-to-App Payment</p>
            <p className="text-2xl font-bold text-agropi-forest">0.1 Pi</p>
            <p className="text-xs text-neutral-500">
              AgroPi Test Payment — Field Sensor Access
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-4">
          <div className="flex items-start gap-2">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-700">Ready</p>
              <p className="text-sm text-neutral-500">
                Tap the button to start a test payment
              </p>
              {status && (
                <p className="mt-2 text-xs text-neutral-600 bg-neutral-50 rounded px-2 py-1">
                  {status}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onPay}
          disabled={busy || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-agropi-gold/20 text-agropi-gold">
            <PiMark className="text-sm" />
          </span>
          {busy ? "Processing…" : "Test Payment (0.1 Pi)"}
        </button>
      </div>
    </section>
  );
}
