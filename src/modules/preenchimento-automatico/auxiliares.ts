import { IOpcaoAnalisador } from '@cecalc/analisador-de-texto'
import { formatoSnakeCase } from '@cecalc/utils'
import {
  nomesComPrefixos,
  definirDirecao,
  deveAlinharCompetencia,
  definirValorDoIntervalo,
  obterItensNomeados,
  preencherItemNomeado,
  DIRECAO,
  TValorExcel,
  obterLinhaCompetencia,
  obterProximaLinhaDisponivel,
  obterProximaColunaDisponivel
} from '../../services'
import { depurador } from '../../utils'

export async function preencherIntervalos(nomeDocumento: string, opcao: IOpcaoAnalisador) {
  for (let i = 0; i < opcao.parametros.length; i++) {
    const parametro = opcao.parametros[i]
    const nomePlanilha = formatoSnakeCase(nomeDocumento).toUpperCase()
    const intervalos = parametro.intervalo ? await nomesComPrefixos(parametro.intervalo) : ''
    const referencia = Array.isArray(intervalos)
      ? await obterProximoIntervaloLivre(intervalos)
      : intervalos
    depurador.inspecionar('nomePlanilha: ', nomePlanilha)
    depurador.inspecionar('referencia: ', referencia)

    if (referencia) {
      const alinharCompetencia = deveAlinharCompetencia(referencia)
      const direcao = definirDirecao(referencia)
      let deslocLinhas = await calcularDeslocLinhas(referencia, direcao === DIRECAO.PARA_BAIXO, alinharCompetencia ? parametro.competenciaInicial : undefined)
      let deslocColunas = await calcularDeslocColunas(referencia, direcao === DIRECAO.PARA_DIREITA)
      depurador.inspecionar('Alinhar competência: ', alinharCompetencia)
      depurador.inspecionar('Direção: ', direcao === DIRECAO.PARA_BAIXO ? 'para baixo' : direcao === DIRECAO.PARA_DIREITA ? 'para direita' : 'sobrescrever')
      depurador.inspecionar('Desloc linhas: ', deslocLinhas)
      depurador.inspecionar('Desloc colunas: ', deslocColunas)
      if (deslocLinhas < 0 || deslocColunas < 0) continue
      preencherItemNomeado(parametro.dados as TValorExcel[][], referencia, deslocLinhas, deslocColunas)
    } else {
      await definirValorDoIntervalo(parametro.dados as TValorExcel[][], undefined, nomePlanilha)
    }
  }
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

async function calcularDeslocLinhas(referencia: string, moverParaBaixo = false, competenciaInicial?: Date): Promise<number> {
  if (competenciaInicial) {
    console.log(competenciaInicial)
    return await obterLinhaCompetencia(referencia, competenciaInicial)
  }
  if (moverParaBaixo) {
    return await obterProximaLinhaDisponivel(referencia)
  }
  return 0
}

async function calcularDeslocColunas(referencia: string, moverParaDireta = false): Promise<number> {
  if (moverParaDireta) {
    return await obterProximaColunaDisponivel(referencia)
  }  
  return 0
}
