import React, { useState } from 'react'
import { 
  mergeStyles, 
  IStackTokens, 
  Stack, 
  DefaultButton, 
  PrimaryButton,
  IChoiceGroupOption 
} from '@fluentui/react'
import { AppCartao, AppModalSelecionarMultiplo } from '../../components'
import {
  obterDadosConfig,
  obterOpcoesDisponiveis,
  persistirDados,
  recuperarDados,
  TIPO_PERSISTENCIA
} from '../../services'

const stackTokens: IStackTokens = { childrenGap: 40 }

const icone = {
  salvar: 'Save',
  recuperar: 'Download',
  processando: 'Sync'
}

const classeCarregando = mergeStyles({
  selectors: {
    svg: {
      animationName: 'rotacao',
      animationDuration: '1s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear'
    }
  }
})

enum MODO {
  SALVAR,
  RECUPERAR
}

interface IModal {
  modo: MODO
  abrir: boolean
  titulo: string
  mensagem: string
  opcoes: IChoiceGroupOption[]
}

export default function ConfiguracoesPessoais() {
  const [salvando, mudarSalvando] = useState<boolean>(false)
  const [recuperando, mudarRecuperando] = useState<boolean>(false)
  const [modal, mudarModal] = useState<IModal>({
    modo: MODO.SALVAR,
    abrir: false,
    titulo: 'Selecionar',
    mensagem: '',
    opcoes: []
  })

  const salvar = async (nomes: string[]) => {
    mudarModal({ ...modal, abrir: false })
    mudarSalvando(true)
    await persistirDados(TIPO_PERSISTENCIA.CONFIG, nomes)
    mudarSalvando(false)
  }

  const recuperar = async (nomes: string[]) => {
    mudarModal({ ...modal, abrir: false })
    mudarRecuperando(true)
    await recuperarDados(TIPO_PERSISTENCIA.CONFIG, nomes)
    mudarRecuperando(false)
  }

  const cancelar = () => mudarModal({ ...modal, abrir: false })

  const selecionarParaSalvar = async () => {
    const opcoes = await obterOpcoesDisponiveis()
    mudarModal({
      ...modal,
      modo: MODO.SALVAR,
      titulo: 'Selecionar',
      mensagem: 'Selecione os dados que deseja salvar em suas configurações pessoais.',
      opcoes: opcoes,
      abrir: true
    })
  }

  const selecionarParaRecuperar = async () => {
    const disponiveis = await obterOpcoesDisponiveis()
    const dadosConfig = obterDadosConfig()
    const opcoes = disponiveis.filter(opcao => dadosConfig.find(dado => dado.key === opcao.key))
    mudarModal({
      ...modal,
      modo: MODO.RECUPERAR,
      titulo: 'Selecionar',
      mensagem: 'Selecione os dados que deseja recuperar de suas configurações pessoais.',
      opcoes: opcoes,
      abrir: true
    })
  }

  return (
    <>
      <AppCartao titulo="Configurações Pessoais" icone="ColumnOptions">
        <Stack horizontal tokens={stackTokens} horizontalAlign="center">
          <PrimaryButton
            text="Salvar"
            iconProps={{
              iconName: salvando ? icone.processando : icone.salvar,
              className: salvando ? classeCarregando : ''
            }}
            onClick={selecionarParaSalvar}
            allowDisabledFocus
            disabled={salvando || recuperando}
          />
          <DefaultButton
            text="Recuperar"
            iconProps={{
              iconName: recuperando ? icone.processando : icone.recuperar,
              className: recuperando ? classeCarregando : ''
            }}
            onClick={selecionarParaRecuperar}
            allowDisabledFocus
            disabled={recuperando || salvando}
          />
        </Stack>
      </AppCartao>
      <AppModalSelecionarMultiplo
        mostrar={modal.abrir}
        titulo={modal.titulo}
        mensagem={modal.mensagem}
        opcoes={modal.opcoes}
        aoSalvar={modal.modo === MODO.SALVAR ? salvar : recuperar}
        aoDispensar={cancelar}
      />
    </>
  )
}
