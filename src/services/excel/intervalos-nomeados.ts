import { tipoString } from '@cecalc/utils/dist/utils'
import { depurador } from '../../utils'
import { armazenamento } from '../armazenamento'
import { TValorExcel, TFormulaExcel } from './comuns'
import { converterParaExcel, gerarTabelaDeFormatos } from './valores-e-formatos'

export enum PREFIXO {
  CONFIG = '_p_',
  CONFIG_FORMULA = '_p_f_',
  CACHE = '_c_',
  CACHE_FORMULA = '_c_f_',
  LIMPAR = '_limpar_'
}

export enum TIPO_PERSISTENCIA {
  CACHE,
  CONFIG
}

export type TFiltro = string | RegExp

export interface IIDadosItem {
  valores: TValorExcel[][]
  formulas: TFormulaExcel[][]
}

export interface IArmazenamento {
  [key: string]: TValorExcel[][] | TFormulaExcel[][]
}

export const selecionarItensNomeados = (filtro?: TFiltro) => {
  return (item: Excel.NamedItem): boolean => {
    if (!filtro) return true
    if (tipoString(filtro)) {
      return item.name.includes(filtro)
    }
    return filtro.test(item.name)
  }
}

export const obterNomesPorPrefixo = async (filtro?: TFiltro): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    try {
      window.Excel.run(async context => {
        const names = context.workbook.names.load()
        await context.sync()
        const itens = names.items.filter(selecionarItensNomeados(filtro)).map(item => item.name)
        depurador.console.info(`Nomes com filtro '${filtro?.toString()}': `, itens)
        resolve(itens)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export const obterDadosDeItemNomeado = async (item: Excel.NamedItem): Promise<IIDadosItem> => {
  const range = item.getRange().load()
  await item.context.sync()
  const dados = {
    valores: range.values,
    formulas: range.formulasLocal
  }
  depurador.console.info(`Dados do intervalo '${item.name}': `, dados)
  return dados
}

export const obterItensNomeados = (filtro?: TFiltro): Promise<Excel.NamedItem[]> => {
  return new Promise((resolve, reject) => {
    try {
      window.Excel.run(async context => {
        const names = context.workbook.names.load()
        await context.sync()
        const resultado = names.items.filter(selecionarItensNomeados(filtro))
        resolve(resultado)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export const obterItensDisponiveisCache = async () => {
  const filtro = new RegExp(`^${PREFIXO.CACHE}`)
  return await obterItensNomeados(filtro)
}

export const obterItensDisponiveisConfig = async () => {
  const filtro = new RegExp(`^${PREFIXO.CONFIG}`)
  return await obterItensNomeados(filtro)
}

export const obterDadosParaArmazenamento = async (
  tipo: TIPO_PERSISTENCIA,
  nomes?: string[]
): Promise<IArmazenamento> => {
  const cache = tipo === TIPO_PERSISTENCIA.CACHE
  const itens = cache ? await obterItensDisponiveisCache() : await obterItensDisponiveisConfig()
  const filtrados = itens.filter(item => !Array.isArray(nomes) || nomes.includes(item.name))
  const dadosParaGravar = {} as IArmazenamento
  for (let i = 0; i < filtrados.length; i++) {
    const item = filtrados[i]
    const dadosItem = await obterDadosDeItemNomeado(item)
    const temFormula =
      item.name.startsWith(PREFIXO.CACHE_FORMULA) || item.name.startsWith(PREFIXO.CONFIG_FORMULA)
    dadosParaGravar[item.name] = temFormula ? dadosItem.formulas : dadosItem.valores
  }
  return dadosParaGravar
}

const definirValorDeItemNomeado = async (item: Excel.NamedItem, valores: TValorExcel[][]) => {
  depurador.console.log(`Definir valor de ${item.name}: `, valores)
  const range = item.getRange()
  range.values = valores
  return await item.context.sync()
}

const definirFormulaDeItemNomeado = async (item: Excel.NamedItem, formulas: TFormulaExcel[][]) => {
  depurador.console.log(`Definir fórmulas de ${item.name}: `, formulas)
  const range = item.getRange()
  range.formulasLocal = formulas
  return await item.context.sync()
}

export const persistirDados = async (tipo: TIPO_PERSISTENCIA, nomes?: string[]) => {
  const cache = tipo === TIPO_PERSISTENCIA.CACHE
  const dados = await obterDadosParaArmazenamento(tipo, nomes)
  depurador.console.info(`Persistindo dados em ${cache ? 'cache' : 'config'}: `, dados)
  if (cache) return armazenamento.gravarCache(dados)
  return armazenamento.gravarConfig(dados)
}

export const recuperarDados = async (tipo: TIPO_PERSISTENCIA, nomes?: string[]) => {
  const cache = tipo === TIPO_PERSISTENCIA.CACHE
  const itens = cache ? await obterItensDisponiveisCache() : await obterItensDisponiveisConfig()
  const dados = cache ? armazenamento.lerCache() : armazenamento.lerConfig()
  const disponiveis = itens.map(item => item.name)
  depurador.console.info('Intervalos na planilha: ', disponiveis)
  depurador.console.info(`Dados no ${cache ? 'cache' : 'padrões'}: `, dados)
  return new Promise(resolve => {
    window.Excel.run(async () => {
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i]
        const nome = item.name
        if (!(nome in dados)) continue
        if (Array.isArray(nomes) && !nomes.includes(nome)) continue
        if (
          (cache && nome.startsWith(PREFIXO.CACHE_FORMULA)) ||
          (!cache && nome.startsWith(PREFIXO.CONFIG_FORMULA))
        ) {
          await definirFormulaDeItemNomeado(item, dados[nome] as TFormulaExcel[][])
          continue
        }
        await definirValorDeItemNomeado(item, dados[nome] as TValorExcel[][])
      }
      resolve(undefined)
    })
  })
}

export async function preencherItemNomeado(valores: TValorExcel[][], referencia: string) {
  if (!Array.isArray(valores) || !Array.isArray(valores[0])) return

  await Excel.run(async context => {
    const deltaLinhas = valores.length - 1
    const deltaColunas = valores[0].length - 1

    const intervalo = context.workbook.names
      .getItem(referencia)
      .getRange()
      .getCell(0, 0)
      .getResizedRange(deltaLinhas, deltaColunas)

    intervalo.values = valores.map(linha => linha.map(converterParaExcel))
    const formatos = gerarTabelaDeFormatos(valores)
    intervalo.numberFormat = formatos

    await context.sync()
  })
}
