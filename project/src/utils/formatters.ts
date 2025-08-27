export const formatCurrency = (amount: number, currency = 'R'): string => {
  return `${currency}${amount.toFixed(2)}`
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const two = (num: number): string => {
  return num.toFixed(2)
}