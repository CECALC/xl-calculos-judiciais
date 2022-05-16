import { depurador } from "../utils"

// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function fallback(text: string) {
  var textArea = document.createElement('textarea')
  textArea.value = text
  
  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'bem sucedida!' : 'falhou...'
    depurador.console.log('Fallback: Cópia para a área de transferência ' + msg);
  } catch (e) {
    depurador.console.error(e);
  }

  document.body.removeChild(textArea);
}

export function copiarParaAreaDeTransferencia(text: string) {
  if (!navigator.clipboard) {
    fallback(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    depurador.console.log('Async: Cópia para a área de transferência bem sucedida!');
  }, function(e) {
    console.error('Async: Não foi possível copiar para a área de transferência: ', e);
  });
}
