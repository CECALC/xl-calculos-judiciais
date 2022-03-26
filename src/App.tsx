import React, { useState } from 'react';
import { mergeStyles } from '@fluentui/react';
import './App.css';
import { BarraPrincipal, ErrorBoundary, TabsNavegacao, PainelLateral } from './views'

const classeApp = mergeStyles({
  textAlign: 'center',
  width: '100%',
  height: '100%'
})

export const App: React.FunctionComponent = () => {
  const [painelAberto, mudarStatusPainel] = useState<boolean>(false)

  const fecharPainel = () => mudarStatusPainel(false)
  const abrirPainel = () => mudarStatusPainel(true)

  return (
    <ErrorBoundary>
      <div className={classeApp}>
        <BarraPrincipal onPanelOpen={abrirPainel} />
        <PainelLateral abrir={painelAberto} onDismiss={fecharPainel} />
        <TabsNavegacao />
      </div>
    </ErrorBoundary>
  )
};
