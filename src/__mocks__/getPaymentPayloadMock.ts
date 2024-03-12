import { PaymentStatus } from 'src/features/payment/types';

export const paymentResponsePayload = {
  redirectUrl:
    'https://test.checkout.dibspayment.eu/hostedpaymentpage/?checkoutKey=fc8ce23b003e4c20bc37000506fdb4a0&pid=00cd000065f03e6a75269b94dc7c38df',
  paymentReference: '00cd000065f03e6a75269b94dc7c38df',
  status: PaymentStatus.Paid,
  orderDetails: {
    orderReference: '',
    currency: 'NOK',
    orderLines: [
      {
        id: '0',
        name: 'A thing',
        textResourceKey: '',
        priceExVat: 50,
        quantity: 1,
        vatPercent: 25,
        unit: 'pcs',
      },
      {
        id: '1',
        name: 'Another thing',
        textResourceKey: '',
        priceExVat: 100,
        quantity: 1,
        vatPercent: 25,
        unit: 'pcs',
      },
    ],
    totalPriceExVat: 150,
    totalVat: 37.5,
    totalPriceIncVat: 187.5,
  },
};
