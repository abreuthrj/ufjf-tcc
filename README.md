## Introdução

A abordagem utiliza o modelo CoRec para a geração automática de mensagens de commit, em conjunto com a base de dados MCMD. A utilização desta base permite que o treinamento seja realizado com diferentes linguagens de programação e que as informações de contexto de cada commit possa ser recuperada uma vez que possuimos o `sha` e o `nome do repositório` para cada commit.

Alguns ajustes foram necessários para que a reprodução do CoRec tivesse sucesso. Por se tratar de uma máquina com uma placa de vídeo mais atual (RTX 3060Ti), foi necessário utilizar drivers e ferramentas mais atuais. A instalação das bibliotecas seguiram os passos fornecidos pelo site https://pytorch.org/get-started/locally/. ![Pytorch Instructions](https://github.com/abreuthrj/ufjf-tcc/blob/master/docs/pytorch.png?raw=true)

Primeiramente, extraímos apenas os N primeiros diffs e mensagens de commit da base de dados, sendo N a quantidade de dados utilizados para o treinamento do CoRec. Esta tomada de decisão visa a reprodutibilidade do treinamento do CoRec pois uma maior quantidade de dados pode ocasionar em erro por falta de recurso da máquina utilizada para o experimento.

Posteriormente, enriquecemos todos os commits presentes no set de testes da base com informações sobre o autor e os arquivos envolvidos no commit utilizando a API do GitHub.

## Dataset

A pasta `data/mcmd` deve conter a base de dados obtida em https://anonymous.4open.science/r/CommitMessageEmpirical. Basta baixar oo arquivo zip filtered_data e extrair na pasta mcmd.

## Scripts

A pasta scripts contém os arquivos necessários para a reprodução do experimento.

O script `preprocess-mcmd-data.ts` copia os diffs e mensagens de commits contidos na pasta `data/mcmd/filtered_data/<LANGUAGE>` limitando a quantidade de commits para que possua a mesma quantidade da base de dados utilizada na reprodução do CoRec (top10000 commits), salvando os diffs e commits limtados na pasta `data/preprocessed/<LANGUAGE>`. O script também une o `sha` e o `nome do repositório` de cada commit em um único arquivo `preprocessed/<LANGUAGE>/<TYPE>.commits.jsonl` que pode ser utilizado em conjunto com a API do GitHub para enriquecimento de informações (Veja o script abaixo `enrich-commit-info.ts`).

O script `enrich-commit-info.ts` percorre os commits contidos em `data/preprocessed/<LANGUAGE>/<TYPE>.commits.jsonl` adicionando cada objeto em uma lista que a cada `<INTERVAL>` milisegundos, enriquece o commit com informações do autor e dos arquivos modificados. A cada enriquecimento, o commit enriquecido é escrito no arquivo `data/enriched/<LANGUAGE>/<TYPE>.enriched.jsonl` e o `sha` do commit é escrito no arquivo `data/enriched/<LANGUAGE>/<TYPE>.processed.txt` para que caso algum problema ocorra durante o enriquecimento (como exaustão da chave de API), o script possa ser executado novamente sem repetir para os commits já enriquecidos.

O script `select-random-commits.ts` seleciona 1K (valor N definido no script) de indices aleatórios da base em `data/enriched/<LANGUAGE>/<TYPE>.enriched.jsonl` e salva no arquivo `data/selected-commits.json`.

O script `enrich-context-commits.ts` percorre o arquivo `selected-commits.json` buscando o commit na base em `data/raw` pela chave `hash` e enriquecendo com informações do contexto.

O script `get-commit-messages.ts` envia para o gpt os primeiros N (definido no script) commits do arquivo de commits selecionados. O script gera três arquivos de saída:

- `test_<DATA>.ref.txt` - Arquivo contendo as mensagens de commits originais, separadas por quebra de linha;
- `test_<DATA>.hyp.txt` - Arquivo contendo as mensagens de commit geradas pelo ChatGPT, separadas por quebra de linha;
- `test_<DATA>.txt` - Arquivo contendo o prompt enviado para o ChatGPT, a mensagem de commit gerada e a mensagem original seguindo um formato mais legível para análise humana.

## Avaliação

A pasta `metrics` contém o script B-Norm obtido em https://anonymous.4open.science/r/CommitMessageEmpirical/metrics/B-Norm.py para a avaliacao das mensagens geradas.

Para a execução do script é necessário invocar o script passando como parametro o arquivo de referência (que contém as mensagens de commit originais) e passando como `stdin` o arquivo de hipótese (contendo as mensagens gerada), em abos as mensagens devem estar separadas por quebra de linha. Exemplo:

```bash
python metrics/B-Norm.py output/test_10-29-20231131.ref.txt < output/test_10-29-20231131.hyp.txt
```
