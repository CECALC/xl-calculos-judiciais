import { dias360, METODO_DIAS_360 } from '@cecalc/utils'

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
