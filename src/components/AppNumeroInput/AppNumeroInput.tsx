import React, { SyntheticEvent } from 'react'
import { TextField } from '@fluentui/react'
import { validarComoNumero } from '../../utils'
import { tipoNumero, tipoString } from '@cecalc/utils'

interface IProps {
  rotulo: string
  valor?: number
  decimal?: boolean
  max?: number
  min?: number
  obrigatorio?: boolean
  prefixo?: string
  sufixo?: string
  aoMudar: (novoValor?: number) => void
}

const padraoDecimal = /^-?\d+(,\d+)?$/
const padraoInteiro = /^-?\d+$/

export default function AppNumeroInput({ rotulo, valor, decimal, max, min, obrigatorio, prefixo, sufixo, aoMudar }: IProps) {

  obrigatorio = obrigatorio === true
  decimal = decimal === true

  const padrao = decimal ? padraoDecimal : padraoInteiro

  const [entrada, mudarEntrada] = React.useState<string | undefined>(tipoNumero(valor) ? String(valor).replace('.', ',') : undefined)

  const validar = (val: string): string => validarComoNumero(val, decimal, { obrigatorio, min, max })

  const atualizar = (event: SyntheticEvent<HTMLElement, Event>, novoValor?: string) => {
    mudarEntrada(novoValor)
    if (!tipoString(novoValor)) return aoMudar()
    if (!padrao.test(novoValor)) return aoMudar()
    return aoMudar(Number(novoValor.replace(',', '.')))
  }

  const selecionar = (e: any) => e.target.select()

  return (
    <TextField
      value={entrada}
      label={rotulo}
      prefix={prefixo}
      suffix={sufixo}
      style={{ textAlign: 'right' }}
      aria-required={obrigatorio}
      autoComplete="off"
      required={obrigatorio}
      validateOnLoad={false}
      deferredValidationTime={500}
      onFocus={selecionar}
      onChange={atualizar}
      onGetErrorMessage={validar}
    />
  )
}
