import React, { useState } from 'react'
import { mergeStyles, Pivot, PivotItem, Stack, IStackTokens, MessageBar, MessageBarType } from '@fluentui/react'
import {
  AreaDeTransferencia,
  CalculadorasPrevidenciarias,
  ConfiguracoesPessoais,
  PreenchimentoAutomatico,
  AtualizarIndices,
  EditarConfiguracoes
} from '../modules'

const verticalGapStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 30
}

const stackItemStyles = mergeStyles({
  width: '100%'
})

interface IStatusAtualizacao {
  mostrar: boolean
  mensagem: string
  tipo: 'erro' | 'sucesso'
}

export default function BarraNevegacao() {
  const [statusAtualizacao, mudarStatusAtualizacao] = useState<IStatusAtualizacao>({ mostrar: false, mensagem: '', tipo: 'erro' })

  const fechar = () => {
    mudarStatusAtualizacao(prev => ({
      ...prev,
      mostrar: false
    }))
  }

  const aoConcluirAtualizacao = () => {
    mudarStatusAtualizacao({
      mostrar: true, 
      mensagem: 'Atualização concluída com sucesso',
      tipo: 'sucesso'
    })
    setTimeout(() => fechar(), 3000)
  }

  const aoFalharAtualizacao = () => {
    mudarStatusAtualizacao({
      mostrar: true, 
      mensagem: 'Falha na atualização de índices',
      tipo: 'erro'
    })
    setTimeout(() => fechar(), 3000)
  }

  return (
    <Pivot
      aria-label="Barra de Navegação"
      linkSize="normal"
      overflowBehavior="menu"
      overflowAriaLabel="mais itens"
    >
      <PivotItem headerText="Intervalos" itemIcon="TableComputed">
        <Stack horizontalAlign="center" tokens={verticalGapStackTokens}>
          <Stack.Item className={stackItemStyles}>
            <AreaDeTransferencia />
          </Stack.Item>
          <Stack.Item className={stackItemStyles}>
            <ConfiguracoesPessoais />
          </Stack.Item>
        </Stack>
      </PivotItem>
      <PivotItem headerText="Preenchimento" itemIcon="AutoEnhanceOn">
        <Stack horizontalAlign="center" tokens={verticalGapStackTokens}>
          <Stack.Item className={stackItemStyles}>
            <PreenchimentoAutomatico />
          </Stack.Item>
        </Stack>
      </PivotItem>
      <PivotItem headerText="Calculadoras" itemIcon="Calculator">
        <Stack horizontalAlign="center" tokens={verticalGapStackTokens}>
          <Stack.Item className={stackItemStyles}>
            <CalculadorasPrevidenciarias />
          </Stack.Item>
        </Stack>
      </PivotItem>
      <PivotItem headerText="Avançado" itemIcon="Settings">
        {
          statusAtualizacao.mostrar && <MessageBar
            delayedRender={false}
            messageBarType={statusAtualizacao.tipo === 'erro' ? MessageBarType.error : MessageBarType.success}
            onDismiss={fechar}
            dismissButtonAriaLabel="fechar"
          >
            {statusAtualizacao.mensagem}
          </MessageBar>
        }
        <Stack horizontalAlign="center" tokens={verticalGapStackTokens}>
          <Stack.Item className={stackItemStyles}>
            <AtualizarIndices aoConcluir={aoConcluirAtualizacao} aoFalhar={aoFalharAtualizacao} />
          </Stack.Item>
          <Stack.Item className={stackItemStyles}>
            <EditarConfiguracoes />
          </Stack.Item>
        </Stack>
      </PivotItem>
    </Pivot>
  )
}
