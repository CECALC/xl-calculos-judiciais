import React, { Component } from 'react'
import { 
  IStackTokens, 
  Stack, 
  DefaultButton, 
  PrimaryButton, 
  IChoiceGroupOption, 
  mergeStyles 
} from '@fluentui/react'
import { AnalisadorDeTexto, IOpcao } from '@cecalc/analisador-de-texto'
import { debounce } from '@cecalc/utils'
import { AppCartao, AppModalSelecionarUnico } from '../../components'
import { obterItensNomeados } from '../../services'
import { depurador } from '../../utils'
import CaixaDeTexto from './CaixaDeTexto'
import { preencherIntervalos } from './auxiliares'

const stackTokens: IStackTokens = { childrenGap: 40 }

const icone = {
  preencher: 'LightningBolt',
  apagar: 'EraseTool',
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

interface IState {
  carregado: boolean
  identificado: boolean
  preenchendo: boolean
  titulo: string
  descricao: string[][]
  analisador: AnalisadorDeTexto | null
  opcoes: IOpcao[]
  texto: string
  modal: {
    titulo: string
    mensagem: string
    opcoes: IChoiceGroupOption[]
    abrir: boolean
  }
}

export default class PreenchimentoAutomatico extends Component {
  state: IState

  constructor(props: Record<string, unknown>) {
    super(props)
    this.state = {
      carregado: false,
      identificado: false,
      preenchendo: false,
      titulo: 'Preenchimento Automático',
      descricao: [],
      analisador: null,
      opcoes: [],
      texto: '',
      modal: {
        titulo: 'Opções',
        mensagem: 'Interpretar dados como:',
        opcoes: [],
        abrir: false
      }
    }
    this.atualizarTexto = this.atualizarTexto.bind(this)
    this.verificar = debounce(this.verificar.bind(this) as (...args: unknown[]) => unknown, 300)
    this.selecionar = this.selecionar.bind(this)
    this.apagar = this.apagar.bind(this)
    this.preencher = this.preencher.bind(this)
    this.cancelar = this.cancelar.bind(this)
  }

  atualizarTexto(texto: string) {
    this.setState({ texto })
    this.verificar(texto)
  }

  verificar(documento: string) {
    if (!documento.length) return
    this.setState({
      analisador: new AnalisadorDeTexto(documento),
      carregado: true
    })
    if (this.state.analisador && this.state.analisador.identificado) {
      this.setState({
        titulo: this.state.analisador.obterNome(),
        descricao: this.state.analisador.obterResumo(),
        identificado: true
      })
      return
    }
    this.setState({
      titulo: 'Padrão Desconhecido',
      descricao: [['', 'Texto não identificado']],
      identificado: false
    })
  }

  async selecionar() {
    if (!this.state.analisador) return
    this.setState({ preenchendo: true })
    const intervalos = (await obterItensNomeados()).map(item => item.name)
    const opcoes = this.state.analisador.obterOpcoes(intervalos)
    const modal = { ...this.state.modal }
    modal.opcoes = opcoes.map(opcao => ({
      key: opcao.nome,
      text: opcao.nome + (opcao.sobreposicao ? ' (sobrepor)' : '')
    }))
    modal.abrir = true
    this.setState({
      opcoes: opcoes,
      modal
    })
  }

  async preencher(nome: string) {
    if (!this.state.analisador) return
    const modal = { ...this.state.modal }
    modal.abrir = false
    this.setState({ preenchendo: true, modal })
    depurador.inspecionar('Opção selecionada: ', nome)
    const opcao = this.state.opcoes.find(opcao => opcao.nome === nome)
    if (opcao) await preencherIntervalos(this.state.analisador.obterNome(), opcao)
    this.setState({ preenchendo: false })
  }

  cancelar() {
    const modal = { ...this.state.modal }
    modal.abrir = false
    this.setState({
      preenchendo: false,
      modal
    })
  }

  apagar() {
    const modal = { ...this.state.modal }
    modal.opcoes = []
    modal.abrir = false

    this.setState({
      carregado: false,
      identificado: false,
      preenchendo: false,
      titulo: 'Preenchimento Automático',
      descricao: [],
      analisador: null,
      opcoes: [],
      texto: '',
      modal
    })
  }

  render() {
    return (
      <>
        <AppCartao
          titulo={this.state.titulo}
          icone="AutoEnhanceOn"
          ativo={this.state.carregado && this.state.identificado}
          erro={this.state.carregado && !this.state.identificado}
        >
          <Stack>
            <CaixaDeTexto
              carregado={this.state.carregado}
              descricao={this.state.descricao}
              valor={this.state.texto}
              onChange={this.atualizarTexto}
            />
            <Stack horizontal tokens={stackTokens} horizontalAlign="center">
              <PrimaryButton
                text="Preencher"
                iconProps={{
                  iconName: this.state.preenchendo ? icone.processando : icone.preencher,
                  className: this.state.preenchendo ? classeCarregando : ''
                }}
                onClick={this.selecionar}
                allowDisabledFocus
                disabled={
                  !this.state.carregado || this.state.preenchendo || !this.state.identificado
                }
              />
              <DefaultButton
                text="Apagar"
                iconProps={{
                  iconName: icone.apagar
                }}
                onClick={this.apagar}
                allowDisabledFocus
                disabled={!this.state.carregado || this.state.preenchendo}
              />
            </Stack>
          </Stack>
        </AppCartao>
        <AppModalSelecionarUnico
          mostrar={this.state.modal.abrir}
          titulo={this.state.modal.titulo}
          mensagem={this.state.modal.mensagem}
          opcoes={this.state.modal.opcoes}
          aoSalvar={this.preencher}
          aoDispensar={this.cancelar}
        />
      </>
    )
  }
}
