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
import { calcularPrescricao } from './auxiliares'

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

export default function CalculadoraPrescricao() {
  const [prazo, mudarPrazo] = useState(60)
  const [termoInicial, mudarTermoInicial] = useState(new Date())
  const [marcoInterruptivo, mudarMarcoInterruptivo] = useState(new Date())
  const [inicioSuspensao, mudarInicioSuspensao] = useState(new Date())
  const [fimSuspensao, mudarFimSuspensao] = useState(new Date())

  const [diasSuspensao, mudarDiasSuspensao] = useState(0)
  const [inicioPrescricao, mudarInicioPrescricao] = useState(new Date())

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

  const apagar = () => {
    mudarPrazo(60)
    mudarTermoInicial(new Date())
    mudarMarcoInterruptivo(new Date())
    mudarInicioSuspensao(new Date())
    mudarFimSuspensao(new Date())
  }

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
        : [[inicioPrescricao.toLocaleString().substring(0, 10)]]
    ).map(linha => linha.map(celula => String(celula)))
    const formatos = tipo === 'diasSuspensao' ? [['#0']] : [['dd/MM/yyyy']]
    definirValorDaSelecao(valores as TValorExcel[][], formatos)
  }

  return (
    <>
      <Stack horizontal horizontalAlign="end">
        <Stack tokens={{ maxWidth: '150px' }} styles={stackStyles}>
          <AppNumeroInput rotulo="Prazo (meses)" valor={prazo} onChange={val => mudarPrazo(val)} />
        </Stack>
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppDataInput
          rotulo="termo inicial"
          valor={termoInicial}
          onChange={val => atualizarData(val, 'termoInicial')}
        />
        <AppDataInput
          rotulo="marco interruptivo"
          valor={marcoInterruptivo}
          onChange={val => atualizarData(val, 'marcoInterruptivo')}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppDataInput
          rotulo="início suspensão"
          valor={inicioSuspensao}
          onChange={val => atualizarData(val, 'inicioSuspensao')}
        />
        <AppDataInput
          rotulo="fim suspensão"
          valor={fimSuspensao}
          onChange={val => atualizarData(val, 'fimSuspensao')}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <DocumentCard className={classeCartao}>
          <div>
            <span>{`${diasSuspensao} dias de suspensão`}</span>
            <span title="colar na célula selecionada">
              <IconButton
                iconProps={{ iconName: 'ClearSelection' }}
                onClick={() => inserirNaSelecao('diasSuspensao')}
              />
            </span>
          </div>
          <div>
            <span>{`início: ${inicioPrescricao.toLocaleString().substring(0, 10)}`}</span>
            <span title="colar na célula selecionada">
              <IconButton
                iconProps={{ iconName: 'ClearSelection' }}
                onClick={() => inserirNaSelecao('marcoPrescricional')}
              />
            </span>
          </div>
        </DocumentCard>
      </Stack>
      <Stack horizontal horizontalAlign="end" styles={stackStyles} disableShrink={false}>
        <IconButton iconProps={{ iconName: 'EraseTool' }} title="apagar" onClick={apagar} />
      </Stack>
    </>
  )
}
