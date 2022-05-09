import { obterOuCriarPlanilha } from './planilhas'
import { TValorExcel } from './comuns'
import { converterValorParaExcel, gerarTabelaDeFormatos } from './valores-e-formatos'

export async function definirValorDoIntervalo(
  valores: TValorExcel[][],
  referencia?: string,
  nomePlanilha?: string
) {
  if (!Array.isArray(valores) || !Array.isArray(valores[0])) return
  const planilha = await obterOuCriarPlanilha(nomePlanilha)

  const context = planilha.context

  const deltaLinhas = valores.length - 1
  const deltaColunas = valores[0].length - 1

  let intervalo: Excel.Range
  if (!referencia) {
    intervalo = planilha
      .getUsedRange()
      .getLastRow()
      .getOffsetRange(1, 0)
      .getCell(0, 0)
      .getResizedRange(deltaLinhas, deltaColunas)
  } else {
    intervalo = planilha
      .getRange(referencia)
      .getCell(0, 0)
      .getResizedRange(deltaLinhas, deltaColunas)
  }

  intervalo.values = valores.map(linha => linha.map(converterValorParaExcel))
  const formatos = gerarTabelaDeFormatos(valores)
  if (Array.isArray(formatos) && Array.isArray(formatos[0])) intervalo.numberFormat = formatos

  planilha.activate()

  await context.sync()
}
