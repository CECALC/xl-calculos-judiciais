import React, { SyntheticEvent, useState } from 'react'
import { 
  ITheme, 
  getTheme, 
  mergeStyleSets,
  IconButton,
  TextField 
} from '@fluentui/react'

const theme: ITheme = getTheme()
const { palette } = theme

const classes = mergeStyleSets({
  container: {
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listaPrincipal: {
    selectors: {
      '&:hover': { background: palette.neutralLighter }
    }
  },
  separador: {
    margin: 0,
    padding: 0,
    height: '1px',
    borderWidth: 0,
    color: palette.neutralLight,
    backgroundColor: palette.neutralLight
  },
  titulo: {
    margin: 0
  },
  intervalo: {
    fontWeight: '100'
  },
  iconeEditar: {
    color: '#252423'
  },
  iconeSalvar: {
    color: '#107c10'
  },
  iconeCancelar: {
    color: '#252423'
  },
  iconeRemover: {
    color: '#a4262c'
  }
})

interface IProps {
  rotulo: string
  intervalo: string
  valor: string
  aoRemover: (intervalo: string) => void
  aoSalvar: (intervalo: string, valor: string) => void
}

export default function ItemConfiguracoes({
  rotulo,
  intervalo,
  valor,
  aoRemover,
  aoSalvar
}: IProps) {
  const [modoEditar, mudarModoEditar] = useState<boolean>(false)
  const [texto, mudarTexto] = useState<string>(valor)

  const editar = () => {
    mudarModoEditar(true)
  }

  const atualizar = (_event: SyntheticEvent, novoValor?: string) => {
    mudarTexto(novoValor || '')
  }

  const salvar = () => {
    if (texto && texto !== valor) {
      aoSalvar(intervalo, texto)
      mudarModoEditar(false)
    }
  }

  const remover = () => {
    aoRemover(intervalo)
    mudarModoEditar(false)
  }

  const cancelar = () => {
    mudarTexto(valor)
    mudarModoEditar(false)
  }

  return modoEditar ? (
    <div>
      <div className={classes.container}>
        <TextField value={texto} onChange={atualizar} />
        <IconButton
          iconProps={{ iconName: 'CheckMark', className: classes.iconeSalvar }}
          onClick={salvar}
        />
        <IconButton
          iconProps={{ iconName: 'Delete', className: classes.iconeRemover }}
          onClick={remover}
        />
        <IconButton
          iconProps={{ iconName: 'Cancel', className: classes.iconeCancelar }}
          onClick={cancelar}
        />
      </div>
      <hr className={classes.separador} />
    </div>
  ) : (
    <div>
      <div className={`${classes.container} ${classes.listaPrincipal}`}>
        <h4 className={classes.titulo}>
          {rotulo}
          <small className={classes.intervalo}> {intervalo}</small>
        </h4>
        <IconButton
          iconProps={{ iconName: 'Edit', className: classes.iconeEditar }}
          onClick={editar}
        />
      </div>
      <hr className={classes.separador} />
    </div>
  )
}
