import React, { useState } from 'react'
import { 
  mergeStyles,
  Stack, 
  IStackStyles,
  DefaultButton 
} from '@fluentui/react'
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
    if (selecionada === 1) return <CalculadoraIntervalo />
    if (selecionada === 2) return <CalculadoraPrescricao />
    return <CalculadoraTempo />
  }

  return (
    <>
      <Stack horizontal styles={stackStyles} horizontalAlign="space-around" disableShrink={false}>
        <DefaultButton
          text="Tempo"
          primary={selecionada === 0}
          className={classeBotao}
          onClick={() => mudarSelecionada(0)}
        />
        <DefaultButton
          text="Intervalo"
          primary={selecionada === 1}
          className={classeBotao}
          onClick={() => mudarSelecionada(1)}
        />
        <DefaultButton
          text="Prescrição"
          primary={selecionada === 2}
          className={classeBotao}
          onClick={() => mudarSelecionada(2)}
        />
      </Stack>
      {calculadora()}
      <div></div>
    </>
  )
}
