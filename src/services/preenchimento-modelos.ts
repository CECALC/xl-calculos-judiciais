import { aspasSimples, CData, porExtenso, tipoString } from "@cecalc/utils";
import { depurador } from "../utils";
import { localizarTrechosComPadrao, substituirTrechos } from './word'

export interface IItemTag {
  tag: string
  substituicao: string
}

export class PreenchimentoModelos {
  static _instancia: PreenchimentoModelos

  static Linguagem = {
    Tag: /\{\{(.+?)\}\}/,
    Sintaxe: {
      Disjuncao: /\|\|/,
      Conjuncao: /&&/,
      Pipe: />>/
    } as Record<string, RegExp>,
    Comandos: {
      Tabela: /^\[(.+?)\]$/,
      Literal: /^"(.+?)"$/,
      Formato: /^%(.+?)%$/,
      Hoje: /^HOJE$/,
      Valor: /(.+?)/
    } as Record<string, RegExp>,
    Subcomandos: {
      Elemento: /<(.+?)>/,
      Coluna: /(.*)\$\((\d+)\)(.*)/,
    } as Record<string, RegExp>
  }
  
  static Macros: Record<string, string> = {
    DIB: ' DIB || DIBOriginario || DER || "-" ',
    DER: ' DER || "-" ',
    DCB: ' DCB || DCBOriginario || "-" ',
    RMI: ' RMI || RMIInformada || RMIOriginario || "-" ',
    RMI_Extenso: ' RMI >> %$Extenso% || RMIInformada >> %$Extenso% || RMIOriginario >> %$Extenso% || "-" ',
    RMA: ' RMA || RMAOriginario || "-" ',
    RMA_Extenso: ' RMA >> %$Extenso% || RMAOriginario >> %$Extenso% || "-" ',
    HOJE: ' HOJE >> %DataAbrev% ',
    HOJE_Extenso: ' HOJE >> %DataExt% ',
    TC: ' [TCProcessado;SEQ) de <$(1)> a <$(2)> (<$(3)><, $(4)>)] || "-" ',
    Especie: ' [Especie;<$(1)>< - $(2)>] || "-" ',
    NB: ' NB || NBOriginario || "-" ',
    Processo: ' Processo || "-" ',
    Autor: ' Autor || "-" ',
    Reu: ' Reu || "-" ',
    Citacao: ' Citacao || "-" ',
    Protocolo: ' Protocolo || "-" '
  }

  private dados: Record<string, string[][]> | undefined 
  private hoje = new Date().toLocaleDateString()

  constructor() {
    if (PreenchimentoModelos._instancia) return PreenchimentoModelos._instancia

    PreenchimentoModelos._instancia = this
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  private escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }
  
  // https://docs.microsoft.com/en-us/office/dev/add-ins/word/search-option-guidance#escaping-special-characters
  private escapeChaves(s: string) {
    return s.replace(/[{}]/g, '[$&]')
  }

  private processarTabela(expressao: string): string | null {
    /**
     * sintaxe: {{[referencia;template]}}
     * template (exemplo): "<$(1)> a <$(2)> (<$(4)><, $(3)>)"
     * no template, pode-se usar o metacaractere "SEQ", que é automaticamente substituído pelo número da linha
     */
    if (!tipoString(expressao) || !expressao.length || !this.dados) return null
  
    const [referencia, template] = expressao.replace(PreenchimentoModelos.Linguagem.Comandos.Tabela, '$1').split(';')
    if (!referencia || !template) return null
  
    const tabela = this.dados[referencia]
    if (!tabela) return null
  
    const resultado = tabela.map((linha, indice) => {
      const pontuacao = tabela.length === 1 ? '' : (indice === (tabela.length - 1) ? '.' : (indice === (tabela.length - 2) ? '; e' : ';'))
      const subcomandos = template.match(new RegExp(PreenchimentoModelos.Linguagem.Subcomandos.Elemento.source, 'g'))
      if (!Array.isArray(subcomandos)) return ''
      const mapa = subcomandos.map(elemento => {
        const coluna = parseInt(elemento.replace(PreenchimentoModelos.Linguagem.Subcomandos.Coluna, '$2'), 10)
        const celula = linha[coluna - 1];
        return {
          padrao: new RegExp(this.escapeRegExp(elemento).replace(/\\/, '\\')),
          novo: celula ? elemento.replace(PreenchimentoModelos.Linguagem.Subcomandos.Elemento, '$1').replace(PreenchimentoModelos.Linguagem.Subcomandos.Coluna, '$1' + celula + '$3') : ''
        }
      })
      
      return mapa.reduce((texto, item) => texto.replace(item.padrao, item.novo), template.replace(/SEQ/, (indice + 1).toString())) + pontuacao;
    })
    
    return resultado.length > 0 ? resultado.join('\r') : null
  }
  
