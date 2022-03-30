import React from 'react'
import { 
  ITheme, 
  mergeStyleSets, 
  getTheme, 
  getFocusStyle, 
  List, 
  Panel,
  Icon, 
  FocusZone, 
  FocusZoneDirection
} from '@fluentui/react'

interface IProps {
  abrir: boolean
  onDismiss: () => void
}

interface IItem {
  rotulo: string
  icone: string
  url: string
}

const itens: IItem[] = [
  {
    rotulo: 'Política de privacidade',
    icone: 'Lock',
    url: 'https://contadoria.github.io/privacidade/'
  },
  { rotulo: 'Termos de uso', icone: 'Contact', url: 'https://contadoria.github.io/uso/' },
  {
    rotulo: 'Reportar um problema',
    icone: 'Bug',
    url: 'https://script.google.com/macros/s/AKfycbwMQVo2G0pvhvq-aadi9LOK8UUYn2eK-36nz7jZVyqTcZ06Ncc/exec'
  },
  { rotulo: 'Tutoriais', icone: 'Education', url: 'https://contadoria.github.io/Tutoriais' }
]

const theme: ITheme = getTheme()
const { palette, fonts } = theme

const classNames = mergeStyleSets({
  celula: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      selectors: {
        '&:hover': { background: palette.neutralLight }
      }
    }
  ],
  icone: {
    marginRight: 10,
    fontSize: fonts.large.fontSize,
    flexShrink: 0
  },
  rotulo: [
    fonts.large,
    {
      flexGrow: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textDecoration: 'none',
      color: palette.neutralDark
    }
  ],
  copyright: [
    fonts.small,
    {
      display: 'flex',
      justifyContent: 'space-between'
    }
  ]
})

const onRenderCell = (item?: IItem): JSX.Element => {
  return (
    <div className={classNames.celula} data-is-focusable={true}>
      <Icon className={classNames.icone} iconName={item?.icone} />
      <a className={classNames.rotulo} href={item?.url} target="_blank" rel="noreferrer">
        {item?.rotulo}
      </a>
    </div>
  )
}

const onRenderFooterContent = (): JSX.Element => {
  return (
    <div className={classNames.copyright}>
      <span>© {new Date().getFullYear()} CECALC</span>
      <span>admsp-cecalc@trf3.jus.br</span>
    </div>
  )
}

export default function PainelLateral({ abrir, onDismiss }: IProps) {
  return (
    <Panel
      isLightDismiss
      isOpen={abrir}
      onDismiss={onDismiss}
      closeButtonAriaLabel="Fechar"
      headerText="Ajuda"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}      
    >
      <FocusZone direction={FocusZoneDirection.vertical}>
        <List items={itens} onRenderCell={onRenderCell} />
      </FocusZone>
    </Panel>
  )
}
