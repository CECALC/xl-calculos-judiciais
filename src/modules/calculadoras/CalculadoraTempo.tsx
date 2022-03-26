import React, { useEffect, useState } from 'react'
import { 
  mergeStyles,
  DefaultButton, 
  IconButton, 
  DocumentCard,
  IStackStyles, 
  IStackTokens, 
  Stack 
} from '@fluentui/react'
import { AppNumeroInput } from '../../components'
import { definirValorDaSelecao, TValorExcel } from '../../services'
import { calcularTempo, TIPO_NUMERO, TIPO_OPERACAO } from './auxiliares'

const stackTokens: IStackTokens = { childrenGap: 10 }
const stackStyles: Partial<IStackStyles> = { root: { padding: '16px 0' } }
const classeCard = mergeStyles({
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

const classeBotao = mergeStyles({
  border: 'none'
})

export default function CalculadoraTempo() {
  const [operacao, mudarOperacao] = useState(TIPO_OPERACAO.ADICAO)
  const [numeros, mudarNumeros] = useState({
    primeiro: {
      [TIPO_NUMERO.ANOS]: 0,
      [TIPO_NUMERO.MESES]: 0,
      [TIPO_NUMERO.DIAS]: 0
    },
    segundo: {
      [TIPO_NUMERO.ANOS]: 0,
      [TIPO_NUMERO.MESES]: 0,
      [TIPO_NUMERO.DIAS]: 0
    }
  })
  const [resultado, mudarResultado] = useState({
    anos: 0,
    meses: 0,
    dias: 0
  })
  const [totalDias, mudarTotalDias] = useState(0)

  const apagar = () => {
    mudarOperacao(TIPO_OPERACAO.ADICAO)
    mudarNumeros({
      primeiro: {
        [TIPO_NUMERO.ANOS]: 0,
        [TIPO_NUMERO.MESES]: 0,
        [TIPO_NUMERO.DIAS]: 0
      },
      segundo: {
        [TIPO_NUMERO.ANOS]: 0,
        [TIPO_NUMERO.MESES]: 0,
        [TIPO_NUMERO.DIAS]: 0
      }
    })
  }

  const atualizarOperacao = (novaOperacao?: TIPO_OPERACAO) => {
    if (novaOperacao === undefined) return
    mudarOperacao(novaOperacao)
  }

  const atualizarNumeros = (
    novoValor?: number,
    grupo: 'primeiro' | 'segundo' = 'primeiro',
    tipo = TIPO_NUMERO.ANOS
  ) => {
    const primeiro = { ...numeros.primeiro }
    const segundo = { ...numeros.segundo }
    if (grupo === 'primeiro') {
      primeiro[tipo] = novoValor || 0
    } else {
      segundo[tipo] = novoValor || 0
    }
    mudarNumeros({
      primeiro: { ...primeiro },
      segundo: { ...segundo }
    })
  }

  useEffect(() => {
    const res = calcularTempo({ numeros, operacao })
    mudarTotalDias(res.totalDias)
    const { anos, meses, dias } = res
    mudarResultado({ anos, meses, dias })
  }, [numeros, operacao])

  const resultadoFormatado = () => {
    const { anos, meses, dias } = resultado
    const trechoAnos = `${anos} ${anos === 1 ? 'ano' : 'anos'}`
    const trechoMeses = `${meses} ${meses === 1 ? 'mês' : 'meses'}`
    const trechoDias = `${dias} ${dias === 1 ? 'dia' : 'dias'}`
    return `${trechoAnos}, ${trechoMeses} e ${trechoDias}`
  }

  const inserirNaSelecao = (tipo: 'totalDias' | 'valoresDiscriminados') => {
    const { anos, meses, dias } = resultado
    const valores = (tipo === 'totalDias' ? [[totalDias]] : [[anos, meses, dias]]).map(linha =>
      linha.map(celula => String(celula))
    )
    const formatos = tipo === 'totalDias' ? [['#0']] : [['#0', '#0', '#0']]
    definirValorDaSelecao(valores as TValorExcel[][], formatos)
  }

  return (
    <>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppNumeroInput
          rotulo="anos"
          valor={numeros.primeiro[TIPO_NUMERO.ANOS]}
          onChange={val => atualizarNumeros(val, 'primeiro', TIPO_NUMERO.ANOS)}
        />
        <AppNumeroInput
          rotulo="meses"
          valor={numeros.primeiro[TIPO_NUMERO.MESES]}
          onChange={val => atualizarNumeros(val, 'primeiro', TIPO_NUMERO.MESES)}
        />
        <AppNumeroInput
          rotulo="dias"
          valor={numeros.primeiro[TIPO_NUMERO.DIAS]}
          onChange={val => atualizarNumeros(val, 'primeiro', TIPO_NUMERO.DIAS)}
        />
      </Stack>
      <Stack horizontal horizontalAlign="center" styles={stackStyles} disableShrink={false}>
        <DefaultButton
          iconProps={{ iconName: 'CalculatorAddition' }}
          primary={operacao === TIPO_OPERACAO.ADICAO}
          className={classeBotao}
          onClick={() => atualizarOperacao(TIPO_OPERACAO.ADICAO)}
        />
        <DefaultButton
          iconProps={{ iconName: 'CalculatorSubtract' }}
          primary={operacao === TIPO_OPERACAO.SUBTRACAO}
          className={classeBotao}
          onClick={() => atualizarOperacao(TIPO_OPERACAO.SUBTRACAO)}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppNumeroInput
          rotulo="anos"
          valor={numeros.segundo[TIPO_NUMERO.ANOS]}
          onChange={val => atualizarNumeros(val, 'segundo', TIPO_NUMERO.ANOS)}
        />
        <AppNumeroInput
          rotulo="meses"
          valor={numeros.segundo[TIPO_NUMERO.MESES]}
          onChange={val => atualizarNumeros(val, 'segundo', TIPO_NUMERO.MESES)}
        />
        <AppNumeroInput
          rotulo="dias"
          valor={numeros.segundo[TIPO_NUMERO.DIAS]}
          onChange={val => atualizarNumeros(val, 'segundo', TIPO_NUMERO.DIAS)}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <DocumentCard className={classeCard}>
          <div>
            <span>{resultadoFormatado()}</span>
            <span title="colar na célula selecionada">
              <IconButton
                iconProps={{ iconName: 'ClearSelection' }}
                onClick={() => inserirNaSelecao('valoresDiscriminados')}
              />
            </span>
          </div>
          <div>
            <span>{`${totalDias} ${totalDias === 1 ? 'dia' : 'dias'} (total)`}</span>
            <span title="colar na célula selecionada">
              <IconButton
                iconProps={{ iconName: 'ClearSelection' }}
                onClick={() => inserirNaSelecao('totalDias')}
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
