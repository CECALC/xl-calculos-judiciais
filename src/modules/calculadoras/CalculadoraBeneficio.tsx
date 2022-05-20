import React, { useState } from 'react'
import { 
  mergeStyles,
  IStackStyles, 
  IStackTokens, 
  Stack,
  Checkbox,
  PrimaryButton,
  DefaultButton,
  Overlay,
  Spinner,
  SpinnerSize,
  Label,
  FontSizes,
  Pivot,
  PivotItem
 } from '@fluentui/react'
import { AppDataInput, AppModalAviso, AppNumeroInput, TTipoModal } from '../../components'
import { calcularBeneficio, IDadosBeneficio, IParametrosCalculo, depurador } from '../../utils'
import ModalBeneficio from './ModalBeneficio'

const stackTokens: IStackTokens = { childrenGap: 10 }
const stackStyles: Partial<IStackStyles> = { root: { padding: '12px 0 ' } }

const classeSeparador = mergeStyles({
  fontWeight: 'bold',
  width: '100%',
  borderTop: '1px solid lightgray',
  marginTop: '8px'
})

interface IStatusErro {
  mostrar: boolean
  mensagem: string
  tipo: TTipoModal
}

export default function CalculadoraPrescricao() {
  const [originario, mudarOriginario] = useState<Partial<IDadosBeneficio>>({ dib: undefined, rmi: 0, percentualMinimo: 100 })
  const [abaixoMinimoOriginario, mudarAbaixoMinimoOriginario] = useState<boolean>(false)

  const [parametros, mudarParametros] = useState<IParametrosCalculo>({ calcularAbono: true, dataAtualizacao: new Date(), indiceReposicaoTeto: 1, equivalenciaSalarial: 1 })

  const [temDerivado, mudarTemDerivado] = useState<boolean>(false)
  const [derivado, mudarDerivado] = useState<Partial<IDadosBeneficio>>({ dib: undefined, rmi: 0, percentualMinimo: 100 })
  const [abaixoMinimoDerivado, mudarAbaixoMinimoDerivado] = useState<boolean>(false)

  const [statusErro, mudarStatusErro] = useState<IStatusErro>({ mostrar: false, mensagem: '', tipo: 'falha' })
  const [resultado, mudarResultado] = useState<[Date, number, number][]>([])
  const [mostrarResultado, mudarMostrarResultado] = useState<boolean>(false)

  const [calculando, mudarCalculando] = useState<boolean>(false)

  const calcular = async () => {
    try {
      mudarCalculando(true)
      const resultado = temDerivado 
        ? await calcularBeneficio(parametros, originario, derivado) 
        : await calcularBeneficio(parametros, originario) 
      depurador.console.log(resultado)
      mudarResultado(resultado)
      mudarCalculando(false)
      mudarMostrarResultado(true)
    } catch (e: any) {
      depurador.console.error(e)
      mudarCalculando(false)
      mudarStatusErro({
        mostrar: true,
        mensagem: e.message,
        tipo: 'falha'
      })
    }

  }

  const apagar = () => {
    mudarOriginario({ dib: undefined, rmi: 0, dcb: undefined, percentualMinimo: 100 })
    mudarDerivado({ dib: undefined, rmi: 0, dcb: undefined, percentualMinimo: 100 })
    mudarParametros({
      calcularAbono: true,
      dataAtualizacao: new Date(),
      indiceReposicaoTeto: 1,
      equivalenciaSalarial: 1     
    })
    mudarAbaixoMinimoOriginario(false)
    mudarAbaixoMinimoDerivado(false)
    mudarTemDerivado(false)
  }

  const dispensar = () => {
    mudarStatusErro({
      ...statusErro,
      mostrar: false
    })
    mudarMostrarResultado(false)
  }

  return (
    <>
      <Pivot
        aria-label="Dados Cálculo Benefício"
        linkSize="normal"
        overflowBehavior="menu"
        overflowAriaLabel="mais itens"
      >
        <PivotItem headerText="Originário">
          <Stack horizontal horizontalAlign="end">
            <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
              <AppNumeroInput rotulo="RMI Originário" valor={originario.rmi} onChange={val => mudarOriginario({ ...originario, rmi: val })} />
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
          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <Checkbox label="Tem benefício derivado" checked={temDerivado} onChange={() => mudarTemDerivado(!temDerivado)} />
          </Stack>
        </PivotItem>
        {temDerivado ? 
          <PivotItem headerText="Derivado">
            <Stack horizontal horizontalAlign="end">
              <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
                <AppNumeroInput rotulo="RMI Derivado" valor={derivado.rmi} onChange={val => mudarDerivado({ ...derivado, rmi: val })} />
              </Stack>
            </Stack>
            <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
              <Checkbox label="Calcular abaixo do mínimo" checked={abaixoMinimoDerivado} onChange={() => mudarAbaixoMinimoDerivado(!abaixoMinimoDerivado)} />
            </Stack>
            {abaixoMinimoDerivado ? 
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
            
          </PivotItem>
        : ''}
        <PivotItem headerText="Parâmetros">
          <Stack horizontal horizontalAlign="space-between">
            <Stack tokens={{ maxWidth: '140px' }} styles={stackStyles}>
              <AppNumeroInput rotulo="Índice Reposição" valor={parametros.indiceReposicaoTeto} onChange={val => mudarParametros({ ...parametros, indiceReposicaoTeto: val })} />
            </Stack>
            <Stack tokens={{ maxWidth: '140px' }} styles={stackStyles}>
              <AppNumeroInput rotulo="Equiv. Salarial" valor={parametros.equivalenciaSalarial} onChange={val => mudarParametros({ ...parametros, equivalenciaSalarial: val })} />
            </Stack>
          </Stack>
          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <Checkbox label="Calcular Abono" checked={parametros.calcularAbono} onChange={() => mudarParametros({ ...parametros, calcularAbono: !parametros.calcularAbono })} />
          </Stack>
          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <AppDataInput
              rotulo="Data Atualização"
              valor={parametros.dataAtualizacao}
              onChange={val => mudarParametros({ ...parametros, dataAtualizacao: val })}
            />
          </Stack>
        </PivotItem>
      </Pivot>

      <div className={classeSeparador}>&nbsp;</div>
      <Stack horizontal horizontalAlign="space-evenly" styles={stackStyles} disableShrink={false}>
        <DefaultButton iconProps={{ iconName: 'EraseTool' }} text='Apagar' onClick={apagar} />
        <PrimaryButton iconProps={{ iconName: 'Lightningbolt' }} text='Calcular' onClick={calcular} />
      </Stack>

      <AppModalAviso
        mostrar={statusErro.mostrar}
        mensagem={statusErro.mensagem}
        tipo={statusErro.tipo}
        aoDispensar={dispensar}
      />

      <ModalBeneficio
        mostrar={mostrarResultado}
        originario={originario}
        parametros={parametros}
        resultado={resultado}
        aoDispensar={dispensar}
      />

      {calculando && <Overlay isDarkThemed={true}>
        <Stack verticalAlign='center' style={{ height: '100%' }} disableShrink={true}>
          <Spinner size={SpinnerSize.large} />
          <Label style={{ color: 'white', fontSize: FontSizes.large }}>Calculando</Label>
        </Stack>
      </Overlay>}
    </>
  )
}
