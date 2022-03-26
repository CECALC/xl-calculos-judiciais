import React from 'react'
import { 
  ITheme, 
  mergeStyles, 
  getTheme, 
  DocumentCard,
  DocumentCardDetails,
  DocumentCardLogo,
  DocumentCardTitle
} from '@fluentui/react'

const theme: ITheme = getTheme()
const { palette } = theme

interface IProps {
  icone: string
  ativo?: boolean
  erro?: boolean
  titulo: string
  children: JSX.Element
}

const classeCartao = mergeStyles({
  padding: '0 16px 16px 16px'
})

export default function AppCartao({
  icone,
  ativo = false,
  erro = false,
  titulo,
  children
}: IProps) {
  const classeIcone = mergeStyles({
    color: ativo ? palette.green : erro ? palette.red : palette.neutralPrimary
  })

  const aplicarIcone = ativo ? 'CheckMark' : erro ? 'Cancel' : icone

  return (
    <DocumentCard aria-label={titulo} className={classeCartao}>
      <DocumentCardLogo logoIcon={aplicarIcone} className={classeIcone}></DocumentCardLogo>
      <DocumentCardTitle title={titulo}></DocumentCardTitle>
      <DocumentCardDetails>{children}</DocumentCardDetails>
    </DocumentCard>
  )
}
