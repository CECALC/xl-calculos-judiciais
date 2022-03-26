import React, { useEffect, useState } from 'react'
import { 
  mergeStyles,
  IGroup,
  DetailsList, 
  IDetailsRowProps, 
  SelectionMode, 
  DefaultButton, 
  IButtonStyles, 
  IChoiceGroupOption 
} from '@fluentui/react'
import ItemConfiguracoes from './ItemConfiguracoes'
import { AppModalConfirmar, AppCartao } from '../../components'
import { obterDadosConfig, removerItemConfig, alterarItemConfig, limparConfig } from '../../services'
import { depurador } from '../../utils'

const estilosBotaoApagar: IButtonStyles = {
  root: {
    backgroundColor: '#a4262c',
    color: '#ffffff',
    border: 'none',
    outline: 'none'
  },
  rootHovered: {
    backgroundColor: '#d13438',
    color: '#ffffff'
  }
}

const classeContainer = mergeStyles({
  margin: '12px 0'
})

export default function EditarConfiguracoes() {
  const [configuracoes, mudarConfiguracoes] = useState<IChoiceGroupOption[]>([])
  const [grupos, mudarGrupos] = useState<IGroup[]>([])
  const [mostrarConfirmacao, mudarMostrarConfirmacao] = useState<boolean>(false)

  useEffect(() => {
    const dadosConfig = obterDadosConfig()
    mudarConfiguracoes(dadosConfig)
    const dadosGrupo = {
      children: [],
      count: dadosConfig.length,
      isCollapsed: true,
      key: 'configuracoes',
      level: 0,
      name: 'Salvas',
      startIndex: 0
    }
    mudarGrupos([dadosGrupo])
    depurador.inspecionar('Itens: ', configuracoes)
    depurador.inspecionar('Grupos: ', grupos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const salvar = (intervalo: string, valor: string) => {
    depurador.inspecionar('Intervalo para salvar: ', intervalo)
    depurador.inspecionar('Valor: ', valor)
    const indice = configuracoes.findIndex(config => config.key === intervalo)
    if (indice >= 0) {
      alterarItemConfig(intervalo, valor)
      const config = configuracoes.slice(0)
      config[indice].value = valor
      mudarConfiguracoes(config)
    }
  }

  const remover = (intervalo: string) => {
    depurador.inspecionar('Remover: ', intervalo)
    const indice = configuracoes.findIndex(config => config.key === intervalo)
    if (indice >= 0) {
      removerItemConfig(intervalo)
      const config = configuracoes.slice(0)
      config.splice(indice, 1)
      mudarConfiguracoes(config)
    }
  }

  const removerTodas = () => {
    depurador.erro('Removendo todas...')
    mudarMostrarConfirmacao(false)
    limparConfig()
    mudarConfiguracoes([])
  }

  const onRenderDetailsFooter = () => {
    return (
      <>
        <div className={classeContainer}>
          <DefaultButton
            text="Apagar Todas"
            styles={estilosBotaoApagar}
            onClick={() => mudarMostrarConfirmacao(true)}
          />
        </div>
        <AppModalConfirmar
          mostrar={mostrarConfirmacao}
          titulo="Confirmação"
          mensagem="Confirma remoção de todas as suas configurações pessoais?"
          aoCancelar={() => mudarMostrarConfirmacao(false)}
          aoConfirmar={removerTodas}
        />
      </>
    )
  }

  const onRenderRow = (props?: IDetailsRowProps) => {
    if (!props) return null
    const { item, itemIndex } = props
    return item && typeof itemIndex === 'number' && itemIndex > -1 ? (
      <ItemConfiguracoes
        rotulo={item.text}
        intervalo={item.key}
        valor={item.value}
        aoRemover={remover}
        aoSalvar={salvar}
      />
    ) : null
  }

  return (
    <AppCartao titulo="Editar Configurações Pessoais" icone="ColumnOptions">
      {configuracoes.length > 0 ? (
        <DetailsList
          items={configuracoes}
          groups={grupos}
          selectionMode={SelectionMode.none}
          isHeaderVisible={false}
          onRenderDetailsFooter={onRenderDetailsFooter}
          onRenderRow={onRenderRow}
        />
      ) : (
        <h5>Não há configurações salvas.</h5>
      )}
    </AppCartao>
  )
}
