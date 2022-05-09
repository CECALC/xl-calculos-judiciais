import { tipoData, tipoNumero } from '@cecalc/utils'
import { TValorExcel } from './comuns'

export function converterValorParaExcel(valor: TValorExcel) {
  if (tipoData(valor)) {
    return 25569 + (valor.getTime() - valor.getTimezoneOffset() * 60 * 1000) / (1000 * 60 * 60 * 24)
  }
  return valor
}

// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript/67130235#67130235
export function converterValorSerialExcelParaData(valorSerialExcel: number) {
  return new Date(0, 0, valorSerialExcel - 1)
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
