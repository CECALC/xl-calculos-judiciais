import {
  adicionarNaData,
  antesDe,
  converterDataEmString,
  dias360,
  diasSobrepostos,
  FORMATO_DATA,
  METODO_DIAS_360,
  TIPO_DURACAO
} from '@cecalc/utils/dist/utils'
import { depurador } from '../../utils'

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

export const hoje = converterDataEmString(new Date(), FORMATO_DATA.LOCALIDADE_ABREVIADO)

export function calcularIntervalo(dataInicial: Date, dataFinal: Date, metodo: METODO_DIAS_360) {
  try {
    const multiplicador = dataInicial.valueOf() <= dataFinal.valueOf() ? 1 : -1

    const totalDias =
      multiplicador === 1
        ? dias360(dataInicial, dataFinal, metodo)
        : dias360(dataFinal, dataInicial, metodo)

    const anos = Math.floor(totalDias / 360)
    const meses = Math.floor((totalDias - anos * 360) / 30)
    const dias = totalDias - anos * 360 - meses * 30

    return {
      totalDias: totalDias * multiplicador,
      anos: anos * multiplicador,
      meses: meses * multiplicador,
      dias: dias * multiplicador
    }
  } catch (e) {
    return { totalDias: 0, anos: 0, meses: 0, dias: 0 }
  }
}

export function calcularPrescricao(
  prazo: number,
  termoInicial: Date,
  marcoInterruptivo: Date,
  inicioSuspensao: Date,
  fimSuspensao: Date
) {
  try {
    const inicio = antesDe(termoInicial, marcoInterruptivo) ? termoInicial : marcoInterruptivo
    const interrupcao = antesDe(marcoInterruptivo, termoInicial) ? marcoInterruptivo : termoInicial

    depurador.inspecionar('início: ', inicio.toLocaleString())
    depurador.inspecionar('interrupção: ', interrupcao.toLocaleString())

    let recuo = adicionarNaData(marcoInterruptivo, -prazo, TIPO_DURACAO.MESES)
    depurador.inspecionar('recuo: ', recuo.toLocaleString())

    const positivo = antesDe(inicioSuspensao, fimSuspensao)

    const inicioPrimeiro = recuo
    const fimPrimeiro = interrupcao
    const inicioSegundo = positivo ? inicioSuspensao : fimSuspensao
    const fimSegundo = positivo ? fimSuspensao : inicioSuspensao

    const sobreposicao = diasSobrepostos(inicioPrimeiro, fimPrimeiro, inicioSegundo, fimSegundo)

    depurador.inspecionar('sobrepostos: ', sobreposicao)

    let diasSuspensao = 0

    if (sobreposicao > 0) {
      diasSuspensao = dias360(inicioSuspensao, fimSuspensao, METODO_DIAS_360.EXCEL)
      if (diasSuspensao > 0) {
        recuo = adicionarNaData(recuo, -diasSuspensao, TIPO_DURACAO.DIAS)
      }
      depurador.inspecionar('dias suspensão: ', diasSuspensao)
      depurador.inspecionar('novo recuo: ', recuo.toLocaleString())
    }

    const inicioPrescricao = antesDe(inicio, recuo) ? inicio : recuo

    depurador.inspecionar('marco prescricional: ', inicioPrescricao.toLocaleString())

    return {
      diasSuspensao,
      inicioPrescricao
    }
  } catch (e) {
    return {
      diasSuspensao: 0,
      inicioPrescricao: new Date()
    }
  }
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
