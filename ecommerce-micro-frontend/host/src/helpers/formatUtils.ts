/**
 * Format a number as currency
 *
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'VND')
 * @param locale - The locale for formatting (default: 'vi-VN')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(19999) // "19.999 ₫"
 * formatCurrency(1000, 'USD', 'en-US') // "$1,000.00"
 */
export function formatCurrency(
  amount: number,
  currency = 'VND',
  locale = 'vi-VN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a number with thousands separators
 *
 * @param num - The number to format
 * @param locale - The locale for formatting (default: 'vi-VN')
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // "1.234.567"
 */
export function formatNumber(num: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale).format(num);
}
