import React, { useState } from 'react'
import { 
  mergeStyles,
  Stack, 
  IStackStyles,
  DefaultButton 
} from '@fluentui/react'
import { v4 as uuid } from 'uuid'
import CalculadoraBeneficio from './CalculadoraBeneficio'
import CalculadoraIntervalo from './CalculadoraIntervalo'
import CalculadoraPrescricao from './CalculadoraPrescricao'
import CalculadoraTempo from './CalculadoraTempo'

const stackStyles: Partial<IStackStyles> = { root: { height: 44 } }

const classeBotao = mergeStyles({
  border: 'none'
})

export default function CalculadorasPrevidenciarias() {
  const [selecionada, mudarSelecionada] = useState<number>(0)
  const [chave0, mudarChave0] = useState<string>(uuid())
  const [chave1, mudarChave1] = useState<string>(uuid())
  const [chave2, mudarChave2] = useState<string>(uuid())
  const [chave3, mudarChave3] = useState<string>(uuid())

  const calculadora = () => {
    if (selecionada === 1) return <CalculadoraTempo key={chave1} aoApagar={() => mudarChave1(uuid())} />
    if (selecionada === 2) return <CalculadoraIntervalo key={chave2} aoApagar={() => mudarChave2(uuid())} />
    if (selecionada === 3) return <CalculadoraPrescricao key={chave3} aoApagar={() => mudarChave3(uuid())} />
    return <CalculadoraBeneficio key={chave0} aoApagar={() => mudarChave0(uuid())} />
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
