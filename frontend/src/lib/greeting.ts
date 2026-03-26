<<<<<<< HEAD
import i18n from '@/i18n'

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return i18n.t('dashboard.greeting.morning')
  if (hour >= 12 && hour < 18) return i18n.t('dashboard.greeting.afternoon')
  if (hour >= 18 && hour < 23) return i18n.t('dashboard.greeting.evening')
  return i18n.t('dashboard.greeting.night')
=======
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Доброе утро'
  if (hour >= 12 && hour < 18) return 'Добрый день'
  if (hour >= 18 && hour < 23) return 'Добрый вечер'
  return 'Доброй ночи'
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
}
