import React, { FormEvent, useEffect, useState } from 'react'
import { 
  Dialog, 
  DialogType, 
  DialogFooter, 
  PrimaryButton, 
  DefaultButton, 
  ChoiceGroup, 
  IChoiceGroupOption 
} from '@fluentui/react'
import AppModalSelecionarVazio from './AppModalSelecionarVazio'
import { tipoFuncao } from '@cecalc/utils/dist/utils'

const dialogStyles = {
  isBlocking: false,
  styles: { main: { maxWidth: 450 } }
}

interface IProps {
  opcoes: IChoiceGroupOption[]
  titulo: string
  mensagem: string
  mostrar: boolean
  aoSalvar: (selecionada: string) => void
  aoDispensar?: () => void
}

export default function AppModalSelecionarUnico({
  opcoes,
  titulo,
  mensagem,
  mostrar,
  aoSalvar,
  aoDispensar
}: IProps) {
  const [temOpcoes, mudarTemOpcoes] = useState<boolean>(Array.isArray(opcoes) && opcoes.length > 0)
  const [selecionada, setSelecionada] = useState<string>(Array.isArray(opcoes) && opcoes.length > 0 ? opcoes[0].key : '')

  useEffect(() => {
    mudarTemOpcoes(Array.isArray(opcoes) && opcoes.length > 0)
  }, [opcoes])

  const dialogContentProps = {
    type: DialogType.largeHeader,
    closeButtonAriaLabel: 'Fechar',
    title: titulo,
    subText: mensagem
  }

  const cancelar = () => {
    if (tipoFuncao(aoDispensar)) aoDispensar()
  }

  const salvar = () => {
    aoSalvar(selecionada)
  }

  const selecionar = (
    _ev?: FormEvent<HTMLInputElement | HTMLElement>,
    opcao?: IChoiceGroupOption
  ) => {
    if (opcao) setSelecionada(opcao.key)
  }

  if (temOpcoes) {
    return (
      <Dialog
        hidden={!mostrar}
        onDismiss={cancelar}
        dialogContentProps={dialogContentProps}
        modalProps={dialogStyles}
      >
        <ChoiceGroup defaultSelectedKey={selecionada} options={opcoes} onChange={selecionar} />
        <DialogFooter>
          <PrimaryButton onClick={salvar} text="Selecionar" />
          <DefaultButton onClick={cancelar} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    )
  }
  return <AppModalSelecionarVazio mostrar={mostrar} onDismiss={cancelar} />
}
