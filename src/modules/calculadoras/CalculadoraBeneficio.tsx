import React, { useEffect, useState } from 'react'
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
  PivotItem,
  ITheme,
  getTheme
 } from '@fluentui/react'
import { 
  AppDataInput, 
  AppModalAviso, 
  AppNumeroInput, 
  TTipoModal 
} from '../../components'
import { 
  calcularBeneficio, 
  IDadosBeneficio, 
  IParametrosCalculo, 
  depurador, 
  validarOriginario,
  validarDerivado,
  validarParametrosCalculoBeneficio
} from '../../utils'
import ModalBeneficio from './ModalBeneficio'

const theme: ITheme = getTheme()
const { palette } = theme

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

interface IProps {
  aoApagar: () => void
}

export default function CalculadoraBeneficio({ aoApagar } : IProps) {
  const [originario, mudarOriginario] = useState<Partial<IDadosBeneficio>>({ dib: undefined, rmi: undefined, percentualMinimo: 100 })
  const [abaixoMinimoOriginario, mudarAbaixoMinimoOriginario] = useState<boolean>(false)

  const [parametros, mudarParametros] = useState<IParametrosCalculo>({ calcularAbono: true, dataAtualizacao: new Date(), indiceReposicaoTeto: 1, equivalenciaSalarial: 1 })

  const [temDerivado, mudarTemDerivado] = useState<boolean>(false)
  const [derivado, mudarDerivado] = useState<Partial<IDadosBeneficio>>({ dib: undefined, rmi: undefined, percentualMinimo: 100 })
  const [abaixoMinimoDerivado, mudarAbaixoMinimoDerivado] = useState<boolean>(false)

  const [statusErro, mudarStatusErro] = useState<IStatusErro>({ mostrar: false, mensagem: '', tipo: 'falha' })
  const [resultado, mudarResultado] = useState<[Date, number, number][]>([])
  const [mostrarResultado, mudarMostrarResultado] = useState<boolean>(false)

  const [calculando, mudarCalculando] = useState<boolean>(false)

  const [valido, mudarValido] = useState<boolean>(false)

  useEffect(() => {
    const parametrosValidos = validarParametrosCalculoBeneficio(parametros)
    const originarioValido = validarOriginario(originario, temDerivado, abaixoMinimoOriginario)
    const derivadoValido = validarDerivado(derivado, temDerivado, abaixoMinimoDerivado)
    mudarValido(parametrosValidos && originarioValido && derivadoValido)
  }, [originario, abaixoMinimoOriginario, parametros, temDerivado, derivado, abaixoMinimoDerivado])

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

  const dispensar = () => {
    mudarStatusErro({
      ...statusErro,
      mostrar: false
    })
    mudarMostrarResultado(false)
  }

  return (
    <>
    {
      calculando
      ? 
      <Overlay>
        <Stack verticalAlign='center' style={{ height: '100%' }}>
          <Spinner size={SpinnerSize.large} />
          <Label style={{ color: palette.themePrimary, fontSize: FontSizes.large }}>Calculando</Label>
        </Stack>
      </Overlay>
      : 
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
              <AppNumeroInput 
                rotulo="RMI Originário" 
                valor={originario.rmi} 
                decimal={true}
                min={0} 
                obrigatorio={true} 
                prefixo="R$" 
                aoMudar={val => mudarOriginario({ ...originario, rmi: val })} 
              />
            </Stack>
          </Stack>
          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <Checkbox 
              label="Calcular abaixo do mínimo" 
              checked={abaixoMinimoOriginario} 
              onChange={() => mudarAbaixoMinimoOriginario(!abaixoMinimoOriginario)} 
            />
          </Stack>
          {abaixoMinimoOriginario ? 
            <Stack horizontal horizontalAlign="end">
              <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
                <AppNumeroInput 
                  rotulo="Percentual" 
                  valor={originario.percentualMinimo} 
                  min={0} 
                  max={100} 
                  obrigatorio={abaixoMinimoOriginario} 
                  sufixo="%" 
                  aoMudar={val => mudarOriginario({ ...originario, percentualMinimo: val })} 
                />
              </Stack>
            </Stack>
            : ''}
          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <AppDataInput
              rotulo="DIB"
              valor={originario.dib}
              obrigatorio={true}
              aoMudar={val => mudarOriginario({ ...originario, dib: val })}
            />
            <AppDataInput
              rotulo="DCB"
              valor={originario.dcb}
              obrigatorio={temDerivado}
              aoMudar={val => mudarOriginario({ ...originario, dcb: val })}
            />
          </Stack>
          <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
            <Checkbox 
              label="Tem benefício derivado" 
              checked={temDerivado} 
              onChange={() => mudarTemDerivado(!temDerivado)} 
            />
          </Stack>
        </PivotItem>
        {temDerivado ? 
          <PivotItem headerText="Derivado">
            <Stack horizontal horizontalAlign="end">
              <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
                <AppNumeroInput 
                  rotulo="RMI Derivado" 
                  valor={derivado.rmi} 
                  decimal={true}
                  min={0} 
                  obrigatorio={temDerivado} 
                  prefixo="R$" 
                  aoMudar={val => mudarDerivado({ ...derivado, rmi: val })} 
                />
              </Stack>
            </Stack>
            <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
              <Checkbox 
                label="Calcular abaixo do mínimo" 
                checked={abaixoMinimoDerivado} 
                onChange={() => mudarAbaixoMinimoDerivado(!abaixoMinimoDerivado)} 
              />
            </Stack>
            {abaixoMinimoDerivado ? 
              <Stack horizontal horizontalAlign="end">
                <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
                  <AppNumeroInput 
                    rotulo="Percentual" 
                    valor={derivado.percentualMinimo} 
                    min={0} 
                    max={100} 
                    obrigatorio={abaixoMinimoDerivado} 
                    sufixo="%" 
                    aoMudar={val => mudarDerivado({ ...derivado, percentualMinimo: val })} 
                  />
                </Stack>
              </Stack>
              : ''}

            <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
              <AppDataInput
                rotulo="DIB"
                valor={derivado.dib}
                obrigatorio={temDerivado}
                aoMudar={val => mudarDerivado({ ...derivado, dib: val })}
              />
              <AppDataInput
                rotulo="DCB"
                valor={derivado.dcb}
                obrigatorio={false}
                aoMudar={val => mudarDerivado({ ...derivado, dcb: val })}
              />
            </Stack>
            
          </PivotItem>
        : ''}
          <PivotItem headerText="Parâmetros">
            <Stack horizontal horizontalAlign="space-between">
              <Stack tokens={{ maxWidth: '140px' }} styles={stackStyles}>
                <AppNumeroInput 
                  rotulo="Índice Reposição" 
                  valor={parametros.indiceReposicaoTeto} 
                  decimal={true}
                  obrigatorio={true}
                  aoMudar={val => mudarParametros({ ...parametros, indiceReposicaoTeto: val })} 
                />
              </Stack>
              <Stack tokens={{ maxWidth: '140px' }} styles={stackStyles}>
                <AppNumeroInput 
                  rotulo="Equiv. Salarial" 
                  valor={parametros.equivalenciaSalarial} 
                  decimal={true}
                  obrigatorio={false}
                  aoMudar={val => mudarParametros({ ...parametros, equivalenciaSalarial: val })} 
                />
              </Stack>
            </Stack>
            <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
              <Checkbox 
                label="Calcular Abono" 
                checked={parametros.calcularAbono} 
                onChange={() => mudarParametros({ ...parametros, calcularAbono: !parametros.calcularAbono })} 
              />
            </Stack>
            <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
              <AppDataInput
                rotulo="Data Atualização"
                valor={parametros.dataAtualizacao}
                obrigatorio={true}
                aoMudar={val => mudarParametros({ ...parametros, dataAtualizacao: val })}
              />
            </Stack>
          </PivotItem>
        </Pivot>

        <div className={classeSeparador}>&nbsp;</div>
        <Stack horizontal horizontalAlign="space-evenly" styles={stackStyles} disableShrink={false}>
          <DefaultButton iconProps={{ iconName: 'EraseTool' }} text='Apagar' onClick={aoApagar} />
          <PrimaryButton iconProps={{ iconName: 'Lightningbolt' }} text='Calcular' disabled={!valido} onClick={calcular} />
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
      </>
    }
  </>
  )
}
