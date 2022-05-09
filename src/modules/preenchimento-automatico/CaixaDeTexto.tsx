import React, { ChangeEvent } from 'react'
import { mergeStyles } from '@fluentui/react'

const classeContainer = mergeStyles({
  width: '100%',
  height: '200px',
  marginBottom: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const classeCaixaDeTexto = mergeStyles({
  width: '90%',
  height: '90%',
  overflowY: 'auto',
  overflowX: 'hidden',
  resize: 'none',
  boxShadow: 'none',
  outline: 'none',
  border: '1px solid #8a8886',
  padding: '8px'
})

const classeDescricao = mergeStyles({
  fontSize: '0.7rem'
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
    <div className={classeContainer}>
      {descricao.map((linha, indice) => (
        <div key={indice} className={classeDescricao}>
          <span>
            <strong>{linha[0]}&nbsp;</strong>
          </span>
          <span>{linha[1]}</span>
        </div>
      ))}
    </div>
  ) : (
    <div className={classeContainer}>
      <textarea
        value={valor}
        placeholder="Cole o texto aqui..."
        className={classeCaixaDeTexto}
        onChange={atualizar}
      ></textarea>
    </div>
  )
}
