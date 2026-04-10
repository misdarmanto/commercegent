/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-condition */
export const convertNumberToCurrency = (inputNumber: any) => {
  const re = '\\d(?=(\\d{' + (0 || 3) + '})+' + (2 > 0 ? '\\.' : '$') + ')'
  const parseInt = parseFloat(inputNumber ?? 0)
  return parseInt.toFixed(Math.max(0, ~~2)).replace(new RegExp(re, 'g'), '$&,')
}
