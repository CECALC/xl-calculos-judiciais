import React, { SyntheticEvent } from 'react'
import { TextField } from '@fluentui/react'

interface IProps {
  rotulo: string
  valor?: number
  onChange: (novoValor: number) => void
}

export default function AppNumeroInput({ rotulo, valor, onChange }: IProps) {
  const atualizar = (event: SyntheticEvent<HTMLElement, Event>, novoValor?: string) => {
    const val = novoValor?.replace(/[^.0-9]+/g, '')
    console.log(val)
    onChange(Number(val))
  }

  const selecionar = (e: any) => console.log(e.target.select())

  return (
    <TextField
      label={rotulo}
      value={String(valor)}
      style={{ textAlign: 'right' }}
      onFocus={selecionar}
      onChange={atualizar}
    />
  )
}
