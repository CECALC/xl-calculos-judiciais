import { depurador } from "../utils"
import { criarItensNomeados, definirValorDoIntervalo, TValorExcel } from "./excel"

export async function atualizarIndices(csv: string): Promise<void> {
  const linhas = csv.split('\n')
  const tabela = linhas
    .map(linha => linha.split(';')
    .map(celula => celula.trim().replace(',', '.')))
    .map((linha, indice) => {
      // pula cabecalhos
      if (indice === 0) {
        return linha
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
  depurador.console.log(tabela)

  const referencia = 'A1'
  const nomePlanilha = 'IndicesConsolidados'
  const limparPlanilha = true
  const formatoNumero = '#0.000000000;(#0.00000000)'
  const formatoData = 'dd/MM/yyyy'

  await definirValorDoIntervalo(tabela as TValorExcel[][], referencia, nomePlanilha, limparPlanilha, formatoNumero, formatoData)

  const itensNomeados = tabela.shift()!.map((cabecalho, indice) => {
    const char = String.fromCharCode(65 + indice)
    return {
      nome: cabecalho as string,
      endereco: `$${char}:$${char}`
    }
  })

  depurador.console.log(itensNomeados)

  await criarItensNomeados(nomePlanilha, itensNomeados)
} 