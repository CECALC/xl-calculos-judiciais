import { tipoData, tipoNumero } from '@cecalc/utils'
import { TValorExcel } from './comuns'

export function converterParaExcel(valor: TValorExcel) {
  if (tipoData(valor)) {
    return 25569 + (valor.getTime() - valor.getTimezoneOffset() * 60 * 1000) / (1000 * 60 * 60 * 24)
  }
  return valor
}

export function gerarTabelaDeFormatos(valores: TValorExcel[][]): string[][] {
  return valores.map(linha => {
    return linha.map(celula => {
      if (tipoNumero(celula)) return '#,##0.00;(#,##0.00)'
      if (tipoData(celula)) return 'dd/MM/yyyy'
      return ''
    })
  })
}
