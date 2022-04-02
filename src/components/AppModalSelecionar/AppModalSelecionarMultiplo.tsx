import React, { useEffect, useState } from 'react'
import { 
  Dialog, 
  DialogType, 
  DialogFooter, 
  Separator, 
  PrimaryButton, 
  DefaultButton, 
  IChoiceGroupOption, 
  Checkbox,
  IStackTokens,
  Stack 
} from '@fluentui/react'
import { tipoFuncao } from '@cecalc/utils'
import AppModalSelecionarVazio from './AppModalSelecionarVazio'

const dialogStyles = {
  isBlocking: false,
  styles: { main: { maxWidth: 450 } }
}

const verticalGapStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 10
}

interface IProps {
  mostrar: boolean
  titulo: string
  mensagem: string
  opcoes: IChoiceGroupOption[]
  aoSalvar: (selecionada: string[]) => void
  aoDispensar?: () => void
}

export default function AppModalSelecionarMultiplo({
  mostrar,
  opcoes,
  titulo,
  mensagem,
  aoSalvar,
  aoDispensar
}: IProps) {
  const [totalOpcoes, mudarTotalOpcoes] = useState<number>(
    Array.isArray(opcoes) ? opcoes.length : 0
  )
  const [selecionadas, mudarSelecionadas] = useState<number[]>([])

  useEffect(() => {
    mudarTotalOpcoes(Array.isArray(opcoes) ? opcoes.length : 0)
    mudarSelecionadas([])
  }, [opcoes])

  const cancelar = () => {
    if (tipoFuncao(aoDispensar)) aoDispensar()
  }

  const salvar = () => {
    const resultado = opcoes
      .filter((_opcao, indice) => selecionadas.includes(indice))
      .map(opcao => opcao.key)
    aoSalvar(resultado)
  }

  const selecionar = (indice: number, checked = false) => {
    const pos = selecionadas.indexOf(indice)
    const temp = selecionadas.slice(0)
    if (checked && pos >= 0) return
    if (!checked && pos < 0) return
    if (checked) {
      temp.push(indice)
    } else {
      temp.splice(pos, 1)
    }
    mudarSelecionadas(temp)
  }

  const alternarSelecaoTudo = () => {
    if (selecionadas.length) {
      mudarSelecionadas([])
    } else {
      mudarSelecionadas(opcoes.map((_opcao, indice) => indice))
    }
  }

  const checkboxes = opcoes.map((opcao, indice) => {
    return (
      <Checkbox
        label={opcao.text}
        checked={selecionadas.includes(indice)}
        onChange={(_event, checked) => selecionar(indice, checked)}
        key={opcao.key}
      />
    )
  })

  if (totalOpcoes > 0) {
    return (
      <Dialog
        hidden={!mostrar}
        onDismiss={cancelar}
        dialogContentProps={{
          type: DialogType.largeHeader,
          closeButtonAriaLabel: 'Fechar',
          title: titulo,
          subText: mensagem
        }}
        modalProps={dialogStyles}
      >
        <Stack tokens={verticalGapStackTokens}>
          <Checkbox
            label="Selecionar tudo"
            indeterminate={selecionadas.length > 0 && selecionadas.length !== opcoes.length}
            checked={selecionadas.length === opcoes.length}
            onChange={alternarSelecaoTudo}
            key={'__tudo___'}
          />
          <Separator />
          {checkboxes}
        </Stack>
        <DialogFooter>
          <PrimaryButton onClick={salvar} text="Selecionar" />
          <DefaultButton onClick={cancelar} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    )
  }
  return <AppModalSelecionarVazio mostrar={mostrar} onDismiss={cancelar} />
}
