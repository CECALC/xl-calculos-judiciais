# @cecalc/xl-calculos-judiciais

Este é um suplemento Excel criado pela CECALC (Central de Cálculos da Justiça Federal de São Paulo) para auxiliar na realização de cálculos judiciais.

O suplemento foi escrito em `React`, utilizando a ferramenta CLI [Create React App](https://github.com/facebook/create-react-app) com o template `Fluent UI` criado pela _Microsoft_.

## Scripts disponíveis

No diretório do projeto, você pode executar:

### `npm start`

Executa o suplemento em modo desenvolvimento.<br>
Abra [https://localhost:3000](http://localhost:3000) para ver.

A página recarrega sempre que você faz alterações no código-fonte.<br>
Erros captados pelo linter são reportados no console.

Atenção: a página de testes é executada com o protocolo `https`.<br>
Desse modo, você deve instalar localmente o certificado e a chave criptográfica.<br> 
Para fazer isso, basta executar uma vez, no terminal, o comando `npm run cert:install`.

### `npm run manifest:dev`

O comando gera o manifesto em versão desenvolvimento para efetuar o _sideload_ no Excel.

### `npm run manifest:prod`

O comando gera o manifesto em versão produção.

### `npm run build`

Criar os pacotes de código para produção na pasta `build`.<br>
Esse comando empacota a aplicação inteira, incluindo as dependências e faz otimizações de performance.

Os pacotes são minificados e os nomes dos arquivos incluem _hashes_.<br> 

Em acréscimo, também é gerado o manifesto em modo produção, para ser distribuído.

Ao final do processo de _build_, os pacotes são testados para assegurar compartibilidade com o Internet Explorer 11.<br>
A respeito desse tópico, veja: [Suporte ao Internet Explorer 11](https://docs.microsoft.com/pt-br/office/dev/add-ins/develop/support-ie-11)

Utilizamos `Github Pages` para colocar o suplemento no ar.<br>
Para mais informações, veja a sessão sobre [deployment](https://facebook.github.io/create-react-app/docs/deployment) na documentação do _Create React App_.

## Para aprofundar

Veja a [documentação de Create React App](https://facebook.github.io/create-react-app/docs/getting-started).

E também a [documentação do React](https://reactjs.org/),<br> 
a [documentação do Fluent UI](https://developer.microsoft.com/en-us/fluentui) 
e a [documentação dos suplementos _Office_](https://docs.microsoft.com/pt-br/office/dev/add-ins/).

# Contribuir

Para contribuir voluntariamente com este projeto, entre em contato com admsp-cecalc@trf3.jus.br.
