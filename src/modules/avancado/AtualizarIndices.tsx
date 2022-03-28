import React, { useState } from 'react'
import { 
  IStackTokens, 
  Stack, 
  PrimaryButton
} from '@fluentui/react'
import { AppCartao } from '../../components'
import { depurador } from '../../utils'

const stackTokens: IStackTokens = { childrenGap: 40 }

export default function AtualizarIndices() {
  const [atualizando, mudarAtualizando] = useState<boolean>(false)

  const atualizar = async () => {
    mudarAtualizando(true)
    depurador.info('atualizando...')
    setTimeout(() => {
      mudarAtualizando(false)
      depurador.sucesso('atualizou')
    }, 2000)
  }

  return (
    <AppCartao titulo="Atualizar Índices" icone="TableGroup" atualizando={atualizando}>
      <Stack horizontal tokens={stackTokens} horizontalAlign="center">
        <PrimaryButton
          text="Atualizar"
          iconProps={{ iconName: 'Sync' }}
          onClick={atualizar}
          allowDisabledFocus
          disabled={atualizando}
        />
      </Stack>
    </AppCartao>
  )
}
