import React, { useState } from 'react'
import { 
  IStackTokens, 
  Stack, 
  PrimaryButton
} from '@fluentui/react'
import { AppCartao, AppModalAviso, TTipoModal } from '../../components'
import { depurador } from '../../utils'
import { atualizacaoIndices } from '../../services/atualizacao-indices'

const stackTokens: IStackTokens = { childrenGap: 40 }

interface IStatusAtualizacao {
  mostrar: boolean
  mensagem: string
  tipo: TTipoModal
}

export default function AtualizarIndices() {
  const [atualizando, mudarAtualizando] = useState<boolean>(false)
  const [statusAtualizacao, mudarStatusAtualizacao] = useState<IStatusAtualizacao>({ mostrar: false, mensagem: '', tipo: 'sucesso' })

  const fechar = () => {
    mudarStatusAtualizacao({
      mostrar: false,
      mensagem: '',
      tipo: 'sucesso'
    })
  }

  const atualizar = async () => {
    mudarAtualizando(true)
    depurador.info('atualizando...')
    try {
      await atualizacaoIndices.atualizarPlanilha()
      mudarStatusAtualizacao({
        mostrar: true,
        mensagem: 'Atualização concluída com sucesso',
        tipo: 'sucesso'
      })
    } catch (e) {
      mudarStatusAtualizacao({
        mostrar: true,
        mensagem: 'Falha na atualização de índices',
        tipo: 'falha'
      })
    }
    mudarAtualizando(false)
  }

  return (
    <>
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
      <AppModalAviso
        mostrar={statusAtualizacao.mostrar}
        mensagem={statusAtualizacao.mensagem}
        tipo={statusAtualizacao.tipo}
        aoDispensar={fechar}
      />

    </>
  )
}
