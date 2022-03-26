import { mergeStyles, Pivot, PivotItem, Stack, IStackTokens } from '@fluentui/react'
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

export default function BarraNevegacao() {
  return (
    <Pivot
      aria-label="Barra de Navegação"
      linkSize="large"
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
        <Stack horizontalAlign="center" tokens={verticalGapStackTokens}>
          <Stack.Item className={stackItemStyles}>
            <AtualizarIndices />
          </Stack.Item>
          <Stack.Item className={stackItemStyles}>
            <EditarConfiguracoes />
          </Stack.Item>
        </Stack>
      </PivotItem>
    </Pivot>
  )
}
