import { criarItensNomeados, definirValorDoIntervalo, TValorExcel } from "./excel"
import { depurador } from '../utils'
import { semAcentuacao } from "@cecalc/utils"

class AtualizacaoIndices {
  static _instancia: AtualizacaoIndices
  static endpoint = 'https://contadoria.herokuapp.com/api/indicesConsolidados/download'

  private dados = [] as TValorExcel[][]
 
  constructor() {
    if (AtualizacaoIndices._instancia) return AtualizacaoIndices._instancia
    AtualizacaoIndices._instancia = this
  }

  private lerCsv(csv: string): TValorExcel[][] {
    const linhas = csv.split('\n')
    const tabela = linhas
      .map(linha => linha.split(';')
      .map(celula => celula.trim().replace(',', '.')))
      .map((linha, indice) => {
        // pula cabecalhos
        if (indice === 0) {
          return linha.map(cabecalho => {
            cabecalho = semAcentuacao(cabecalho.trim())
            const primeiraLetra = (cabecalho as string).charAt(0).toUpperCase()
            return primeiraLetra + cabecalho.substring(1)
          })
        }
        return linha.map((celula, indice) => {
          // processa competências
          if (indice === 0) {
            const [dia, mes, ano] = celula.split('/').map(Number)
            return new Date(ano, mes - 1, dia, 0, 0, 0, 0)
          }
          const numero = Number(celula)
          return isNaN(numero) ? 0 : numero
        })
      })
    return tabela as TValorExcel[][]
  }

  public async obterDados(cache = true): Promise<TValorExcel[][]> {
    if (cache && this.dados.length > 0) return this.dados

    return new Promise((resolve, reject) => {
      let sucesso = false
      const request = new XMLHttpRequest()

      request.onload = () => {
        let tabela
        try {
          tabela = this.lerCsv(request.response.trim())
          sucesso = true
          resolve(tabela)
        } catch (e) {
          reject(e)
        }
      }
      request.onerror = () => reject()

      request.open('GET', AtualizacaoIndices.endpoint)
      request.send()

      setTimeout(() => {
        if (sucesso) return
        request.abort()
        reject(new Error('Espera excedeu 10 segundos'))
      }, 10000)
    })
  }

  public async atualizarPlanilha() {
    this.dados = await this.obterDados(false)

    const referencia = 'A1'
    const nomePlanilha = 'IndicesConsolidados'
    const limparPlanilha = true
    const formatoNumero = '#0.000000000;(#0.00000000)'
    const formatoData = 'dd/MM/yyyy'
  
    await definirValorDoIntervalo(this.dados, referencia, nomePlanilha, limparPlanilha, formatoNumero, formatoData)
  
    const itensNomeados = this.dados[0].map((cabecalho, indice) => {
      const char = String.fromCharCode(65 + indice)
      return {
        nome: cabecalho as string,
        endereco: `$${char}$1:$${char}$${this.dados.length + 1}`
      }
    })
  
    depurador.console.log(itensNomeados)
  
    await criarItensNomeados(nomePlanilha, itensNomeados)
  }
}

export const atualizacaoIndices = new AtualizacaoIndices()
