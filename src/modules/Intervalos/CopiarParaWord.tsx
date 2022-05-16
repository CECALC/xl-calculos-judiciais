import React, { useState } from 'react'
import { 
  IStackTokens, 
  Stack, 
  PrimaryButton, 
  DefaultButton
} from '@fluentui/react'
import { AppCartao } from '../../components'
import { armazenamento, prepararTransferenciaParaWord } from '../../services'

const stackTokens: IStackTokens = { childrenGap: 40 }

export default function CopiarParaWord() {
  const [copiando, mudarCopiando] = useState<boolean>(false)

  const copiar = async () => {
    mudarCopiando(true)
    await prepararTransferenciaParaWord()
    mudarCopiando(false)
  }

  const apagar = () => armazenamento.limparDadosTransferencia()

  return (
    <AppCartao titulo="Copiar para Word" icone="WordDocument" atualizando={copiando}>
      <Stack horizontal tokens={stackTokens} horizontalAlign="center">
        <PrimaryButton
          text="Copiar"
          iconProps={{ iconName: 'Copy' }}
          onClick={copiar}
          allowDisabledFocus
          disabled={copiando}
        />
        <DefaultButton
          text="Apagar"
          iconProps={{ iconName: 'EraseTool' }}
          onClick={apagar}
          allowDisabledFocus
          disabled={copiando}
        />
      </Stack>
    </AppCartao>
  )
}
