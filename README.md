# A Guerra Santa — John Bunyan em quadrinhos

HQ em português brasileiro, com gravuras clássicas e leitor estático para GitHub Pages.

- Capítulo I: oito pranchas da edição existente.
- Capítulo II: dez pranchas, com **3, 5, 2, 4, 5, 5, 1, 5, 3 e 1 quadros**, nessa ordem. As pranchas 07 e 10 são imagens únicas.

A revisão reaproveita as gravuras existentes, redistribui os quadros em ordem narrativa e substitui as legendas por texto vetorial. Personagens e cenários não foram regenerados. Os nomes usados na HQ são **Diabolus**, **Sr. Prefeito**, **Sr. Registrador** e **Sr. Afeto**, sem nomes alternativos para esses personagens. Esquece-o-Bem assume posteriormente o cargo de registrador.

O capítulo II continua a conquista narrada no capítulo I. A sequência foi conferida no PDF fornecido pelo usuário, *La guerra santa*, tradução de Santiago Escuain, páginas físicas 8–13, e no original inglês de Bunyan. A divisão numérica desse PDF difere da divisão em capítulos da HQ. O trecho começa na ocupação do castelo e termina nas três fortalezas.

Abra `index.html` ou publique a raiz no GitHub Pages. Links diretos: `#capitulo-1/prancha-1` e `#capitulo-2/prancha-1`. Há navegação por teclado e toque, leitura contínua, zoom, impressão, transcrição e progresso por capítulo.

- [Roteiro e referências por prancha](chapters/capitulo-2-roteiro.md)
- [Nomenclatura](chapters/nomes-canonicos.json)
- [Composição e textos](chapters/capitulo-2.json)
- [Legendas das dez pranchas](chapters/prompts/)
- [Capítulo II em PDF](downloads/A_Guerra_Santa_Capitulo_II.pdf)
- [Original inglês em domínio público](https://biblehub.com/library/bunyan/the_works_of_john_bunyan_volumes_1-3/the_holy_war.htm)

Para reproduzir a montagem e o PDF: `python3 scripts/build_chapter_2_pdf.py`. Requer Pillow, ReportLab, PyMuPDF e o histórico Git com o commit de origem indicado no script. Para atualizar o leitor e a transcrição: `python3 scripts/prepare_chapter_2.py`.
