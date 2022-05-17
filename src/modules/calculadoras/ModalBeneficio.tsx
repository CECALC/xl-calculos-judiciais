import React from 'react'
import { 
  DefaultButton, 
  mergeStyleSets,
  Icon,
  Modal,
  getTheme,
  FontWeights,
  ContextualMenu,
  IconButton,
  IButtonStyles,
  FontSizes
} from '@fluentui/react'
import { IDadosBeneficio, IParametrosCalculo } from './auxiliares'
import { tipoBooleano, tipoData, tipoNumero } from '@cecalc/utils';

const theme = getTheme();
const styles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch'
  },
  header: {
    flex: '1 1 auto',
    borderTop: `4px solid ${theme.palette.themePrimary}`,
    color: theme.palette.neutralPrimary,
    display: 'flex',
    alignItems: 'center',
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.large,
    padding: '12px 12px 14px 24px'
  },
  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px 24px',
    overflow: 'hidden'
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '0 24px 24px 24px 24px'
  },
  sessao: {
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.medium,
    margin: '12px 0',
    paddingTop: '12px',
    borderTop: '1px solid lightgray'
  },
  visualizador: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    paddingLeft: '12px'
  },
  visualizadorLinha: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  },
  visualizadorChave: {
    fontWeight: FontWeights.semibold
  },
  tabelaContainer: {
    height: '200px',
    overflowY: 'scroll'
  },
  tabela: {
    width: '100%',
    border: '1px solid lightgray',
    borderCollapse: 'collapse'
  },
  tabelaLinha: {
    border: '1px solid lightgray',
    textAlign: 'center'
  },
  tabelaLinhaDestacada: {
    border: '1px solid lightgray',
    textAlign: 'center',
    backgroundColor: theme.palette.yellowLight
  },
  tabelaCompetencia: {
    border: '1px solid lightgray',
    textAlign: 'center'
  },
  tabelaCelula: {
    border: '1px solid lightgray',
    textAlign: 'right'
  }
})

const dicionario: Record<string, string> = {
  dib: 'DIB',
  rmi: 'RMI',
  percentualMinimo: 'Percentual mínimo',
  calcularAbono: 'Calcular abono',
  dataAtualizacao: 'Data da atualização',
  indiceReposicaoTeto: 'Índice de reposição',
  equivalenciaSalarial: 'Equivalência salarial'
}

const iconButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px'
  },
  rootHovered: {
    color: theme.palette.neutralDark
  }
}

const converterParaString = (o: any) => {
  if (tipoData(o)) return o.toLocaleDateString()
  if (tipoBooleano(o)) return o ? 'Sim' : 'Não'
  if (tipoNumero(o)) return o.toFixed(2)
  return o
}

function VisualizadorPropriedades({ objeto }: { objeto?: { [key: string]: any } }){
  if (!objeto) return <></>
  const chaves = Object.keys(objeto)
  return (
    <div className={styles.visualizador}>
      {chaves.map((chave, indice) => {
        return (
          <div className={styles.visualizadorLinha} key={`${chave}-${indice}`}>
            <span className={styles.visualizadorChave}>{dicionario[chave] || chave}: </span><span>{converterParaString(objeto[chave]) || '-'}</span>
          </div>
        )
      })}
    </div>
  )
}

function TabelaResultado({ resultado }: { resultado: [Date, number, number][]}){
  if (!Array.isArray(resultado) || !resultado.length) return <span>Algo saiu errado... Resultado não disponível</span>
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <th className={styles.tabelaLinha}>Competência</th>
          <th className={styles.tabelaLinha}>Renda</th>
          <th className={styles.tabelaLinha}>Abono</th>
        </thead>
        <tbody>
          {resultado.filter(linha => linha[1] !== 0).map((linha, indice) => {
            return (
              <tr className={linha[2] === 0 ? styles.tabelaLinha : styles.tabelaLinhaDestacada} key={`linha-${indice}`}>
                {linha.map((celula, coluna) => {
                  if (coluna === 0) {
                    return <td className={styles.tabelaCompetencia} key={'celula-0'}>{(celula as Date).toLocaleDateString()}</td>
                  }
                  return <td className={styles.tabelaCelula} key={`celula-${coluna}`}>{(celula as number).toFixed(2)}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface IProps {
  mostrar: boolean
  originario: Partial<IDadosBeneficio>
  parametros: IParametrosCalculo
  resultado: [Date, number, number][]
  derivado?: Partial<IDadosBeneficio>
  aoDispensar?: () => void
}

export default function ModalBeneficio({
  mostrar,
  originario,
  parametros,
  resultado,
  derivado,
  aoDispensar
}: IProps) {

  return (
    <Modal
      isOpen={mostrar}
      onDismiss={aoDispensar}
      isBlocking={false}
      containerClassName={styles.container}
      dragOptions={{ moveMenuItemText: 'Move', closeMenuItemText: 'Close', menu: ContextualMenu, keepInBounds: true }}
    >
      <div className={styles.header}>
        <Icon iconName='Calculator' style={{ marginRight: 5, height: 18, fontSize: 18 }} />
        <span>Evolução Benefício</span>
        <IconButton
          styles={iconButtonStyles}
          iconProps={{ iconName: 'Cancel' }}
          ariaLabel='Fechar'
          onClick={aoDispensar}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.sessao}>Benefício Originário</div>
        <VisualizadorPropriedades objeto={originario} />
        {derivado ? 
          (
            <>
              <div className={styles.sessao}>Benefício Derivado</div>
              <VisualizadorPropriedades objeto={derivado} />
            </>
          )
          : 
          ''
        }
        <div className={styles.sessao}>Parâmetros de Cálculo</div>
        <VisualizadorPropriedades objeto={parametros} />
        <div className={styles.sessao}>Resultado</div>
        <TabelaResultado resultado={resultado} />

      </div>
      <div className={styles.footer}>
        <DefaultButton text='Fechar' onClick={aoDispensar} />
      </div>
    </Modal>
  )
}
