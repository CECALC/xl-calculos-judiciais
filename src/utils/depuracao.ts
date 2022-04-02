import { Depurador } from '@cecalc/utils'

const modoDesenvolvimento = process.env.NODE_ENV !== 'production'

const Singleton = (() => {
  let instancia: Depurador

  function obterInstancia() {
    return instancia ? instancia : new Depurador(modoDesenvolvimento)
  }

  return { obterInstancia }
})()

export const depurador = Singleton.obterInstancia()
