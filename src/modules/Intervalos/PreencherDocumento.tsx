import React, { useEffect, useState } from 'react'
import { 
  Callout,
  Text,
  IStackTokens, 
  Stack, 
  PrimaryButton, 
  DefaultButton,
  getTheme,
  mergeStyleSets,
  FontWeights,
  DocumentCard,
  DocumentCardDetails,
  FontIcon,
  FontSizes
} from '@fluentui/react'
import { useId } from '@fluentui/react-hooks';
import { AppCartao } from '../../components'
import { armazenamento, preenchimentoModelos, TPastasDeTrabalho } from '../../services'

const stackTokens: IStackTokens = { childrenGap: 40 }

const theme = getTheme();
const styles = mergeStyleSets({
  mensagem: {
    width: 'auto',
    padding: '20px 24px',
    background: theme.semanticColors.bodyBackground,
  },
  titulo: {
    marginBottom: 12,
    fontWeight: FontWeights.regular,
  },
  acoes: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  status: {
    marginTop: '20px',
    padding: '16px',
  },
  statusTitulo: {
    fontWeight: FontWeights.semibold,
    textAlign: 'left'
  },
  statusLinha: {
    textAlign: 'left',
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusIcone: {
    color: '#217346',
    width: 18,
    height: 18,
    fontSize: 18,
    marginRight: 5
  },
  statusTexto: {
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.medium
  }
});

export default function PreencherDocumento() {
  const [mostrarMensagem, mudarMostrarMensagem] = useState<boolean>(false)
  const [preenchendo, mudarPreenchendo] = useState<boolean>(false)
  const [pastasDeTrabalho, mudarPastasDeTrabalho] = useState<TPastasDeTrabalho>(armazenamento.recuperarPastasDeTrabalho())
  const buttonId = useId('callout-button');
  const labelId = useId('callout-label');

  const fecharMensagem = () => {
    mudarMostrarMensagem(false)
  }

  const preencher = async () => {
    if (!armazenamento.temDadosTransferencia()) {
      mudarMostrarMensagem(true)
      return
    }
    mudarPreenchendo(true)
    await preenchimentoModelos.preencher(armazenamento.recuperarDadosTransferencia())
    mudarPreenchendo(false)
  }

  useEffect(() => {
    const atualizarPastasDeTrabalho = () => mudarPastasDeTrabalho(armazenamento.recuperarPastasDeTrabalho())
    window.addEventListener('storage', atualizarPastasDeTrabalho)
    return () => window.removeEventListener('storage', atualizarPastasDeTrabalho)
  })

  return (
    <>
      <AppCartao titulo="Preencher do Excel" icone="ExcelDocument" atualizando={preenchendo}>
        <>
          <Stack horizontal tokens={stackTokens} horizontalAlign="center">
            <PrimaryButton
              id={buttonId}
              text="Executar"
              iconProps={{ iconName: 'AutoEnhanceOn' }}
              onClick={preencher}
              allowDisabledFocus
              disabled={preenchendo}
            />
          </Stack>
          {mostrarMensagem && (
              <Callout
                ariaLabelledBy={labelId}
                role="dialog"
                gapSpace={0}
                className={styles.mensagem}
                onDismiss={fecharMensagem}
                target={`#${buttonId}`}
                isBeakVisible={false}
                setInitialFocus
              >
                <Text block className={styles.titulo} id={labelId}>
                  Não há dados para preencher.<br/>Copie primeiro os dados de uma planilha.
                </Text>
                <div className={styles.acoes}>
                  <DefaultButton onClick={fecharMensagem} text="Fechar" />
                </div>
              </Callout>
            )}
        </>
      </AppCartao>
      <DocumentCard aria-label='Lista de Pastas de Trabalho' className={styles.status}>
        <DocumentCardDetails>
          {pastasDeTrabalho.length ? <Text block variant='medium' className={styles.statusTitulo}>Dados disponíveis:</Text> : 'Não há dados disponíveis'}
          {pastasDeTrabalho.map((nome, indice) => (
            <div key={indice} className={styles.statusLinha}>
              <FontIcon key={indice} iconName='ExcelDocument' className={styles.statusIcone} />
              <span className={styles.statusTexto}>{nome}</span>
            </div>
          ))}
        </DocumentCardDetails>
      </DocumentCard>
    </>
  )
}
