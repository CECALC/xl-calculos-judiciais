import React from 'react'
import { DatePicker, IDatePickerStrings } from '@fluentui/react'
import { CData, converterStringEmData, tipoData } from '@cecalc/utils'

const datePickerStrings: IDatePickerStrings = {
  invalidInputErrorMessage: 'Data inválida',
  isOutOfBoundsErrorMessage: 'Intervalo inválido',
  isRequiredErrorMessage: 'A data é obrigatória',
  isResetStatusMessage: 'Entrada inválida {0}, data reconfigurada para {1}',
  goToToday: 'Ir para hoje',
  months: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ],
  shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  days: [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado'
  ],
  shortDays: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
}

interface IProps {
  rotulo: string
  valor: Date
  onChange: (novoValor: Date) => void
}

export default function AppDataInput({ rotulo, valor, onChange }: IProps) {
  const atualizar = (novoValor?: Date | null) => {
    if (!novoValor) return
    if (!new CData(novoValor).dataValida()) return
    onChange(novoValor)
  }

  const formatarData = (data?: Date) => {
    if (!tipoData(data)) return ''
    return data.toJSON().slice(0, 10).split('-').reverse().join('/')
  }

  const converterEmData = (s: string) => {
    try {
      return converterStringEmData(s, 'pt-BR')
    } catch (e) {
      return null
    }
  }

  return (
    <DatePicker
      label={rotulo}
      value={valor}
      strings={datePickerStrings}
      allowTextInput
      formatDate={formatarData}
      parseDateFromString={converterEmData}
      pickerAriaLabel="Selecionar data"
      placeholder="dd/mm/aaaa"
      underlined={false}
      onSelectDate={atualizar}
    />
  )
}
