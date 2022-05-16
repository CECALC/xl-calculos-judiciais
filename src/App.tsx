import React, { useState } from 'react';
import { mergeStyles } from '@fluentui/react';
import { BarraPrincipal, ErrorBoundary, TabsNavegacao, PainelLateral, TelaWord } from './views'
import { depurador } from './utils';

const classeApp = mergeStyles({
  textAlign: 'center',
  width: '100%',
  height: '100%'
})

interface IProps {
  host: Office.HostType
  platform: Office.PlatformType
}

export const App = ({ host, platform }: IProps) => {
  const [painelAberto, mudarStatusPainel] = useState<boolean>(false)
  depurador.info(host && host.toString())
  depurador.info(platform && platform.toString())

  const fecharPainel = () => mudarStatusPainel(false)
  const abrirPainel = () => mudarStatusPainel(true)

  return (
    <ErrorBoundary>
      <div className={classeApp}>
        <BarraPrincipal onPanelOpen={abrirPainel} />
        <PainelLateral abrir={painelAberto} onDismiss={fecharPainel} />
        {
          host === Office.HostType.Excel
          ? 
          <TabsNavegacao /> 
          : 
          <TelaWord />
        }
        
      </div>
    </ErrorBoundary>
  )
};
