import {
  diferencaEntreDatas,
  primeiroDiaDoMes,
  tipoData,
  tipoNumero,
  TIPO_DURACAO,
  ultimoDiaDoMes
} from '@cecalc/utils'
import { atualizacaoIndices } from '../../services'
import { depurador } from '..'

export interface IDadosBeneficio {
  dib: Date
  rmi: number
  dcb?: Date
  percentualMinimo: number
}

export interface IDadosReajuste {
  competencia: Date
  indiceProporcional: number
  indiceIntegral: number
  dataBase: boolean
  piso: number
  teto: number
}

export interface IParametrosCalculo {
  indiceReposicaoTeto: number
  equivalenciaSalarial?: number
  calcularAbono: boolean
  dataAtualizacao: Date
}

export async function calcularBeneficio(
  parametros: IParametrosCalculo,
  originario: Partial<IDadosBeneficio>, 
  derivado?: Partial<IDadosBeneficio>
): Promise<[Date, number, number][]> {
  
  let { dataAtualizacao, calcularAbono, indiceReposicaoTeto, equivalenciaSalarial } = parametros 
  
  /*
  *
  * BLOCO DE VALIDAÇÃO
  *
  **/
  if (!tipoData(originario.dib)) { 
    throw new Error('DIB do benefício originário irregular.'); 
  }
  
  if (!tipoNumero(originario.rmi)) { 
    throw new Error('RMI do benefício originário irregular.'); 
  }
  
  if (derivado && !tipoNumero(derivado.rmi)) { 
    throw new Error('RMI do benefício derivado irregular.'); 
  }

  if (derivado && !tipoData(derivado.dib)) { 
    throw new Error('DIB do benefício derivado irregular.'); 
  }

  if (!tipoData(dataAtualizacao)) { 
    throw new Error('Data de atualização irregular.'); 
  }
  
  if (!tipoNumero(indiceReposicaoTeto) || indiceReposicaoTeto < 1) {
    indiceReposicaoTeto = 1;
  }
  
  if (!tipoNumero(equivalenciaSalarial) || equivalenciaSalarial < 0) {
    equivalenciaSalarial = undefined;
  }

  const tabelaReajuste = await atualizacaoIndices.obterDados(true)
  tabelaReajuste.shift()

  const dadosReajuste: IDadosReajuste[] = tabelaReajuste.map(linha => {
    const competencia = new Date(linha[0] as number)
    const janeiro = competencia.getMonth() === 0
    return {
      competencia,
      indiceProporcional: 1 + (linha[6] as number),
      indiceIntegral: 1 + (linha[5] as number),
      dataBase: janeiro,
      piso: linha[1] as number,
      teto: linha[4] as number
    }
  })

  depurador.console.log(dadosReajuste)

  const gerarData = (s: string) => {
    const [dia, mes, ano] = s.split('/').map(Number)
    return new Date(ano, mes - 1, dia, 0, 0, 0, 0)
  }

  const PROMULGACAO_CF_88 = gerarData('06/10/1988')
  const EFEITOS_LEI_8213 = gerarData('05/04/1991')
  const MARCO_FINAL_ART_144 = gerarData('01/06/1992') // data em que cessam os efeitos financeiros do art. 144 da Lei nº 8.213/91
  
  const temDerivado = !!derivado && tipoData(originario.dcb);

  /*
  * Nos termos do art. 58 do ADCT, o referido dispositivo se aplica aos benefícios mantidos NA data de promulgação
  * da CF/88, ou seja, 05/10/1988. Assim, se o benefício foi concedido até essa data, inclusive, a equivalência
  * salarial deve ser aplicada.
  **/
  const aplicarArt58 = tipoNumero(parametros.equivalenciaSalarial) && originario.dib.valueOf() < PROMULGACAO_CF_88.valueOf();
  
  const guardarTeto = (competencia: Date) => {
    const posteriorCF = originario.dib!.valueOf() >= PROMULGACAO_CF_88.valueOf()
    const buracoNegro = originario.dib!.valueOf() < EFEITOS_LEI_8213.valueOf()
    const periodoAbrangencia = competencia.valueOf() < MARCO_FINAL_ART_144.valueOf()
    return posteriorCF && buracoNegro && periodoAbrangencia
  }
  
  /*
  * No caso de aplicação do art. 58 do ADCT, adota-se como termo inicial a competência 12/1991
  * porque foi a partir de 01/01/1992 que deixou de vigorar a equivalência salarial
  **/
  const dataInicialDiferencas = aplicarArt58 ? gerarData('01/12/1991') : new Date(originario.dib.getTime())
  const dataFinalDiferencas = temDerivado 
  ? tipoData(derivado.dcb) ? derivado.dcb : ultimoDiaDoMes(parametros.dataAtualizacao, 0)
  : tipoData(originario.dcb) ? originario.dcb : ultimoDiaDoMes(parametros.dataAtualizacao, 0)
  
  const competenciaInicial = primeiroDiaDoMes(dataInicialDiferencas, 0)
  const competenciaFinal = primeiroDiaDoMes(dataFinalDiferencas, 0)
  const totalCompetencias = diferencaEntreDatas(competenciaInicial, competenciaFinal, TIPO_DURACAO.MESES) + 1
  
  const proporcaoInicial = (totalCompetencias === 1)
  ? ((Math.min(30, dataFinalDiferencas.getDate()) - Math.min(dataInicialDiferencas.getDate())) + 1) / 30
  : Math.max(1, 30 - (dataInicialDiferencas.getDate() - 1)) / 30
  
  const proporcaoFinal = (totalCompetencias === 1)
  ? ((Math.min(30, dataFinalDiferencas.getDate()) - Math.min(30, dataInicialDiferencas.getDate())) + 1) / 30
  : dataFinalDiferencas.getMonth() === 1 && dataFinalDiferencas.getDate() > 27 ? 1 : Math.min(30, dataFinalDiferencas.getDate())/ 30
  
  var abonoMaior15Dias = (totalCompetencias === 1) ? dataFinalDiferencas.getDate() - dataInicialDiferencas.getDate() + 1 >= 15 : true
  
  calcularAbono = calcularAbono && abonoMaior15Dias

  let dataUltimoAbono: Date
  let dataPrimeiroAbono: Date
  let proporcaoPrimeiroAbono: number
  let proporcaoUltimoAbono: number

  if (calcularAbono) {
    
    const primeiroAno = dataInicialDiferencas.getFullYear()
    const ultimoAno = dataFinalDiferencas.getFullYear()
    
    if (temDerivado && tipoData(derivado.dcb)) {
      dataUltimoAbono = new Date(derivado.dcb.getTime())
    } else if (!temDerivado && tipoData(originario.dcb)) {
      dataUltimoAbono = new Date(originario.dcb.getTime())
    } else if (dataFinalDiferencas.getMonth() === 11 || primeiroAno === ultimoAno) {
      dataUltimoAbono = new Date(dataFinalDiferencas.getTime())
    } else {
      dataUltimoAbono = new Date(dataFinalDiferencas.getTime() + 1000 * 60 * 60 * 24 * 30) // somando um mês
    }

    const calcularProporcaoAbono = (dataInicial: Date, dataFinal: Date) => {
      const totalCompetencias = diferencaEntreDatas(dataInicial, dataFinal, TIPO_DURACAO.MESES) + 1
      const subtrairCompetenciaInicial = dataInicial.getDate() > 16
      const subtrairCompetenciaFinal = dataFinal.getDate() < 15
      const competenciasEfetivas = totalCompetencias - (subtrairCompetenciaInicial ? 1 : 0) - (subtrairCompetenciaFinal ? 1 : 0)
      return competenciasEfetivas / 12;
    }
    
    if (primeiroAno === ultimoAno) {
      dataPrimeiroAbono = dataUltimoAbono
      proporcaoPrimeiroAbono = 0
      proporcaoUltimoAbono = dataUltimoAbono ? calcularProporcaoAbono(dataInicialDiferencas, dataUltimoAbono) : 0
    } else {
      dataPrimeiroAbono = gerarData(`01/12/${primeiroAno}`)
      proporcaoPrimeiroAbono = calcularProporcaoAbono(dataInicialDiferencas, gerarData(`31/12/${primeiroAno}`))
      if (dataUltimoAbono.valueOf() <= new Date(dataFinalDiferencas.getTime()).valueOf()) {
        proporcaoUltimoAbono = calcularProporcaoAbono(gerarData(`01/01/${ultimoAno}`), dataUltimoAbono)
      } else {
        proporcaoUltimoAbono = 0
      }
    }
  }
  
  const datasBase = dadosReajuste
    .filter(item => item.dataBase && item.competencia.valueOf() > competenciaInicial.valueOf() && item.competencia.valueOf() <= competenciaFinal.valueOf())
    .map(item => item.competencia)
  const primeiraDataBase = datasBase.length > 0 ? datasBase[0] : null;

  const itemCompetenciaInicial = dadosReajuste.filter(item => item.competencia.valueOf() === competenciaInicial.valueOf())[0]

  const indiceProporcional = itemCompetenciaInicial ? itemCompetenciaInicial.indiceProporcional : 1

  const rmi = aplicarArt58 ? itemCompetenciaInicial.piso * (parametros.equivalenciaSalarial || 1) : originario.rmi
  let baseReajuste = rmi;
  let rma = rmi

  return dadosReajuste.map(item => {
    
    if (item.competencia.valueOf() >= competenciaInicial.valueOf() && item.competencia.valueOf() <= competenciaFinal.valueOf()) {
      if (item.dataBase && item.competencia.valueOf() > competenciaInicial.valueOf()) { // nunca há reajuste na primeira competência
        if (primeiraDataBase && item.competencia.valueOf() === primeiraDataBase.valueOf() && !aplicarArt58) {
          baseReajuste = parseFloat((baseReajuste * indiceProporcional * indiceReposicaoTeto).toString().replace(/(\d*\.\d{2})(\d*.)/, '$1'))

        } else {
          baseReajuste = parseFloat((baseReajuste * item.indiceIntegral).toString().replace(/(\d*\.\d{2})(\d*.)/, '$1'))
        }
      }
      
      if (temDerivado && item.competencia.valueOf() === primeiroDiaDoMes(originario.dcb!).valueOf() && (!aplicarArt58 || originario.dcb!.valueOf() >= gerarData('01/02/1992').valueOf())) {
        /*
        * Na primeira competência do benefício derivado, é necessário aplicar a proporcionalidade
        **/
        rma = ((baseReajuste / 30) * originario.dcb!.getDate()) + ((derivado.rmi! / 30) * Math.max(30 - (originario.dcb!.getDate()), 1));
        baseReajuste = derivado.rmi!; // necessário para que o valor se altere nas competências subsequentes
      } else {
        /*
        * Esse critério de aplicação dos limites mínimo e máximo, aparentemente incosistente
        * tenta refletir o modo como o próprio INSS evolui a renda mensal, ou seja:
        * - se o benefíco é inferior ao mínimo, o valor original é preservado e há apenas a elevação ao mínimo
        *   mês a mês
        * - se o benefício é superior ao teto, a própria renda mensal é limitada e o valor excedente é descartado
        **/
        if (baseReajuste < item.piso) {
          rma = item.piso;
        } else {
          rma = Math.min(item.teto, baseReajuste);
          if (!guardarTeto(item.competencia)) {
            baseReajuste = Math.min(item.teto, baseReajuste);
          }
        }
      }
      
      const calcularAbonoNaCompetencia = (item.competencia.getMonth() === 11) || (tipoData(dataUltimoAbono) && item.competencia.valueOf() === primeiroDiaDoMes(dataUltimoAbono).valueOf());
      
      let abono: number
      if (calcularAbono && calcularAbonoNaCompetencia) {
        if (item.competencia.valueOf() === primeiroDiaDoMes(dataUltimoAbono).valueOf()) {
          abono = rma * proporcaoUltimoAbono;
        } else if (item.competencia.valueOf() === primeiroDiaDoMes(dataPrimeiroAbono).valueOf()) {
          abono = rma * proporcaoPrimeiroAbono;
        } else {
          abono = rma;
        }
      } else {
        abono = 0;
      }      
      
      /*
      * Situação em que há apenas uma competência
      */
      
      if (competenciaFinal.valueOf() === competenciaInicial.valueOf()) {
        rma = rma * proporcaoInicial;
      } else {
        if (item.competencia.valueOf() === competenciaInicial.valueOf()) {
          rma = rma * proporcaoInicial;
        }
        if (item.competencia.valueOf() === competenciaFinal.valueOf()) {
          rma = rma * proporcaoFinal;
        }
      }
      return [item.competencia, rma, abono]
    } else {
      return [item.competencia, 0, 0];
    }
  });
}
