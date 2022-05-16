import React from 'react'
import { DefaultButton, Dialog, DialogType, DialogFooter, Icon, getTheme, mergeStyleSets } from '@fluentui/react'

const theme = getTheme();
const styles = mergeStyleSets({
  titulo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  erro: {
    backgroundColor: theme.semanticColors.errorBackground,
    color: theme.semanticColors.errorIcon
  },
  sucesso: {
    backgroundColor: theme.semanticColors.successBackground,
    color: theme.semanticColors.successIcon
  },
  aviso: {
    backgroundColor: theme.semanticColors.warningBackground,
    color: theme.semanticColors.warningIcon
  }
});

export type TTipoModal = 'sucesso' | 'falha' | 'aviso'

interface IProps {
  mensagem: string
  mostrar: boolean
  tipo: TTipoModal
  aoDispensar: () => void
}

export default function AppModalSelecionarUnico({
  mensagem,
  mostrar,
  tipo,
  aoDispensar
}: IProps) {

  const icone = tipo === 'sucesso' ? 'CheckMark' : (tipo === 'falha' ? 'ErrorBadge' : 'Warning')
  const estilo = tipo === 'sucesso' ? styles.sucesso : (tipo === 'falha' ? styles.erro : styles.aviso)
  const titulo = tipo === 'sucesso' ? 'Sucesso' : (tipo === 'falha' ? 'Falha' : 'Aviso')

  return (
    <Dialog
      hidden={!mostrar}
      onDismiss={aoDispensar}
      dialogContentProps={{
        type: DialogType.close,
        closeButtonAriaLabel: 'Fechar',
        title: (
          <div className={styles.titulo}>
            <Icon iconName={icone} className={estilo} style={{ marginRight: 5, height: 18 }} />
            <span className={estilo}>{titulo}</span>
          </div>
        ),
        className: estilo,
        subText: mensagem
      }}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } }
      }}
    >
      <DialogFooter>
        <DefaultButton onClick={aoDispensar} text="Fechar" />
      </DialogFooter>
    </Dialog>
  )
}
