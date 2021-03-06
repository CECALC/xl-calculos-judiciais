import { IChoiceGroupOption } from '@fluentui/react'
import { humanizar } from '@cecalc/utils'
import { armazenamento } from './armazenamento'
import { obterItensDisponiveisConfig, PREFIXO, TFormulaExcel, TValorExcel } from './excel'

const prefixo = new RegExp(`^${PREFIXO.PESSOAL}`)
const prefixoFormula = new RegExp(`^${PREFIXO.PESSOAL_FORMULA}`)

function ordenarOpcoes(a: IChoiceGroupOption, b: IChoiceGroupOption): 0 | 1 | -1 {
  const la = a.text.toLowerCase()
  const lb = b.text.toLowerCase()
  return la < lb ? -1 : la > lb ? 1 : 0
}

export async function obterOpcoesDisponiveis(): Promise<IChoiceGroupOption[]> {
  const itensNomeados = await obterItensDisponiveisConfig()
  return itensNomeados
    .map(item => {
      const humanizado = humanizar(item.name.replace(prefixoFormula, '').replace(prefixo, ''))
      return {
        key: item.name,
        text: humanizado
      }
    })
    .sort(ordenarOpcoes)
}

export function obterDadosConfig(): IChoiceGroupOption[] {
  const config = armazenamento.lerConfig() as Record<string, TValorExcel[][] | TFormulaExcel[][]>
  console.log(config)
  const opcoes = [] as IChoiceGroupOption[]
  if (!config) return opcoes
  const itens = Object.keys(config) as string[]

  for (let i = 0; i < itens.length; i++) {
    const item = itens[i]
    const humanizado = humanizar(item.replace(prefixoFormula, '').replace(prefixo, ''))
    opcoes.push({
      key: item,
      text: humanizado,
      value: config[item][0][0].toString()
    })

  }
  return opcoes.sort(ordenarOpcoes)
}

export function alterarItemConfig(intervalo: string, valor: string) {
  armazenamento.gravarConfig({ [intervalo]: [[valor]] })
}

export function removerItemConfig(intervalo: string) {
  armazenamento.removerItemConfig(intervalo)
}

export function limparConfig() {
  armazenamento.limparConfig()
}
