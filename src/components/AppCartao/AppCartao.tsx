import React from 'react'
import { 
  ITheme, 
  mergeStyles, 
  getTheme, 
  DocumentCard,
  DocumentCardDetails,
  DocumentCardLogo,
  DocumentCardTitle,
  ProgressIndicator
} from '@fluentui/react'

const theme: ITheme = getTheme()
const { palette } = theme

interface IProps {
  icone: string
  ativo?: boolean
  erro?: boolean
  atualizando?: boolean
  titulo: string
  children: JSX.Element
}

const classeCartao = mergeStyles({
  padding: '0 16px 16px 16px'
})

const classeOculto = mergeStyles({
  visibility: 'hidden',
  marginBottom: -9
})

const classevisivel = mergeStyles({
  visibility: 'visible',
  marginBottom: -8
})


export default function AppCartao({
  icone,
  ativo = false,
  erro = false,
  atualizando = false,
  titulo,
  children
}: IProps) {
  const classeIcone = mergeStyles({
    color: ativo ? palette.green : erro ? palette.red : palette.neutralPrimary
  })

  const aplicarIcone = ativo ? 'CheckMark' : erro ? 'Cancel' : icone

  return (
    <>
      <ProgressIndicator className={atualizando ? classevisivel : classeOculto} />
      <DocumentCard aria-label={titulo} className={classeCartao}>
        <DocumentCardLogo logoIcon={aplicarIcone} className={classeIcone}></DocumentCardLogo>
        <DocumentCardTitle title={titulo}></DocumentCardTitle>
        <DocumentCardDetails>{children}</DocumentCardDetails>
      </DocumentCard>
    </>
  )
}
