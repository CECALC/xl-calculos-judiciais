import { CData, tipoData, tipoNumero, tipoString } from '@cecalc/utils'

const padraoInteiro = /^-?\d+$/
const padraoDecimal = /^-?\d+(,\d+)?$/
const padraoData = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/

export interface IParametrosValidacao<T> {
  obrigatorio?: boolean
  min?: T
  max?: T
}

export function validarComoNumero(valor: string | undefined, decimal = false, parametros: IParametrosValidacao<number>): string {
  const { obrigatorio, min, max } = parametros

  if (!tipoString(valor) || valor.length === 0) return obrigatorio ? 'O campo é obrigatório' : ''

  const padrao = decimal ? padraoDecimal : padraoInteiro

  if (!padrao.test(valor)) return 'O valor deve ser numérico ' + (decimal ? '(decimal com vírgula)' : '(inteiro)')

  const numero = Number(valor.replace(',', '.'))
  if (tipoNumero(min) && numero < min) return `O valor não pode ser inferior a ${min}`
  if (tipoNumero(max) && numero > max) return `O valor não pode ser superior a ${max}`

  return ''  
}

export function validarComoData(valor: string | undefined, parametros: IParametrosValidacao<Date>): string {
  const { obrigatorio, min, max } = parametros

  if (!tipoString(valor) || valor.length === 0) return obrigatorio ? 'O campo é obrigatório' : ''

  if (!padraoData.test(valor)) return 'O valor deve ser uma data'

  const data = new CData(valor)

  if (!data.dataValida()) return 'Data inválida'

  if (tipoData(min) && data.antesDe(min)) return `A data não pode ser anterior a ${new CData(min).local}`
  if (tipoData(max) && data.depoisDe(max)) return `A data não pode ser posterior a ${new CData(max).local}`

  return '';
}
