export enum PaymentStatus {
  Created = 'Created',
  Paid = 'Paid',
  Failed = 'Failed',
}

export interface PaymentResponsePayload {
  redirectUrl: string;
  paymentReference: string;
  status: PaymentStatus;
  orderDetails: OrderDetails;
}

export interface OrderDetails {
  orderReference: string;
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
