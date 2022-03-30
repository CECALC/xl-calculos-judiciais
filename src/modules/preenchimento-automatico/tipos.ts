import type { TTabela, TCelula } from '@cecalc/utils/dist/utils'

export interface IParametro {
  intervalo: string | string[]
  competenciaInicial?: Date
  competenciaFinal?: Date
  dados: TTabela<TCelula>
}

export interface IOpcao {
  nome: string
  sobreposicao: boolean
  parametros: IParametro[]
}

export interface IResultado {
  nome: string
  resumo: string[][]
  opcoes: IOpcao[]
}

export interface IAnalisador {
  analisar(texto: string): IResultado
}

export interface IModulo {
  testar: (texto: string) => boolean
  new(): IAnalisador
}
