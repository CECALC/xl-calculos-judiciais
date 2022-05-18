export enum TIPO_OPERACAO {
  ADICAO = 'adicao',
  SUBTRACAO = 'subtracao'
}

export enum TIPO_NUMERO {
  ANOS = 'anos',
  MESES = 'meses',
  DIAS = 'dias'
}

export type TNumeros = {
  primeiro: Record<TIPO_NUMERO, number>
  segundo: Record<TIPO_NUMERO, number>
}

export interface IParametros {
  numeros: TNumeros
  operacao: TIPO_OPERACAO
}

export function calcularTempo(parametros: IParametros) {
  const { numeros, operacao } = parametros
  const primeiro = { ...numeros.primeiro }
  const segundo = { ...numeros.segundo }

  const totalDiasPrimeiro =
    (primeiro.anos || 0) * 360 + (primeiro.meses || 0) * 30 + (primeiro.dias || 0)
  const totalDiasSegundo =
    (segundo.anos || 0) * 360 + (segundo.meses || 0) * 30 + (segundo.dias || 0)
  const totalDias =
    operacao === TIPO_OPERACAO.ADICAO
      ? totalDiasPrimeiro + totalDiasSegundo
      : totalDiasPrimeiro - totalDiasSegundo

  const anos = Math.floor(Math.abs(totalDias) / 360)
  const meses = Math.floor((Math.abs(totalDias) - anos * 360) / 30)
  const dias = Math.abs(totalDias) - anos * 360 - meses * 30

  return {
    totalDias,
    anos: anos,
    meses: meses,
    dias: dias
  }
}
