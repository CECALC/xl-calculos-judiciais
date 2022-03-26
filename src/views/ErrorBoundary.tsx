import { ReactNode, Component, ErrorInfo } from 'react'
import { depurador } from '../utils'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    depurador.console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return <h2>Desculpe... um erro ocorreu</h2>
    }

    return this.props.children
  }
}

export default ErrorBoundary
