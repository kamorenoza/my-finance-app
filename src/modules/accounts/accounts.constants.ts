export enum AccountTypes {
  loan = 'loan',
  TC = 'TC',
  normal = 'normal'
}

export enum AccountView {
  list,
  carousel
}

export const ACCOUNTS_TYPES = [
  { type: AccountTypes.loan, label: 'Créditos' },
  { type: AccountTypes.TC, label: 'Tarjeta de crédito' },
  { type: AccountTypes.normal, label: 'Ahorros' }
]

export const ACCOUNTS_ORDER_BY = [
  { filter: 'name', label: 'Nombre' },
  { filter: 'type', label: 'Tipo' }
]
