import { IOpcao } from '@cecalc/analisador-de-texto'
import { formatoSnakeCase } from '@cecalc/utils'
import {
  definirValorDoIntervalo as preencherIntervalo,
  obterItensNomeados,
  preencherItemNomeado as preencherIntervaloNomeado,
  TValorExcel
} from '../../services'
import { depurador } from '../../utils'

export async function preencherIntervalos(nomeDocumento: string, opcao: IOpcao) {
  opcao.parametros.forEach(async parametro => {
    const nomePlanilha = formatoSnakeCase(nomeDocumento).toUpperCase()
    const referencia = Array.isArray(parametro.intervalo)
      ? await obterProximoIntervaloLivre(parametro.intervalo)
      : parametro.intervalo
    depurador.console.log('nomePlanilha: ', nomePlanilha)
    depurador.console.log('referencia: ', referencia)
    if (referencia) {
      preencherIntervaloNomeado(parametro.dados as TValorExcel[][], referencia)
    } else {
      await preencherIntervalo(parametro.dados as TValorExcel[][], referencia, nomePlanilha)
    }
  })
}

async function obterProximoIntervaloLivre(referencias: string[]): Promise<string> {
  const intervalos = (await obterItensNomeados()).filter((item: Excel.NamedItem) =>
    referencias.includes(item.name)
  )

  for (let i = 0; i < intervalos.length; i++) {
    const nome = intervalos[i].name
    const intervalo = intervalos[i].getRange()
    const context = intervalos[i].context

    intervalo.load('values')
    context.sync()

    if (intervalo.values.some(linha => linha.some((celula: TValorExcel) => !!celula))) {
      return nome
    }
  }

  return ''
}
