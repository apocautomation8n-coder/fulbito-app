export const businessRules = {
  appName: 'Fulbito',
  launchCity: 'Cordoba',
  minimumAge: 18,
  platformCommissionRate: 0.05,
  defaultTurnDurationMinutes: 60,
  paymentHoldMinutes: 10,
  defaultSplitDeadlineHoursBeforeKickoff: 3,
  clubCanCustomizeSplitDeadline: true,
  clubCanChoosePaymentMode: true,
  manualBookingsPayCommission: false,
  defaultCancellationPolicy: [
    {
      label: 'Reembolso total',
      hoursBeforeKickoff: 24,
      refundRate: 1,
    },
    {
      label: 'Reembolso parcial',
      hoursBeforeKickoff: 3,
      refundRate: 0.5,
    },
    {
      label: 'Sin reembolso',
      hoursBeforeKickoff: 0,
      refundRate: 0,
    },
  ],
} as const;

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatPercent = (rate: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(rate);
