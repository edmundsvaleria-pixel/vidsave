// src/types/paystack.d.ts
declare module "@paystack/inline-js" {
  export interface PaystackTransaction {
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    message: string;
  }

  export interface PaystackOptions {
    key: string;
    accessCode?: string;
    email?: string;
    amount?: number;
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
  }

  export interface PaystackResumeOptions {
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onError?: (error: any) => void;
  }

  export default class PaystackPop {
    newTransaction(options: PaystackOptions): void;
    resumeTransaction(accessCode: string, options?: PaystackResumeOptions): void;
  }
}