import React from 'react'
import { 
  Dialog, 
  DialogType, 
  DialogFooter, 
  PrimaryButton 
} from '@fluentui/react'

const dialogStyles = {
  isBlocking: false,
  styles: { main: { maxWidth: 450 } }
}

const dialogContentProps = {
  type: DialogType.normal,
  closeButtonAriaLabel: 'Fechar',
  title: 'Sem Opções',
  subText: 'Não há opções disponíveis.'
}

interface IProps {
  mostrar: boolean
  onDismiss: () => void
}

export default function AppModalSelecionarVazio({ mostrar, onDismiss }: IProps) {
  return (
    <Dialog
      hidden={!mostrar}
      onDismiss={onDismiss}
      dialogContentProps={dialogContentProps}
      modalProps={dialogStyles}
    >
      <DialogFooter>
        <PrimaryButton onClick={onDismiss} text="Fechar" />
      </DialogFooter>
    </Dialog>
  )
}
