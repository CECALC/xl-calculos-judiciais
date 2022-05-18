import {
  adicionarNaData,
  antesDe,
  dias360,
  diasSobrepostos,
  METODO_DIAS_360,
  TIPO_DURACAO
} from '@cecalc/utils'
import { depurador } from '..'


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
