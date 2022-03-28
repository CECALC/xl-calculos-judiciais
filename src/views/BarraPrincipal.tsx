import React from 'react'
import { mergeStyles, Icon } from '@fluentui/react'
import logoUrl from '../assets/logo-completo-150.png'

interface IProps {
  onPanelOpen: () => void
}

const classeBarraPrincipal = mergeStyles({
  backgroundColor: '#323130',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 16px'
})

export default function BarraPrincipal({ onPanelOpen }: IProps) {
  return (
    <div className={classeBarraPrincipal}>
      <img src={logoUrl} alt="logo" />
      <Icon iconName="GlobalNavButton" style={{ color: 'white', cursor: 'pointer' }} onClick={onPanelOpen} />
    </div>
  )
}
