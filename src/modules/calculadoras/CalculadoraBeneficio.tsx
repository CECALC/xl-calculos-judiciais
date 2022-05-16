import React, { useState } from 'react'
import { 
  mergeStyles,
  IconButton,
  IStackStyles, 
  IStackTokens, 
  Stack,
  Checkbox,
  PrimaryButton,
  DefaultButton
 } from '@fluentui/react'
import { AppDataInput, AppNumeroInput } from '../../components'
import { calcularBeneficio, IDadosBeneficio, IParametrosCalculo } from './auxiliares'
import { depurador } from '../../utils'

const stackTokens: IStackTokens = { childrenGap: 10 }
const stackStyles: Partial<IStackStyles> = { root: { padding: '12px 0 ' } }

const classeTituloSessaoPrimeira = mergeStyles({
  fontWeight: 'bold',
  width: '100%',
  paddingTop: '16px'
})

const classeTituloSessao = mergeStyles({
  fontWeight: 'bold',
  width: '100%',
  borderTop: '1px solid lightgray',
  paddingTop: '16px'
})

export default function CalculadoraPrescricao() {
  const [originario, mudarOriginario] = useState<Partial<IDadosBeneficio>>({ dib: undefined, rmi: 0, percentualMinimo: 100 })
  const [derivado, mudarDerivado] = useState<Partial<IDadosBeneficio>>({ dib: undefined, rmi: 0, percentualMinimo: 100 })
  const [indiceReposicaoTeto, mudarIndiceReposicaoTeto] = useState<number>(1)
  const [equivalenciaSalarial, mudarEquivalenciaSalarial] = useState<number>(1)
  const [dataAtualizacao, mudarDataAtualizacao] = useState<Date>(new Date())
  const [calcularAbono, mudarCalcularAbono] = useState<boolean>(true)
  const [abaixoMinimoOriginario, mudarAbaixoMinimoOriginario] = useState<boolean>(false)
  const [abaixoMinimoDerivado, mudarAbaixoMinimoDerivado] = useState<boolean>(false)
  const [temDerivado, mudarTemDerivado] = useState<boolean>(false)

  const calcular = async () => {
    try {
      const parametros: IParametrosCalculo = {
        calcularAbono,
        dataAtualizacao,
        indiceReposicaoTeto,
        equivalenciaSalarial
      }
      const resultado = temDerivado 
        ? await calcularBeneficio(parametros, originario, derivado) 
        : await calcularBeneficio(parametros, originario) 
      depurador.console.log(resultado)
    } catch (e) {
      depurador.console.error(e)
    }

  }

  const apagar = () => {
    mudarOriginario({ dib: undefined, rmi: 0, dcb: undefined, percentualMinimo: 100 })
    mudarDerivado({ dib: undefined, rmi: 0, dcb: undefined, percentualMinimo: 100 })
    mudarIndiceReposicaoTeto(1)
    mudarEquivalenciaSalarial(1)
    mudarDataAtualizacao(new Date())
    mudarCalcularAbono(true)
    mudarAbaixoMinimoOriginario(false)
    mudarAbaixoMinimoDerivado(false)
    mudarTemDerivado(false)
  }

  return (
    <>
      <div className={classeTituloSessaoPrimeira}>Dados do Benefício Originário</div>
      <Stack horizontal horizontalAlign="end">
        <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
          <AppNumeroInput rotulo="RMI" valor={originario.rmi} onChange={val => mudarOriginario({ ...originario, rmi: val })} />
        </Stack>
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <Checkbox label="Calcular abaixo do mínimo" checked={abaixoMinimoOriginario} onChange={() => mudarAbaixoMinimoOriginario(!abaixoMinimoOriginario)} />
      </Stack>
      {abaixoMinimoOriginario ? 
        <Stack horizontal horizontalAlign="end">
          <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
            <AppNumeroInput rotulo="Percentual" valor={originario.percentualMinimo} onChange={val => mudarOriginario({ ...originario, percentualMinimo: val })} />
          </Stack>
        </Stack>
        : ''}
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppDataInput
          rotulo="DIB"
          valor={originario.dib}
          onChange={val => mudarOriginario({ ...originario, dib: val })}
        />
        <AppDataInput
          rotulo="DCB (opcional)"
          valor={originario.dcb}
          onChange={val => mudarOriginario({ ...originario, dcb: val })}
        />
      </Stack>
      <div className={classeTituloSessao}>Dados do Benefício Derivado (opcional)</div>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <Checkbox label="Tem benefício derivado" checked={temDerivado} onChange={() => mudarTemDerivado(!temDerivado)} />
      </Stack>
      {temDerivado ? 
        <>
          <Stack horizontal horizontalAlign="end">
            <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
            <AppNumeroInput rotulo="RMI" valor={derivado.rmi} onChange={val => mudarDerivado({ ...derivado, rmi: val })} />
            </Stack>
          </Stack>
          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <Checkbox label="Calcular abaixo do mínimo" checked={abaixoMinimoDerivado} onChange={() => mudarAbaixoMinimoDerivado(!abaixoMinimoDerivado)} />
          </Stack>
          {abaixoMinimoOriginario ? 
            <Stack horizontal horizontalAlign="end">
              <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
                <AppNumeroInput rotulo="Percentual" valor={derivado.percentualMinimo} onChange={val => mudarDerivado({ ...derivado, percentualMinimo: val })} />
              </Stack>
            </Stack>
            : ''}

          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <AppDataInput
              rotulo="DIB"
              valor={derivado.dib}
              onChange={val => mudarDerivado({ ...derivado, dib: val })}
            />
            <AppDataInput
              rotulo="DCB (opcional)"
              valor={derivado.dcb}
              onChange={val => mudarDerivado({ ...derivado, dcb: val })}
            />
          </Stack>
        </>
    : ''}
      <div className={classeTituloSessao}>Parâmetros de Cálculo</div>
      <Stack horizontal horizontalAlign="end">
        <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
          <AppNumeroInput rotulo="Índice Reposição" valor={indiceReposicaoTeto} onChange={val => mudarIndiceReposicaoTeto(val)} />
        </Stack>
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
          <AppNumeroInput rotulo="Equiv. Salarial" valor={equivalenciaSalarial} onChange={val => mudarEquivalenciaSalarial(val)} />
        </Stack>
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <Checkbox label="Calcular Abono" checked={calcularAbono} onChange={() => mudarCalcularAbono(!calcularAbono)} />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppDataInput
          rotulo="Data Atualização"
          valor={dataAtualizacao}
          onChange={val => mudarDataAtualizacao(val)}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" styles={stackStyles} disableShrink={false}>
        <PrimaryButton iconProps={{ iconName: 'Lightningbolt' }} text='Calcular' style={{ marginRight: 10 }} onClick={calcular} />
        <DefaultButton iconProps={{ iconName: 'EraseTool' }} text='Apagar' onClick={apagar} />
      </Stack>
    </>
  )
}
