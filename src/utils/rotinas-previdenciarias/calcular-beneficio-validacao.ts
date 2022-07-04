import { tipoData, tipoNumero } from '@cecalc/utils'
import { IDadosBeneficio, IParametrosCalculo } from './calcular-beneficio'

export function validarParametrosCalculoBeneficio(parametros: IParametrosCalculo): boolean {
  const { indiceReposicaoTeto, equivalenciaSalarial, dataAtualizacao } = parametros
  return (
    (tipoNumero(indiceReposicaoTeto) && indiceReposicaoTeto >= 0) &&
    (!tipoNumero(equivalenciaSalarial) || equivalenciaSalarial >= 0) &&
    (tipoData(dataAtualizacao) && dataAtualizacao.valueOf() <= new Date().valueOf())    
  )
}

export function validarOriginario(originario: Partial<IDadosBeneficio>, temDerivado: boolean, abaixoDominimo: boolean): boolean {
  const { rmi, dib, dcb, percentualMinimo } = originario
  return (
    (tipoNumero(rmi) && rmi >= 0) &&
    (tipoData(dib) && dib.valueOf() <= new Date().valueOf()) &&
    (!abaixoDominimo || (tipoNumero(percentualMinimo) && percentualMinimo >= 0 && percentualMinimo <= 100)) &&
    (!temDerivado || tipoData(dcb)) &&
    (!tipoData(dcb) || dcb.valueOf() >= dib.valueOf())
  )
}

export function validarDerivado(derivado: Partial<IDadosBeneficio>, temDerivado: boolean, abaixoDominimo: boolean): boolean {
  const { rmi, dib, dcb, percentualMinimo } = derivado
  if (!temDerivado) return true
  return (
    (tipoNumero(rmi) && rmi >= 0) &&
    (tipoData(dib) && dib.valueOf() <= new Date().valueOf()) &&
    (!abaixoDominimo || (tipoNumero(percentualMinimo) && percentualMinimo >= 0 && percentualMinimo <= 100)) &&
    (!tipoData(dcb) || dcb.valueOf() >= dib.valueOf())
  )
}
