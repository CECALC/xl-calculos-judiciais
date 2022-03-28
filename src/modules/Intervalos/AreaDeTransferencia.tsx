import React, { useState } from 'react'
import { 
  IStackTokens, 
  Stack, 
  DefaultButton, 
  PrimaryButton 
} from '@fluentui/react'
import { AppCartao } from '../../components'
import { persistirDados, recuperarDados, TIPO_PERSISTENCIA } from '../../services'

const stackTokens: IStackTokens = { childrenGap: 40 }

export default function AreaDeTransferencia() {
  const [copiando, mudarCopiando] = useState<boolean>(false)
  const [colando, mudarColando] = useState<boolean>(false)

  const copiar = async () => {
    mudarCopiando(true)
    await persistirDados(TIPO_PERSISTENCIA.CACHE)
    mudarCopiando(false)
  }

  const colar = async () => {
    mudarColando(true)
    await recuperarDados(TIPO_PERSISTENCIA.CACHE)
    mudarColando(false)
  }

  return (
    <AppCartao titulo="Área de Transferência" icone="ClipboardSolid" atualizando={copiando || colando}>
      <Stack horizontal tokens={stackTokens} horizontalAlign="center">
        <PrimaryButton
          text="Copiar"
          iconProps={{ iconName: 'Copy' }}
          onClick={copiar}
          allowDisabledFocus
          disabled={copiando || colando}
        />
        <DefaultButton
          text="Colar"
          iconProps={{ iconName: 'Paste' }}
          onClick={colar}
          allowDisabledFocus
          disabled={colando || copiando}
        />
      </Stack>
    </AppCartao>
  )
}
