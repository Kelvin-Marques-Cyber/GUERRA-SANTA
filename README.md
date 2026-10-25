# A Guerra Santa — John Bunyan em quadrinhos

Leitor estático em português brasileiro, com arte inspirada na gravura clássica.

- Capítulo I: a cidade de Alma Humana, oito pranchas da edição existente.
- Capítulo II: o domínio de Diábolo, dez pranchas novas. As pranchas 07 e 10 têm uma única imagem de página inteira; as demais usam quadros.

Abra `index.html` ou publique a raiz no GitHub Pages. Não exige instalação, compilação nem serviços externos. Funciona também por arquivo local, mantendo as pastas ao lado do HTML.

Links diretos: `#capitulo-1/prancha-1` e `#capitulo-2/prancha-1`. O leitor abre no capítulo II e oferece navegação por teclado e toque, leitura contínua, zoom, impressão, transcrição das legendas e progresso por capítulo.

## Conferência do capítulo II

A sequência continua a queda já narrada no primeiro capítulo da HQ. Foi conferida nas páginas físicas 8 a 13 do PDF fornecido pelo usuário, *La guerra santa*, tradução espanhola de Santiago Escuain, e no original inglês de Bunyan. A divisão dos trechos numerados desse PDF difere da divisão em capítulos desta HQ. O trecho começa com a tomada do castelo e termina com as três fortalezas.

Todas as legendas estão em PT-BR. Os nomes fornecidos pelo usuário são a norma editorial, inclusive **Má Pausa**, **Diábolo**, **Vontade Seja Feita**, **Sr. Registrador**, **Sr. Consciência**, **Afeto-Vil** e **Luxúria-Carnal**. As equivalências restantes foram conferidas no PDF; não se atribui a lista inteira a uma edição PT-BR publicada que não tenha sido fornecida.

Lorde Prefeito e Lorde Entendimento são o mesmo personagem. Sr. Registrador e Sr. Consciência são o mesmo personagem. Sr. Afeto e Afeto-Vil são o mesmo personagem. Esquece-o-Bem é quem assume depois o cargo de registrador.

- [Roteiro, fonte por prancha e equivalências](chapters/capitulo-2-roteiro.md)
- [Lista única de nomes](chapters/nomes-canonicos.json)
- [Dados editoriais e cenas](chapters/capitulo-2.json)
- [Prompts finais das dez imagens](chapters/prompts/)
- [Capítulo II em PDF](downloads/A_Guerra_Santa_Capitulo_II.pdf)
- [Original inglês em domínio público](https://biblehub.com/library/bunyan/the_works_of_john_bunyan_volumes_1-3/the_holy_war.htm)

As imagens foram produzidas e corrigidas com o gerador integrado de imagens. Os arquivos originais do capítulo I permanecem incorporados no HTML; as imagens do capítulo II estão em `assets/capitulo-2/`.

Para atualizar o leitor após editar o roteiro, execute `python3 scripts/prepare_chapter_2.py`. O script de exportação do PDF está em `scripts/build_chapter_2_pdf.py`.
