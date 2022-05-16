import { compress, decompress } from 'lz-string'
import { tipoObjeto } from '@cecalc/utils'
import { depurador } from '../utils'
import { TValorExcel } from './excel'

// baseado em: https://github.com/mesmerised/persistme

const APP_STORAGE_KEY = '__cecalc_supl.xl__'

export enum TIPO_PERSISTENCIA {
  CONFIG,
  CACHE,
  TRANSFERENCIA
}

export type TDadosExcel = Record<string, TValorExcel[][]>
export type TDadosTransferencia = Record<string, string[][]>
export type TPastasDeTrabalho = string[]

class Armazenamento {
  static _instancia: Armazenamento
  static excesso = {
    codigo: 0,
    nome: ''
  }
  static PREFIXO = {
    CACHE: '_cache_',
    CONFIG: '_config_',
    TRANSFERENCIA: '_trans_',
    PASTAS_DE_TRABALHO: '_wbs_'
  }
  static EXPIRACAO_CACHE = 1000 * 60 * 10 // 10 min.

  static disponivel(tipo: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
    let storage
    try {
      storage = window[tipo]
      const x = '__storage_test__'
      storage.setItem(x, x)
      storage.removeItem(x)
      return true
    } catch (e) {
      if (e instanceof DOMException) {
        Armazenamento.excesso.codigo = e.code
        Armazenamento.excesso.nome = e.message
      }

      return (
        e instanceof DOMException &&
        (e.code === 22 ||
          e.code === 1014 ||
          e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        !!storage &&
        storage.length !== 0
      )
    }
  }

  private app = ''
  private tipo = ''
  private storage?: Storage
  private defaults?: Record<string, unknown>
  private cacheTimeoutId?: ReturnType<typeof setTimeout>
  private transferenciaTimeoutId?: ReturnType<typeof setTimeout>

  constructor(app: string, defaults: Record<string, unknown>) {
    if (Armazenamento._instancia) return Armazenamento._instancia

    this.app = app
    this.defaults = defaults || {}

    if (Armazenamento.disponivel('localStorage')) {
      this.storage = window.localStorage
      this.tipo = 'local'
    } else if (Armazenamento.disponivel('sessionStorage')) {
      this.storage = window.sessionStorage
      this.tipo = 'session'
    }

    if (this.storage) {
      depurador.info(`${this.tipo}Storage iniciada!`)
    }

    Armazenamento._instancia = this
  }

  private disponivel(): boolean {
    if (this.storage) return true
    depurador.erro(`${this.tipo}Storage não disponivel!`)
    return false
  }

  private iniciarTimeoutCache() {
    if (this.cacheTimeoutId) clearTimeout(this.cacheTimeoutId)
    this.cacheTimeoutId = setTimeout(() => {
      this.limparDadosCache()
      this.cacheTimeoutId = undefined
    }, Armazenamento.EXPIRACAO_CACHE)
  }

  private iniciarTimeoutTransferencia() {
    if (this.transferenciaTimeoutId) clearTimeout(this.transferenciaTimeoutId)
    this.transferenciaTimeoutId = setTimeout(() => {
      this.limparDadosTransferencia()
      this.transferenciaTimeoutId = undefined
    }, Armazenamento.EXPIRACAO_CACHE)
  }

  private obterChavePrefixada(item: string): string {
    return item.startsWith(`${this.app}.`) ? item : `${this.app}.${item}`
  }

  private obterChaveOriginal(chave: string): string {
    return chave.startsWith(`${this.app}.`) ? chave.replace(`${this.app}.`, '') : chave
  }

  private obterChaveCache(): string {
    return this.obterChavePrefixada(Armazenamento.PREFIXO.CACHE)
  }

  private obterChaveConfig(): string {
    return this.obterChavePrefixada(Armazenamento.PREFIXO.CONFIG)
  }

  private obterChaveTransferencia(): string {
    return this.obterChavePrefixada(Armazenamento.PREFIXO.TRANSFERENCIA)
  }

  private obterChavePastasDeTrabalho(): string {
    return this.obterChavePrefixada(Armazenamento.PREFIXO.PASTAS_DE_TRABALHO)
  }

  public guardar(dados: Record<string, unknown>) {
    if (this.disponivel()) {
      depurador.console.info(`[${this.tipo}Storage] Armanzenando: `, dados)
      Object.keys(dados).forEach(item => {
        const chave = this.obterChavePrefixada(item)
        const valor = JSON.stringify(dados[item])
        try {
          if (valor !== null && valor !== undefined) {
            this.storage?.setItem(chave, compress(valor))
          }
        } catch (e) {
          depurador.console.warn(
            `[${this.tipo}Storage] Erro ao tentar guardar o valor associado à chave ${item}.`,
            e
          )
        }
      })
    }
  }

  public obter(itens?: string | string[] | null): Record<string, unknown> {
    if (this.disponivel()) {
      if (itens === null || itens === undefined) {
        itens = Object.keys(this.storage!) as (keyof Record<string, string>)[]
      }
      if (!Array.isArray(itens)) itens = [itens]
      depurador.console.info(`[${this.tipo}Storage] Recuperando itens: `, itens)
      return itens.reduce((obj, item) => {
        const chaveOriginal = this.obterChaveOriginal(item)
        const chavePrefixada = this.obterChavePrefixada(item)
        const valorComprimido = this.storage?.getItem(chavePrefixada)
        if (valorComprimido === null || valorComprimido === undefined) {
          obj[chaveOriginal] = (this.defaults || {})[chaveOriginal]
        } else if (typeof valorComprimido === 'string') {
          const valor = decompress(valorComprimido)
          try {
            const dados = JSON.parse(valor)
            obj[chaveOriginal] = dados
          } catch (e) {
            obj[chaveOriginal] = valorComprimido
          }
        }
        return obj
      }, {} as Record<string, unknown>)
    }
    return {}
  }

  public atualizar(dados: Record<string, unknown>) {
    if (this.disponivel()) {
      const valoresAtuais = this.obter(Object.keys(dados))

      Object.keys(valoresAtuais).forEach(item => {
        const atualizacao = dados[item]
        const valorAtual = valoresAtuais[item]

        let novoValor
        if (Array.isArray(valorAtual) && Array.isArray(atualizacao)) {
          novoValor = [...valorAtual, ...atualizacao]
        } else if (tipoObjeto(valorAtual) && tipoObjeto(atualizacao)) {
          novoValor = { ...valorAtual, ...atualizacao }
        } else {
          novoValor = atualizacao
        }

        this.guardar({ [item]: novoValor })
      })
    }
  }

  public remover(itens: string | string[]): void {
    if (this.disponivel()) {
      if (!Array.isArray(itens)) itens = [itens]
      itens.forEach(item => this.storage?.removeItem(this.obterChavePrefixada(item)))
    }
  }

  public limparDadosCache() {
    this.remover(this.obterChaveCache())
  }

  public gravarCache(dados: TDadosExcel) {
    if (this.disponivel()) {
      // cache é sempre "zerado" antes 
      // de ser utilizado novamente
      this.limparDadosCache()
      const chave = this.obterChaveCache()
      const valor = JSON.stringify(dados)
      depurador.console.info(
        `[${this.tipo}Storage] Armazenando no cache (chave "${chave}"): `,
        valor
      )
      try {
        if (valor !== null && valor !== undefined) {
          this.storage?.setItem(chave, compress(valor))
          this.iniciarTimeoutCache()
        }
      } catch (e) {
        depurador.console.warn('Erro ao tentar gravar no cache.', e)
      }
    }
  }

  public lerCache(): TDadosExcel {
    const chave = this.obterChaveCache()
    const dados = this.obter(chave) as Record<string, TDadosExcel>
    depurador.console.info('Dados lidos no cache: ', dados[this.obterChaveOriginal(chave)])
    this.limparDadosCache()
    return dados[this.obterChaveOriginal(chave)]
  }

  public temCache(): boolean {
    const chave = this.obterChaveCache()
    const dados = this.obter(chave) as Record<string, TDadosExcel>
    return dados[this.obterChaveOriginal(chave)] !== undefined    
  }

  public limparConfig() {
    this.remover(this.obterChaveConfig())
  }

  public gravarConfig(dados: TDadosExcel, atualizar = true) {
    if (this.disponivel()) {
      depurador.console.info(`[${this.tipo}Storage] Armanzenando nas configurações: `, dados)
      const chave = this.obterChaveOriginal(this.obterChaveConfig())
      try {
        if (dados !== null && dados !== undefined) {
          if (atualizar) {
            this.atualizar({ [chave]: dados })
          } else {
            this.guardar({ [chave]: dados })
          }
        }
      } catch (e) {
        depurador.console.warn('Erro ao tentar gravar nas configurações.', e)
      }
    }
  }

  public removerItemConfig(item: string) {
    if (this.disponivel()) {
      try {
        if (item !== null && item !== undefined) {
          depurador.console.info(`[${this.tipo}Storage] Removendo item "${item}" das configurações`)
          const chave = this.obterChaveOriginal(this.obterChaveConfig())
          const dados = this.obter(chave) as Record<string, TDadosExcel>
          const dadosConfig = dados[chave] as TDadosExcel
          delete dadosConfig[item]
          this.gravarConfig(dadosConfig, false)
        }
      } catch (e) {
        depurador.console.warn('Erro ao tentar gravar nas configurações.', e)
      }
    }
  }

  public lerConfig(): TDadosExcel {
    const chave = this.obterChaveConfig()
    const dados = this.obter(chave) as Record<string, TDadosExcel>
    depurador.console.info('Dados lidos nas configurações: ', dados[this.obterChaveOriginal(chave)])
    return dados[this.obterChaveOriginal(chave)]
  }

  public temConfig(): boolean {
    const chave = this.obterChaveConfig()
    const dados = this.obter(chave) as Record<string, TDadosExcel>
    return dados[this.obterChaveOriginal(chave)] !== undefined    
  }

  public limparDadosTransferencia() {
    this.remover(this.obterChaveTransferencia())
    this.remover(this.obterChavePastasDeTrabalho())
  }

  public gravarDadosTransferencia(pastaDeTrabalho: string, dados: TDadosTransferencia) {
    if (this.disponivel()) {
      // Note-se: a transferência nunca é "zerada" automaticamente
      // Isso é proposital: para permitir que os dados de várias
      // planilhas sejam cumulados
      const chave = this.obterChaveTransferencia()
      const chavePastasDeTrabalho = this.obterChavePastasDeTrabalho()
      const dadosGravados = this.recuperarDadosTransferencia() || {}
      const pastasDeTrabalho = this.recuperarPastasDeTrabalho()
      pastasDeTrabalho.push(pastaDeTrabalho)
      const valor = JSON.stringify(Object.assign(dadosGravados, dados))
      const valorPastasDeTrabalho = JSON.stringify(pastasDeTrabalho)
      depurador.console.info(`[${this.tipo}Storage] Gravando dados para transferência, pasta de trabalho "${pastaDeTrabalho}"`)
      try {
        if (valor !== null && valor !== undefined) {
          this.storage?.setItem(chave, compress(valor))
          this.storage?.setItem(chavePastasDeTrabalho, compress(valorPastasDeTrabalho))
          this.iniciarTimeoutTransferencia()
        }
      } catch (e) {
        depurador.console.warn('Erro ao tentar gravar dados para transferência.', e)
      }
    }
  }

  public recuperarDadosTransferencia(): TDadosTransferencia {
    const chave = this.obterChaveTransferencia()
    const dados = this.obter(chave) as Record<string, TDadosTransferencia>
    depurador.console.info('Dados recuperados da transferência: ', dados[this.obterChaveOriginal(chave)])
    return dados[this.obterChaveOriginal(chave)]
  }

  public recuperarPastasDeTrabalho(): TPastasDeTrabalho {
    const chave = this.obterChavePastasDeTrabalho()
    const dados = this.obter(chave) as Record<string, TPastasDeTrabalho>
    depurador.console.info('Pastas de trabalho: ', dados[this.obterChaveOriginal(chave)] || [])
    return dados[this.obterChaveOriginal(chave)] || []
  }

  public temDadosTransferencia(): boolean {
    const chave = this.obterChaveTransferencia()
    const dados = this.obter(chave) as Record<string, TDadosExcel>
    return dados[this.obterChaveOriginal(chave)] !== undefined
  }
}

export const armazenamento = new Armazenamento(APP_STORAGE_KEY, {})
