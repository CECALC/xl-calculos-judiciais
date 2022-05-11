import React, { useState } from 'react'
import { 
  IStackTokens, 
  Stack, 
  PrimaryButton
} from '@fluentui/react'
import { AppCartao } from '../../components'
import { depurador } from '../../utils'
import { atualizarIndices } from '../../services/atualizacao-indices'

const stackTokens: IStackTokens = { childrenGap: 40 }

interface IProps {
  aoConcluir?: () => void
  aoFalhar?: () => void
}

const endpoint = 'https://contadoria.herokuapp.com/api/indicesConsolidados/download'

export default function AtualizarIndices({ aoFalhar, aoConcluir } : IProps) {
  const [atualizando, mudarAtualizando] = useState<boolean>(false)

  const atualizar = async () => {
    let sucesso = false
    mudarAtualizando(true)
    depurador.info('atualizando...')
    const request = new XMLHttpRequest()
    request.onload = async () => {
      sucesso = true
      depurador.console.log(request.response.trim())
      mudarAtualizando(false)
      try {
        await atualizarIndices(request.response.trim())
        if (typeof aoConcluir === 'function') aoConcluir()
      } catch (e) {
        depurador.console.error(e)
        if (typeof aoFalhar === 'function') aoFalhar()
      }
    }
    request.onerror = () => {
      mudarAtualizando(false)
      if (typeof aoFalhar === 'function') aoFalhar()
    }
    request.open('GET', endpoint)
    request.send()
    setTimeout(() => {
      if (sucesso) return
      request.abort()
      mudarAtualizando(false)
      if (typeof aoFalhar === 'function') aoFalhar()
    }, 10000)
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
