import { TValorExcel } from './comuns'
import { converterParaExcel } from './valores-e-formatos'

export async function definirValorDaSelecao(valores: TValorExcel[][], formatos: string[][]) {
  await Excel.run(async context => {
    const deltaLinhas = valores.length - 1
    const deltaColunas = valores[0].length - 1

    const intervalo = context.workbook
      .getSelectedRange()
      .getCell(0, 0)
      .getResizedRange(deltaLinhas, deltaColunas)

    intervalo.values = valores.map(linha => linha.map(converterParaExcel))
    intervalo.numberFormat = formatos

    await context.sync()
  })
}
