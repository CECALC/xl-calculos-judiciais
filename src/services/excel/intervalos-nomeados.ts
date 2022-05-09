import { tipoData, tipoNumero, tipoString, validarData } from '@cecalc/utils'
import { depurador } from '../../utils'
import { armazenamento } from '../armazenamento'
import { TValorExcel, TFormulaExcel } from './comuns'
import { converterValorParaExcel, converterValorSerialExcelParaData, gerarTabelaDeFormatos } from './valores-e-formatos'

export enum PREFIXO {
  PESSOAL = '_p_',
  PESSOAL_FORMULA = '_p_f_',
  CACHE = '_c_',
  CACHE_FORMULA = '_c_f_',
  INSERIR_ABAIXO = '_ib_',
  INSERIR_AA_DIREITA = '_id_',
  ALINHAR_COMPETENCIA = '_cp_'  
}

export enum DIRECAO {
  PARA_BAIXO,
  PARA_DIREITA,
  SOBREPOR
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

export const nomeSemPrefixos = (intervalo: string) => {
  Object.values(PREFIXO).forEach(valor => {
    intervalo = intervalo.replace(valor, '')
  })
  return intervalo
}

export const nomesComPrefixos = async (nomesSemPrefixo: string | string[]): Promise<string | string[]> => {
  const intervalos = (await obterItensNomeados()).map(item => item.name)
  if (Array.isArray(nomesSemPrefixo)) {
    return intervalos.filter(intervalo => nomesSemPrefixo.some(nome => intervalo.includes(nome)))
  }
  return intervalos.find(intervalo => intervalo.includes(nomesSemPrefixo)) || ''
}

export const definirDirecao = (intervalo: string): DIRECAO => {
  if (intervalo.includes(PREFIXO.INSERIR_ABAIXO)) return DIRECAO.PARA_BAIXO
  if (intervalo.includes(PREFIXO.INSERIR_AA_DIREITA)) return DIRECAO.PARA_DIREITA
  return DIRECAO.SOBREPOR
}

export const deveAlinharCompetencia = (intervalo: string): boolean => {
  return intervalo.includes(PREFIXO.ALINHAR_COMPETENCIA)
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
        const names = context.workbook.names.load('items')
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
  const range = item.getRange().load(['values', 'formulasLocal'])
  await item.context.sync()
  const dados = {
    valores: range.values,
    formulas: range.formulasLocal
  }
  depurador.inspecionar(`Dados do intervalo '${item.name}': `, dados)
  return dados
}

export const obterValoresDeItemNomeado = async (item: Excel.NamedItem): Promise<TValorExcel[][]> => {
  const range = item.getRange().load(['values'])
  await item.context.sync()
  const valores = range.values
  depurador.inspecionar(`Valores do intervalo '${item.name}': `, valores)
  return valores
}

export const obterItemNomeado = (nome: string): Promise<Excel.NamedItem | null> => {
  return new Promise((resolve, reject) => {
    try {
      window.Excel.run(async context => {
        const intervalo = context.workbook.names.getItemOrNullObject(nome)
        intervalo.load()
        await context.sync()
        if (intervalo.isNullObject) {
          resolve(null)
        } else {
          resolve(intervalo)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}


export const obterItensNomeados = (filtro?: TFiltro): Promise<Excel.NamedItem[]> => {
  return new Promise((resolve, reject) => {
    try {
      window.Excel.run(async context => {
        const names = context.workbook.names.load('items')
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
  const filtro = new RegExp(`^${PREFIXO.PESSOAL}`)
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
      item.name.startsWith(PREFIXO.CACHE_FORMULA) || item.name.startsWith(PREFIXO.PESSOAL_FORMULA)
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
    Excel.run(async () => {
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i]
        const nome = item.name
        if (!(nome in dados)) continue
        if (Array.isArray(nomes) && !nomes.includes(nome)) continue
        if (
          (cache && nome.startsWith(PREFIXO.CACHE_FORMULA)) ||
          (!cache && nome.startsWith(PREFIXO.PESSOAL_FORMULA))
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

export const preencherItemNomeado = async (valores: TValorExcel[][], referencia: string, deslocLinhas = 0, deslocColunas = 0) => {
  if (!Array.isArray(valores) || !Array.isArray(valores[0])) return

  await Excel.run(async context => {
    const deltaLinhas = valores.length - 1
    const deltaColunas = valores[0].length - 1

    const intervalo = context.workbook.names
      .getItem(referencia)
      .getRange()
      .getCell(deslocLinhas, deslocColunas)
      .getResizedRange(deltaLinhas, deltaColunas)

    intervalo.values = valores.map(linha => linha.map(converterValorParaExcel))
    const formatos = gerarTabelaDeFormatos(valores)
    intervalo.numberFormat = formatos

    await context.sync()
  })
}

export const obterValoresDaReferencia = async (referencia: string): Promise<TValorExcel[][]> => {
  const item = await obterItemNomeado(referencia)
  if (item === null) return []
  return await obterValoresDeItemNomeado(item)
}

export const obterLinhaCompetencia = async (referencia: string, competencia: Date): Promise<number> => {
  console.log(referencia)
  console.log(competencia)
  if (!tipoString(referencia) || !tipoData(competencia)) return 0

  const valores = await obterValoresDaReferencia(referencia)

  if (Array.isArray(valores) && valores.length && valores[0].length) {
    for (let i = 0; i < valores.length; i++) {
      const valorSerialExcel = valores[i][0]
      if (!tipoNumero(valorSerialExcel)) continue
      const data = converterValorSerialExcelParaData(valorSerialExcel)
      if (!tipoData(data) || !validarData(data)) continue
      console.log(data)
      if (data.getFullYear() === competencia.getFullYear() && data.getMonth() === competencia.getMonth()) {
        return i
      }
    }
  }

  return 0
}

export const obterProximaLinhaDisponivel = async (referencia: string): Promise<number> => {
  if (!tipoString(referencia)) return -1

  const valores = await obterValoresDaReferencia(referencia)

  console.log(valores)

  if (Array.isArray(valores) && valores.length && valores[0].length) {
    let livre = valores.length
    for (let i = 0; i < valores.length; i++) {
      const linha = valores[i]
      if (linha.some((celula: TValorExcel) => !!celula)) continue
      if (i < livre) {
        livre = i
      }
    }
    if (livre === valores.length) return -1
    return livre
  }

  return -1
}

export const obterProximaColunaDisponivel = async (referencia: string): Promise<number> => {
  if (!tipoString(referencia)) return -1

  const valores = await obterValoresDaReferencia(referencia)

  if (Array.isArray(valores) && valores.length && valores[0].length) {
    let ultima = -1
    for (let i = 0; i < valores.length; i++) {
      const linha = valores[i]
      for (let j = 0; j < linha.length; j++) {
        const celula = linha[j]
        if (!!celula && ultima < j) {
          ultima = j
        }
      }
    }
    if (ultima === valores[0].length - 1) return -1
    if (ultima < 0) return 0
    return ultima + 1
  }

  return -1
}
