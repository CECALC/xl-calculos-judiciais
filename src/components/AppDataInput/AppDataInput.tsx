import React, { SyntheticEvent } from 'react'
import { TextField } from '@fluentui/react'
import { CData, tipoData } from '@cecalc/utils'
import { validarComoData } from '../../utils'

interface IProps {
  rotulo: string
  valor?: Date
  max?: Date
  min?: Date
  obrigatorio?: boolean
  aoMudar: (novoValor?: Date) => void
}

const padraoData = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/

export default function AppDataInput({ rotulo, valor, max, min, obrigatorio, aoMudar }: IProps) {

  obrigatorio = obrigatorio === true

  const [entrada, mudarEntrada] = React.useState<string | undefined>(tipoData(valor) ? new CData(valor).local() : undefined);

  const validar = (val: string): string => validarComoData(val, { obrigatorio, min, max})

  const atualizar = (event: SyntheticEvent<HTMLElement, Event>, novoValor?: string) => {
    mudarEntrada(novoValor)
    if (!novoValor || !padraoData.test(novoValor!)) return aoMudar()
    const data = new CData(novoValor)
    if (!data.dataValida()) return aoMudar()
    aoMudar(data.nativo())
  }

  const selecionar = (e: any) => e.target.select()

  return (
    <TextField
      value={entrada}
      label={rotulo}
      iconProps={{ iconName: 'Calendar' }}
      style={{ textAlign: 'right', paddingRight: '32px' }}
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
