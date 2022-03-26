import React, { useState } from 'react'
import { 
  mergeStyles,
  IStackTokens, 
  Stack, 
  DefaultButton, 
  PrimaryButton 
} from '@fluentui/react'
import { AppCartao } from '../../components'
import { persistirDados, recuperarDados, TIPO_PERSISTENCIA } from '../../services'

const stackTokens: IStackTokens = { childrenGap: 40 }

const icone = {
  copiar: 'Copy',
  colar: 'Paste',
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
    <AppCartao titulo="Área de Transferência" icone="ClipboardSolid">
      <Stack horizontal tokens={stackTokens} horizontalAlign="center">
        <PrimaryButton
          text="Copiar"
          iconProps={{
            iconName: copiando ? icone.processando : icone.copiar,
            className: copiando ? classeCarregando : ''
          }}
          onClick={copiar}
          allowDisabledFocus
          disabled={copiando || colando}
        />
        <DefaultButton
          text="Colar"
          iconProps={{
            iconName: colando ? icone.processando : icone.colar,
            className: colando ? classeCarregando : ''
          }}
          onClick={colar}
          allowDisabledFocus
          disabled={colando || copiando}
        />
      </Stack>
    </AppCartao>
  )
}
