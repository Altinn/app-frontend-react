export enum PaymentStatus {
  Created = 'Created',
  Paid = 'Paid',
  Failed = 'Failed',
}

export interface PaymentResponsePayload {
  taskId: string;
  paymentProcessorId: string;
  orderDetails: OrderDetails;
  paymentDetails?: PaymentDetails;
}

export interface PaymentDetails {
  paymentId: string;
  redirectUrl: string;
  receiptUrl?: string;
  status: PaymentStatus;
}

export interface OrderDetails {
  orderReference?: string;
  currency: string;
  orderLines: OrderLine[];
  totalPriceExVat: number;
  totalVat: number;
  totalPriceIncVat: number;
}

export interface OrderLine {
  id: string;
  name: string;
  textResourceKey: string;
  priceExVat: number;
  quantity: number;
  vatPercent: number;
  unit: string;
}
