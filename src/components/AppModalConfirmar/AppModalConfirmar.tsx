import React from 'react'
import { PrimaryButton, DefaultButton, Dialog, DialogType, DialogFooter } from '@fluentui/react'

interface IProps {
  titulo: string
  mensagem: string
  mostrar: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}

export default function AppModalSelecionarUnico({
  titulo,
  mensagem,
  mostrar,
  aoConfirmar,
  aoCancelar
}: IProps) {
  return (
    <Dialog
      hidden={!mostrar}
      onDismiss={aoCancelar}
      dialogContentProps={{
        type: DialogType.largeHeader,
        closeButtonAriaLabel: 'Fechar',
        title: titulo,
        subText: mensagem
      }}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } }
      }}
    >
      <DialogFooter>
        <PrimaryButton onClick={aoConfirmar} text="Confirmar" />
        <DefaultButton onClick={aoCancelar} text="Cancelar" />
      </DialogFooter>
    </Dialog>
  )
}
