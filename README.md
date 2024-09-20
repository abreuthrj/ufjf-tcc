## Introdução

A abordagem utiliza o modelo CoRec para a geração automática de mensagens de commit, em conjunto com a base de dados MCMD. A utilização desta base permite que o treinamento seja realizado com diferentes linguagens de programação e que as informações de contexto de cada commit possa ser recuperada uma vez que possuimos o **SHA** e o **nome do repositório** para cada commit.

Alguns ajustes foram necessários para que a reprodução do CoRec tivesse sucesso. Por se tratar de uma máquina com uma placa de vídeo mais atual (RTX 3060Ti), foi necessário utilizar drivers e ferramentas mais atuais. A instalação das bibliotecas seguiram os passos fornecidos pelo site [Start Locally | PyTorch](https://pytorch.org/get-started/locally/).

![Pytorch Instructions](https://github.com/abreuthrj/ufjf-tcc/blob/master/docs/pytorch.png?raw=true)

Posteriormente, enriquecemos todos os commits presentes no set de testes da base com informações sobre o autor e os arquivos envolvidos no commit utilizando a API do GitHub.

## Dataset

Para configurar a base de dados, você deve descarregar a base de dados MCMD (obtida em https://anonymous.4open.science/r/CommitMessageEmpirical) na pasta `data/mcmd`. Basta baixar oo arquivo zip filtered_data e extrair no diretório.

## Scripts

A pasta scripts contém os arquivos necessários para a reprodução do experimento.

A execução de todos os scripts seguem o seguinte formato:

```bash
npx ts-node scripts/<NOME_DO_SCRIPT>
```

### Script de pré-processamento dos dados

O script `preprocess-mcmd-data.ts` copia os diffs e mensagens de commits contidos na pasta `data/mcmd/filtered_data/<LANGUAGE>` limitando a quantidade de commits para que possua a mesma quantidade da base de dados utilizada na reprodução do CoRec (top10000 commits), salvando os diffs e commits limtados na pasta `data/preprocessed/<LANGUAGE>`.

O script também une o **SHA** e o **nome do repositório** de cada commit em um único arquivo `preprocessed/<LANGUAGE>/<TYPE>.commits.jsonl` que pode ser utilizado em conjunto com a API do GitHub para enriquecimento de informações (Veja o script abaixo `enrich-commit-info.ts`).

### Script de enriquecimento das informações dos commits

O script `enrich-commit-info.ts` percorre os commits contidos em `data/preprocessed/<LANGUAGE>/<TYPE>.commits.jsonl` adicionando cada objeto em uma lista que a cada `<INTERVAL>` milisegundos, enriquece o commit com informações do autor e dos arquivos modificados.

A cada iteração, o commit enriquecido é escrito no arquivo `data/enriched/<LANGUAGE>/<TYPE>.enriched.jsonl` e o **SHA** do commit é escrito no arquivo `data/enriched/<LANGUAGE>/<TYPE>.processed.txt` para que caso algum problema ocorra durante o enriquecimento (como exaustão da chave de API), o script possa ser executado novamente sem repetir para os commits já enriquecidos.

### Script de seleção de commits

Para resolver o problema dos créditos limitados na plataforma do GitHub, foi desenvolvido um script que seleciona aleatoriamente os commits enriquecidos para utilizar no experimento.

O script `select-random-commits.ts` seleciona 1K (valor N definido no script) de indices aleatórios da base em `data/enriched/<LANGUAGE>/<TYPE>.enriched.jsonl` e salva no arquivo `data/selected-commits.json`.

### Script de enriquecimento de contexto dos commits

O script `enrich-context-commits.ts` percorre o arquivo `selected-commits.json` buscando o commit na base em `data/raw` pela chave `hash` e enriquecendo com informações do contexto.

A Figura a seguir ilustra como funciona o enriquecimento de contexto dos commits:

![Enriquecimento dos Commits](https://github.com/abreuthrj/ufjf-tcc/blob/master/docs/enrich-reduced-dataset.png?raw=true)

### Script de geração das mensagens de commit com o GPT

O script `get-commit-messages.ts` envia para o gpt os primeiros N (definido no script) commits do arquivo de commits selecionados. O script gera três arquivos de saída:

- `test.ref.msg.txt` - Arquivo contendo as mensagens de commits originais, separadas por quebra de linha;
- `test.<STRATEGY>.msg.txt` - Arquivo contendo as mensagens de commit geradas pelo ChatGPT de acordo com a estratégia `<STRATEGY>`, separadas por quebra de linha;
- `test.msg.txt` - Arquivo contendo as mensagens de commit geradas pelo ChatGPT sem fornecimento de contexto, separadas por quebra de linha;
- `test.info.txt` - Arquivo contendo o prompt enviado para o ChatGPT, a mensagem de commit gerada e a mensagem original seguindo um formato mais legível para análise qualitativa humana.
- `test.info.txt` - Arquivo contendo o prompt enviado para o ChatGPT, a mensagem de commit gerada e a mensagem original seguindo um formato mais legível para análise qualitativa humana.

## Avaliação

### B-Norm

A pasta **metrics** contém o script `B-Norm.py` (obtido em https://anonymous.4open.science/r/CommitMessageEmpirical/metrics/B-Norm.py) para avaliar as mensagens geradas de acordo com o B-Norm.

Para a execução do script é necessário invocar o script passando como parametro o arquivo de referência (que contém as mensagens de commit originais) e passando como `stdin` o arquivo de hipótese contendo as mensagens gerada, em ambos as mensagens devem estar separadas por quebra de linha. Exemplo:

```bash
python3 metrics/B-Norm.py output/gpt/javascript/test.ref.msg.txt < output/gpt/javascript/test.msg.txt
```

### BLEU

A pasta **metrics** contém o script `multi-bleu.perl` (obtido a partir do projeto CoRec) para avaliar as mensagens geradas de acordo com o B-Norm.

Para a execução do script é necessário invocar o script passando como parametro o arquivo de referência (que contém as mensagens de commit originais) e passando como `stdin` o arquivo de hipótese contendo as mensagens gerada, em ambos as mensagens devem estar separadas por quebra de linha. Exemplo:

```bash
perl metrics/multi-bleu.perl output/gpt/javascript/test.ref.msg.txt < output/gpt/javascript/test.msg.txt
```
