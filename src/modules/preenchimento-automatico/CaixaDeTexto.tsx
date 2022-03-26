import React, { ChangeEvent } from 'react'
import { mergeStyles } from '@fluentui/react'

const classeCaixaDeTexto = mergeStyles({
  width: '93%',
  height: '200px',
  overflowY: 'auto',
  overflowX: 'hidden',
  resize: 'none',
  boxShadow: 'none',
  outline: 'none',
  padding: '8px',
  marginBottom: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

interface IProps {
  carregado: boolean
  descricao: string[][]
  valor: string
  onChange: (texto: string) => void
}

export default function CaixaDeTexto({ carregado, valor, descricao, onChange }: IProps) {
  const atualizar = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }

  return carregado ? (
    <div className={classeCaixaDeTexto}>
      {descricao.map((linha, indice) => (
        <div key={indice}>
          <span>
            <strong>{linha[0]}&nbsp;</strong>
          </span>
          <span>{linha[1]}</span>
        </div>
      ))}
    </div>
  ) : (
    <textarea
      value={valor}
      placeholder="Cole o texto aqui..."
      className={classeCaixaDeTexto}
      onChange={atualizar}
    ></textarea>
  )
}
