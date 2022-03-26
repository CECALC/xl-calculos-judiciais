import { mergeStyles, Spinner, SpinnerSize } from '@fluentui/react'

const classeCarregando = mergeStyles({
  textAlign: 'center',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

export const Carregando: React.FunctionComponent = () => {
  return (
    <div className={classeCarregando}>
      <Spinner size={SpinnerSize.large} label="Aguarde..." />
    </div>
  )
}
