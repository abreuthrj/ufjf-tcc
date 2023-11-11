## Dataset

A pasta `data/mcmd` contém a base de dados obtida em https://anonymous.4open.science/r/CommitMessageEmpirical. Basta baixar oo arquivo zip filtered_data e extrair na pasta mcmd.

## Scripts

A pasta scripts contém os arquivos necessários para a reprodução do experimento.

O script `preprocess-mcmd-data.ts` separa, para cada arquivo `.jsonl` contido na pasta `data/mcmd/$LANGUAGE`, os diffs e mensagens de commit em arquivos separados na pasta `data/mcmd/$LANGUAGE/processed`.

O script `select-random-commits.ts` seleciona N (definido no script) indices aleatórios da base em `data/raw` e salva no arquivo `data/selected-commits.json`.

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
