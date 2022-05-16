import React, { useState } from 'react'
import { 
  Callout,
  Text,
  IStackTokens, 
  Stack, 
  DefaultButton, 
  PrimaryButton, 
  getTheme,
  mergeStyleSets,
  FontWeights
} from '@fluentui/react'
import { useId } from '@fluentui/react-hooks';
import { AppCartao } from '../../components'
import { persistirDados, recuperarDados, TIPO_PERSISTENCIA, armazenamento } from '../../services'

const stackTokens: IStackTokens = { childrenGap: 40 }

const theme = getTheme();
const styles = mergeStyleSets({
  callout: {
    width: 'auto',
    padding: '20px 24px',
    background: theme.semanticColors.bodyBackground,
  },
  title: {
    marginBottom: 12,
    fontWeight: FontWeights.regular,
  },
  actions: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
});

export default function ExcelParaExcel() {
  const [mostrarMensagem, mudarMostrarMensagem] = useState<boolean>(false)
  const [copiando, mudarCopiando] = useState<boolean>(false)
  const [colando, mudarColando] = useState<boolean>(false)
  const buttonId = useId('callout-button');
  const labelId = useId('callout-label');

  const fecharMensagem = () => {
    mudarMostrarMensagem(false)
  }

  const copiar = async () => {
    mudarCopiando(true)
    await persistirDados(TIPO_PERSISTENCIA.CACHE)
    mudarCopiando(false)
  }

  const colar = async () => {
    if (!armazenamento.temCache()) {
      mudarMostrarMensagem(true)
      return
    }
    mudarColando(true)
    await recuperarDados(TIPO_PERSISTENCIA.CACHE)
    mudarColando(false)
  }

  return (
    <AppCartao titulo="Excel para Excel" icone="ExcelDocument" atualizando={copiando || colando}>
      <>
        <Stack horizontal tokens={stackTokens} horizontalAlign="center">
          <PrimaryButton
            text="Copiar"
            iconProps={{ iconName: 'Copy' }}
            onClick={copiar}
            allowDisabledFocus
            disabled={copiando || colando}
          />
          <DefaultButton
            id={buttonId}
            text="Colar"
            iconProps={{ iconName: 'Paste' }}
            onClick={colar}
            allowDisabledFocus
            disabled={colando || copiando}
          />
        </Stack>
        {mostrarMensagem && (
            <Callout
              ariaLabelledBy={labelId}
              role="dialog"
              gapSpace={0}
              className={styles.callout}
              onDismiss={fecharMensagem}
              target={`#${buttonId}`}
              isBeakVisible={false}
              setInitialFocus
            >
              <Text block className={styles.title} id={labelId}>
                Não há dados para colar.<br/>Copie primeiro os dados de uma planilha.
              </Text>
              <div className={styles.actions}>
                <DefaultButton onClick={fecharMensagem} text="Fechar" />
              </div>
            </Callout>
          )}        
      </>
    </AppCartao>
  )
}
