import React, { useState } from 'react'
import { 
  mergeStyles,
  Stack, 
  IStackStyles,
  DefaultButton 
} from '@fluentui/react'
import CalculadoraBeneficio from './CalculadoraBeneficio'
import CalculadoraIntervalo from './CalculadoraIntervalo'
import CalculadoraPrescricao from './CalculadoraPrescricao'
import CalculadoraTempo from './CalculadoraTempo'

const stackStyles: Partial<IStackStyles> = { root: { height: 44 } }

const classeBotao = mergeStyles({
  border: 'none'
})

export default function CalculadorasPrevidenciarias() {
  const [selecionada, mudarSelecionada] = useState(0)

  const calculadora = () => {
    if (selecionada === 1) return <CalculadoraTempo />
    if (selecionada === 2) return <CalculadoraIntervalo />
    if (selecionada === 3) return <CalculadoraPrescricao />
    return <CalculadoraBeneficio />
  }

  return (
    <>
      <Stack horizontal styles={stackStyles} horizontalAlign="space-around" disableShrink={false}>
        <DefaultButton
          text="Benefício"
          primary={selecionada === 0}
          className={classeBotao}
          onClick={() => mudarSelecionada(0)}
        />
        <DefaultButton
          text="Tempo"
          primary={selecionada === 1}
          className={classeBotao}
          onClick={() => mudarSelecionada(1)}
        />
        <DefaultButton
          text="Intervalo"
          primary={selecionada === 2}
          className={classeBotao}
          onClick={() => mudarSelecionada(2)}
        />
        <DefaultButton
          text="Prescrição"
          primary={selecionada === 3}
          className={classeBotao}
          onClick={() => mudarSelecionada(3)}
        />
      </Stack>
      {calculadora()}
    </>
  )
}
