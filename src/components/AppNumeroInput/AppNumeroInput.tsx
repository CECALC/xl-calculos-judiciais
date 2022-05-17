import React, { SyntheticEvent } from 'react'
import { Position, SpinButton } from '@fluentui/react'
import { valorNumerico } from '@cecalc/utils'

interface IProps {
  rotulo: string
  valor?: number
  onChange: (novoValor: number) => void
}

export default function AppNumeroInput({ rotulo, valor, onChange }: IProps) {
  const atualizar = (event: SyntheticEvent<HTMLElement, Event>, novoValor?: string) => {
    if (!valorNumerico(novoValor)) return
    onChange(Number(novoValor))
  }

  const selecionar = (e: any) => console.log(e.target.select())

  return (
    <SpinButton
      label={rotulo}
      labelPosition={Position.top}
      value={String(valor || 0)}
      min={0}
      step={1}
      incrementButtonAriaLabel="Incrementar valor"
      decrementButtonAriaLabel="Decrementar valor"
      style={{ textAlign: 'right' }}
      onFocus={selecionar}
      onChange={atualizar}
    />
  )
}
