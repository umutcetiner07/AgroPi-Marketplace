export interface PiWindow {
  Pi: {
    init: (config: PiConfig) => Promise<void>
    authenticate: (
      scopes: string[],
      onIncompletePaymentFound?: (payment: IncompletePaymentDTO) => void
    ) => Promise<PiAuthResult>
    createPayment: (
      payment: PiPayment,
      callbacks?: PiCallbacks
    ) => Promise<PiPaymentResult>
    openShareDialog: (data: PiShareData) => Promise<void>
  }
}

export interface PiConfig {
  version: string
  sandbox: boolean
  appId: string
  network?: string
}

export interface PiCallbacks {
  onReadyForServerApproval?: (paymentId: string) => void
  onReadyForServerCompletion?: (paymentId: string, txid: string) => void
  onCancel?: (paymentId: string) => void
  onError?: (error: Error, payment?: PiPayment) => void
  onIncompletePaymentFound?: (payment: IncompletePaymentDTO) => void
}

export interface PiAuthResult {
  user: {
    uid: string
    username: string
  }
  accessToken: string
  // SDK bazı sürümlerde verilen/granted scope listesini döndürebilir.
  // Runtime'da kontrol edeceğiz; yoksa undefined kalır.
  scopes?: string[]
  grantedScopes?: string[]
}

export interface PiPayment {
  amount: number
  memo: string
  metadata?: Record<string, any>
  uid?: string
}

export interface PiPaymentResult {
  identifier: string
  transactionId?: string
}

export interface PiShareData {
  title: string
  description?: string
  media?: string[]
}

// Pi SDK `authenticate(..., onIncompletePaymentFound)` callback'ine verdiği DTO.
// Dokümana göre resume için "identifier" ve "transaction" alanları kullanılır.
export interface IncompletePaymentDTO {
  identifier: string
  transaction: {
    txid: string
  }
}

declare global {
  interface Window {
    Pi: PiWindow['Pi']
  }
}
