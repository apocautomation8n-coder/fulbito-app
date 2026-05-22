export const businessRules = {
  appName: 'Fulbito',
  launchCity: 'Cordoba',
  minimumAge: 18,
  platformCommissionRate: 0.05,
  playerReservationFeeRate: 0.025,
  clubMonthlyCommissionRate: 0.025,
  clubBillingGenerationDay: 1,
  clubBillingPaymentWindowDays: 10,
  blockClubWhenMonthlyPaymentOverdue: true,
  defaultTurnDurationMinutes: 60,
  paymentHoldMinutes: 10,
  defaultSplitDeadlineHoursBeforeKickoff: 3,
  clubCanCustomizeSplitDeadline: true,
  clubCanChoosePaymentMode: false,
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

export const calculateBookingAmounts = (turnPrice: number) => {
  const appCommission = Math.round(turnPrice * businessRules.platformCommissionRate);
  const playerReservationFee = Math.round(turnPrice * businessRules.playerReservationFeeRate);
  const clubMonthlyCommission = Math.max(appCommission - playerReservationFee, 0);

  return {
    totalAmount: turnPrice,
    amountDueNow: playerReservationFee,
    appCommission,
    playerReservationFee,
    clubMonthlyCommission,
    clubAmount: turnPrice,
    amountToPayAtClub: turnPrice,
  };
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatPercent = (rate: number) => {
  const percent = rate * 100;
  const decimals = Math.abs(percent - Math.round(percent)) < 0.001 ? 0 : 1;
  return `${percent.toFixed(decimals)}%`;
};
