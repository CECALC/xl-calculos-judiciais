import React from 'react'
import { mergeStyles, Stack, IStackTokens } from '@fluentui/react'
import {
  PreencherDocumento
} from '../modules'

const verticalGapStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 30
}

const stackItemStyles = mergeStyles({
  width: '100%'
})

export default function TelaWord() {
  return (
    <Stack horizontalAlign="center" tokens={verticalGapStackTokens}>
      <Stack.Item className={stackItemStyles}>
        <PreencherDocumento />
      </Stack.Item>
    </Stack>
  )
}
