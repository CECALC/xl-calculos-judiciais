import React, { useEffect, useState } from 'react'
import { 
  mergeStyles,
  IconButton,
  DocumentCard, 
  IStackStyles, 
  IStackTokens, 
  Stack
 } from '@fluentui/react'
import { AppDataInput, AppNumeroInput } from '../../components'
import { definirValorDaSelecao, TValorExcel } from '../../services'
import { calcularPrescricao, validarParametrosCalculoPrescricao } from '../../utils'

const stackTokens: IStackTokens = { childrenGap: 10 }
const stackStyles: Partial<IStackStyles> = { root: { padding: '12px 0 ' } }

const classeCartao = mergeStyles({
  padding: '16px',
  color: '#004578',
  border: '1px solid #0078d4',
  borderRadius: '3px',
  width: '100%',
  ' > div': {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end' 
  }
})

interface IProps {
  aoApagar: () => void
}

export default function CalculadoraPrescricao({ aoApagar }: IProps) {
  const [prazo, mudarPrazo] = useState<number | undefined>(60)
  const [termoInicial, mudarTermoInicial] = useState<Date | undefined>(new Date())
  const [marcoInterruptivo, mudarMarcoInterruptivo] = useState<Date | undefined>(new Date())
  const [inicioSuspensao, mudarInicioSuspensao] = useState<Date | undefined>(new Date())
  const [fimSuspensao, mudarFimSuspensao] = useState<Date | undefined>(new Date())

  const [diasSuspensao, mudarDiasSuspensao] = useState<number | undefined>(0)
  const [inicioPrescricao, mudarInicioPrescricao] = useState<Date | undefined>(new Date())

  const [valido, mudarValido] = useState<boolean>(false)

  useEffect(() => {
    const parametrosValidos = validarParametrosCalculoPrescricao(
      prazo,
      termoInicial,
      marcoInterruptivo,
      inicioSuspensao,
      fimSuspensao
    )
    mudarValido(parametrosValidos)
  }, [prazo, termoInicial, marcoInterruptivo, inicioSuspensao, fimSuspensao])


  useEffect(() => {
    const resultado = calcularPrescricao(
      prazo,
      termoInicial,
      marcoInterruptivo,
      inicioSuspensao,
      fimSuspensao
    )
    mudarDiasSuspensao(resultado.diasSuspensao)
    mudarInicioPrescricao(resultado.inicioPrescricao)
  }, [prazo, termoInicial, marcoInterruptivo, inicioSuspensao, fimSuspensao])

  // const apagar = () => {
  //   mudarPrazo(60)
  //   mudarTermoInicial(new Date())
  //   mudarMarcoInterruptivo(new Date())
  //   mudarInicioSuspensao(new Date())
  //   mudarFimSuspensao(new Date())
  // }

  const atualizarData = (
    novoValor?: Date,
    qual: 'termoInicial' | 'marcoInterruptivo' | 'inicioSuspensao' | 'fimSuspensao' = 'termoInicial'
  ) => {
    if (!novoValor) return
    if (qual === 'termoInicial') {
      mudarTermoInicial(novoValor)
      return
    }
    if (qual === 'marcoInterruptivo') {
      mudarMarcoInterruptivo(novoValor)
      return
    }
    if (qual === 'inicioSuspensao') {
      mudarInicioSuspensao(novoValor)
      return
    }
    mudarFimSuspensao(novoValor)
  }

  const inserirNaSelecao = (tipo: 'diasSuspensao' | 'marcoPrescricional') => {
    const valores = (
      tipo === 'diasSuspensao'
        ? [[diasSuspensao]]
        : [[inicioPrescricao!.toLocaleString().substring(0, 10)]]
    ).map(linha => linha.map(celula => String(celula)))
    const formatos = tipo === 'diasSuspensao' ? [['#0']] : [['dd/MM/yyyy']]
    definirValorDaSelecao(valores as TValorExcel[][], formatos)
  }

  return (
    <>
      <Stack horizontal horizontalAlign="end">
        <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
          <AppNumeroInput rotulo="Prazo (meses)" valor={prazo} aoMudar={val => mudarPrazo(val)} />
        </Stack>
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppDataInput
          rotulo="termo inicial"
          valor={termoInicial}
          aoMudar={val => atualizarData(val, 'termoInicial')}
        />
        <AppDataInput
          rotulo="marco interruptivo"
          valor={marcoInterruptivo}
          aoMudar={val => atualizarData(val, 'marcoInterruptivo')}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppDataInput
          rotulo="início suspensão"
          valor={inicioSuspensao}
          aoMudar={val => atualizarData(val, 'inicioSuspensao')}
        />
        <AppDataInput
          rotulo="fim suspensão"
          valor={fimSuspensao}
          aoMudar={val => atualizarData(val, 'fimSuspensao')}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <DocumentCard className={classeCartao}>
          <div>
            <span>{`${diasSuspensao} dias de suspensão`}</span>
            <span title="colar na célula selecionada">
              <IconButton
                iconProps={{ iconName: 'ClearSelection' }}
                disabled={!valido}
                onClick={() => inserirNaSelecao('diasSuspensao')}
              />
            </span>
          </div>
          <div>
            <span>{`início: ${inicioPrescricao!.toLocaleString().substring(0, 10)}`}</span>
            <span title="colar na célula selecionada">
              <IconButton
                iconProps={{ iconName: 'ClearSelection' }}
                disabled={!valido}
                onClick={() => inserirNaSelecao('marcoPrescricional')}
              />
            </span>
          </div>
        </DocumentCard>
      </Stack>
      <Stack horizontal horizontalAlign="end" styles={stackStyles} disableShrink={false}>
        <IconButton iconProps={{ iconName: 'EraseTool' }} title="apagar" onClick={aoApagar} />
      </Stack>
    </>
  )
}
