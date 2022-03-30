import { depurador } from '../utils'
import { compress, decompress } from 'lz-string'
import { tipoObjeto } from '@cecalc/utils/dist/utils'
import { IArmazenamento } from './excel'

// baseado em: https://github.com/mesmerised/persistme

const APP_STORAGE_KEY = '__cecalc_supl.xl__'

class Armazenamento {
  static _instancia: Armazenamento
  static excesso = {
    codigo: 0,
    nome: ''
  }

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

  private obterChavePrefixada(item: string): string {
    return item.startsWith(`${this.app}.`) ? item : `${this.app}.${item}`
  }

  private obterChaveOriginal(chave: string): string {
    return chave.startsWith(`${this.app}.`) ? chave.replace(`${this.app}.`, '') : chave
  }

  private obterChaveCache(): string {
    return this.obterChavePrefixada('_cache_')
  }

  private obterChaveConfig(): string {
    return this.obterChavePrefixada('_config_')
  }

  public guardar(dados: Record<string, unknown>) {
    if (this.disponivel()) {
      depurador.inspecionar(`[${this.tipo}Storage] Armanzenando: `, dados)
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
      depurador.inspecionar(`[${this.tipo}Storage] Recuperando itens: `, itens)
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

  public limparCache() {
    this.remover(this.obterChaveCache())
  }

  public gravarCache(dados: IArmazenamento) {
    if (this.disponivel()) {
      const chave = this.obterChaveCache()
      const valor = JSON.stringify(dados)
      depurador.inspecionar(
        `[${this.tipo}Storage] Armanzenando no cache (chave "${chave}"): `,
        valor
      )
      try {
        if (valor !== null && valor !== undefined) {
          this.storage?.setItem(chave, compress(valor))
        }
      } catch (e) {
        depurador.console.warn('Erro ao tentar gravar no cache.', e)
      }
    }
  }

  public lerCache(): IArmazenamento {
    const chave = this.obterChaveCache()
    const dados = this.obter(chave) as Record<string, IArmazenamento>
    depurador.inspecionar('Dados lidos no cache: ', dados[this.obterChaveOriginal(chave)])
    return dados[this.obterChaveOriginal(chave)]
  }

  public limparConfig() {
    this.remover(this.obterChaveConfig())
  }

  public gravarConfig(dados: IArmazenamento, atualizar = true) {
    if (this.disponivel()) {
      depurador.inspecionar(`[${this.tipo}Storage] Armanzenando nas configurações: `, dados)
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
          const dados = this.obter(chave) as Record<string, IArmazenamento>
          const dadosConfig = dados[chave] as IArmazenamento
          delete dadosConfig[item]
          this.gravarConfig(dadosConfig, false)
        }
      } catch (e) {
        depurador.console.warn('Erro ao tentar gravar nas configurações.', e)
      }
    }
  }

  public lerConfig(): IArmazenamento {
    const chave = this.obterChaveConfig()
    const dados = this.obter(chave) as Record<string, IArmazenamento>
    depurador.inspecionar('Dados lidos nas configurações: ', dados[this.obterChaveOriginal(chave)])
    return dados[this.obterChaveOriginal(chave)]
  }
}

export const armazenamento = new Armazenamento(APP_STORAGE_KEY, {})
