import React, { useEffect, useState } from 'react'
import { 
  mergeStyles, 
  IconButton,
  DocumentCard,
  IStackStyles, 
  IStackTokens, 
  Stack,
  ComboBox, 
  IComboBoxStyles 
} from '@fluentui/react'
import { CData, METODO_DIAS_360 } from '@cecalc/utils'
import { AppDataInput } from '../../components'
import { definirValorDaSelecao, TValorExcel } from '../../services'
import { calcularIntervalo } from '../../utils'

const stackTokens: IStackTokens = { childrenGap: 10 }
const stackStyles: Partial<IStackStyles> = { root: { padding: '16px 0' } }

const comboBoxStyles: Partial<IComboBoxStyles> = {
  root: { maxWidth: 150 }
}

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

const opcoesMetodo = [
  {
    key: 'excel',
    text: 'Excel'
  },
  {
    key: 'eu',
    text: 'EUR'
  },
  {
    key: 'nasd',
    text: 'US-NASD'
  }
]

const mapaMetodos: Record<string, METODO_DIAS_360> = {
  excel: METODO_DIAS_360.EXCEL,
  eu: METODO_DIAS_360.EU,
  nasd: METODO_DIAS_360.US_NASD
}

interface IProps {
  aoApagar: () => void
}

export default function CalculadoraIntervalo({ aoApagar }: IProps) {
  const [metodo, mudarMetodo] = useState(METODO_DIAS_360.EXCEL)
  const [dataInicial, mudarDataInicial] = useState(new Date())
  const [dataFinal, mudarDataFinal] = useState(new Date())
  const [resultado, mudarResultado] = useState({
    anos: 0,
    meses: 0,
    dias: 0
  })
  const [totalDias, mudarTotalDias] = useState(0)

  useEffect(() => {
    const inicial = new CData(dataInicial)
    const final = new CData(dataFinal)
    if (!inicial.dataValida() || !final.dataValida()) return
    const resultado = calcularIntervalo(inicial.nativo(), final.nativo(), metodo)
    mudarTotalDias(resultado.totalDias)
    const { anos, meses, dias } = resultado
    mudarResultado({ anos, meses, dias })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicial, dataFinal, metodo])

  // const apagar = () => {
  //   mudarDataInicial(new Date())
  //   mudarDataFinal(new Date())
  // }

  const atualizarData = (novoValor?: Date, qual: 'inicial' | 'final' = 'inicial') => {
    if (!novoValor) return
    if (qual === 'inicial') {
      mudarDataInicial(novoValor)
    } else {
      mudarDataFinal(novoValor)
    }
  }

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
        <ComboBox
          label="Método"
          allowFreeform={false}
          options={opcoesMetodo}
          defaultSelectedKey={opcoesMetodo[0].key}
          styles={comboBoxStyles}
          dropdownWidth={150}
          onChange={(e, val) => val && mudarMetodo(mapaMetodos[val.key] as METODO_DIAS_360)}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <AppDataInput
          rotulo="data inicial"
          valor={dataInicial}
          aoMudar={val => atualizarData(val, 'inicial')}
        />
        <AppDataInput
          rotulo="data final"
          valor={dataFinal}
          aoMudar={val => atualizarData(val, 'final')}
        />
      </Stack>
      <Stack horizontal horizontalAlign="end" tokens={stackTokens} styles={stackStyles}>
        <DocumentCard className={classeCartao}>
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
        <IconButton iconProps={{ iconName: 'EraseTool' }} title="apagar" onClick={aoApagar} />
      </Stack>
    </>
  )
}