  private processarLiteral(expressao: string): string | null {
    if (!tipoString(expressao) || !expressao.length) return null
    return expressao.replace(PreenchimentoModelos.Linguagem.Comandos.Literal, '$1')
  }
  
  private aplicarFormato(expressao: string, argumento?: string): string | null {
    if (!tipoString(expressao) || !expressao.length || !argumento) return null
  
    const comando = expressao.replace(PreenchimentoModelos.Linguagem.Comandos.Formato, '$1').toLowerCase()
  
    let data
    switch (comando) {
      case 'extenso':
        return porExtenso(argumento, false)
      case '$extenso':
        return porExtenso(argumento, true)
      case 'dataabrev':
        data = new CData(argumento)
        return data.dataValida() ? data.local() : argumento
      case 'dataext':
        data = new CData(argumento)
        return data.dataValida() ? data.humanizada() : argumento
      default:
        return null
    }
  }
  
  private obterValor(expressao: string): string | null {
    if (!tipoString(expressao) || !expressao.length) return null
    if (!this.dados) return null

    if (this.dados[expressao]) {
      return this.dados[expressao][0][0]
    }
    return null
  }
  
  private processar(comando: string, expressao: string, argumento?: string): string | null {
    switch (comando.toLowerCase()) {
      case 'tabela':
        return this.processarTabela(expressao)
      case 'literal':
        return this.processarLiteral(expressao)
      case 'formato': 
        return this.aplicarFormato(expressao, argumento)
      case 'hoje':
        return this.hoje
      case 'valor':
        return this.obterValor(expressao)
      default:
        return null
    }    
  }

  private executarExpressao(expressao: string): string | null {
    if (!tipoString(expressao) || !expressao.length || !this.dados) return null
  
    const subexpressoes = expressao.split(PreenchimentoModelos.Linguagem.Sintaxe.Pipe).map(subexpressao => subexpressao.trim())
    const comandos = Object.keys(PreenchimentoModelos.Linguagem.Comandos)

    let resultado = null
    for (let i = 0; i < subexpressoes.length; i++) {
      const subexpressao = subexpressoes[i]
      for (let j = 0; j < comandos.length; j++) {
        const comando = comandos[j]
        if (PreenchimentoModelos.Linguagem.Comandos[comando].test(subexpressao)) {
          resultado = this.processar(comando, subexpressao, resultado || undefined)
          break
        }
      }
    }
    return resultado
  }

  private interpretar(comando: string): string | null {
    const baixoNivel = PreenchimentoModelos.Macros[comando] || comando

    const expressoes = baixoNivel.split(PreenchimentoModelos.Linguagem.Sintaxe.Disjuncao).map(expressao => expressao.trim())
    for (let i = 0; i < expressoes.length; i++) {
      const expressao = expressoes[i]
      const parciais = expressao.split(PreenchimentoModelos.Linguagem.Sintaxe.Conjuncao).map(subexpressao => this.executarExpressao(subexpressao))

      if (parciais.some(parcial => parcial === null)) continue
      return parciais.join('')
    }
    return null
  }

  private async mapearTags(): Promise<IItemTag[] | null> {
    if (!this.dados) return null

    const trechos = await localizarTrechosComPadrao(new RegExp(PreenchimentoModelos.Linguagem.Tag.source, 'g'))
    const unicos = trechos.filter((v, i, arr) => arr.indexOf(v) === i)
  
    return unicos.reduce((itens, tag) => {
      const comando = aspasSimples(tag.replace(PreenchimentoModelos.Linguagem.Tag, '$1'))
      const resultado = this.interpretar(comando)
      if (resultado) itens.push({ tag: tag, substituicao: resultado })
      return itens
    }, [] as IItemTag[])
  }

  public preencher = async (dados?: Record<string, string[][]>) => {
    this.dados = dados
  
    const tags = await this.mapearTags()
    if (!tags) return
  
    depurador.console.log(tags)

    // Fundamental a ordem reversa, para não confundir os limites
    // dos intervalos, devido à execução assíncrona da substituição
    tags.reverse().forEach(async (item) => await substituirTrechos(item.tag, item.substituicao))
  }  
}

export const preenchimentoModelos = new PreenchimentoModelos()
