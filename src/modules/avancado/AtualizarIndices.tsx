import React, { useState } from 'react'
import { 
  IStackTokens, 
  Stack, 
  PrimaryButton, 
  mergeStyles 
} from '@fluentui/react'
import { AppCartao } from '../../components'
import { depurador } from '../../utils'

const stackTokens: IStackTokens = { childrenGap: 40 }

const icone = {
  atualizar: 'Refresh',
  processando: 'Sync'
}

const classeCarregando = mergeStyles({
  selectors: {
    svg: {
      animationName: 'rotacao',
      animationDuration: '1s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear'
    }
  }
})

export default function AtualizarIndices() {
  const [atualizando, mudarAtualizando] = useState<boolean>(false)

  const atualizar = async () => {
    mudarAtualizando(true)
    depurador.info('atualizando...')
    setTimeout(() => {
      mudarAtualizando(false)
      depurador.sucesso('atualizou')
    }, 1000)
  }

  return (
    <AppCartao titulo="Atualizar Índices" icone="TableGroup">
      <Stack horizontal tokens={stackTokens} horizontalAlign="center">
        <PrimaryButton
          text="Atualizar"
          iconProps={{
            iconName: atualizando ? icone.processando : icone.atualizar,
            className: atualizando ? classeCarregando : ''
          }}
          onClick={atualizar}
          allowDisabledFocus
          disabled={atualizando}
        />
      </Stack>
    </AppCartao>
  )
}
