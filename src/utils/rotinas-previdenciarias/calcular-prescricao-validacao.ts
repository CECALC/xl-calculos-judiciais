import { tipoData, tipoNumero } from '@cecalc/utils'

export function validarParametrosCalculoPrescricao(
  prazo?: number,
  termoInicial?: Date,
  marcoInterruptivo?: Date,
  inicioSuspensao?: Date,
  fimSuspensao?: Date
): boolean {
  return (
    (tipoNumero(prazo) && prazo >= 0) &&
    (tipoData(termoInicial) && termoInicial.valueOf() <= new Date().valueOf()) &&
    (tipoData(marcoInterruptivo) && marcoInterruptivo.valueOf() <= new Date().valueOf()) &&
    (tipoData(inicioSuspensao) && inicioSuspensao.valueOf() <= new Date().valueOf()) &&
    (tipoData(fimSuspensao) && fimSuspensao.valueOf() <= new Date().valueOf())
  )
}
