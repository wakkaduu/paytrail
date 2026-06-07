export function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function calculateRemainingBalance(amount, paid) {
  return Number(amount || 0) - Number(paid || 0)
}

export function summarizeLoans(loans) {
  return loans.reduce(
    (summary, loan) => {
      summary.totalLoaned += Number(loan.amount || 0)
      summary.totalRemaining += Number(loan.remaining || 0)
      return summary
    },
    { totalLoaned: 0, totalRemaining: 0 },
  )
}