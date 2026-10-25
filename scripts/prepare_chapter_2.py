#!/usr/bin/env python3
"""Prepara o capítulo II, seu roteiro e a lista única de nomes em PT-BR."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'chapters/capitulo-2.json').read_text())
names = json.loads((ROOT / 'chapters/nomes-canonicos.json').read_text())
assert len(data['pages']) == 10
manifest = {key: data[key] for key in ('id', 'title', 'subtitle', 'edition', 'source', 'translation', 'referencePdf')}
manifest['pages'] = []
script = ['# A Guerra Santa — Capítulo II da HQ', '', '## Texto de referência', '',
          data['edition'], '', data['translation'], '',
          '**PDF enviado:** La guerra santa, tradução do inglês por Santiago Escuain, 172 páginas. '
          'Trecho utilizado: páginas físicas 8 a 13. A divisão numérica desse PDF difere dos capítulos da HQ; '
          'a seleção continua a conquista já narrada no capítulo I do repositório.', '',
          '**Conferência complementar:** original inglês de John Bunyan (1682), em domínio público, '
          'divisão editorial de George Offor, capítulo II. ' + data['source'], '',
          data['terminologyNote'], '',
          'São dez pranchas narrativas, sem capa adicional. As pranchas 07 e 10 são imagens únicas '
          'de página inteira; as demais usam sequências de quadros. As legendas condensam a prosa '
          'sem apresentar o capítulo como transcrição integral.', '',
          '## Roteiro das dez pranchas', '']
source_pages = [p['sourcePdfPages'] for p in data['pages']]
for page, pdf_pages in zip(data['pages'], source_pages):
    image_path = f"assets/capitulo-2/prancha-{page['number']:02d}.png"
    with Image.open(ROOT / image_path) as im:
        width, height = im.size
    manifest['pages'].append({
        'title': page['title'], 'subtitle': data['subtitle'],
        'description': page['description'], 'kind': page['kind'],
        'image': image_path + '?v=diagrama-2', 'width': width, 'height': height,
        'aspect': round(width / height, 4), 'layout': page.get('layout', 'grid'),
        'panelCount': page['panelCount'], 'panels': [{'text': panel['text']} for panel in page['panels']], 'sourcePdfPages': pdf_pages
    })
    script += [f"### {page['number']:02d} — {page['title']}", '',
               '**Composição:** ' + ('imagem única de página inteira' if page.get('layout') == 'splash' else str(page['panelCount']) + ' quadros de tamanhos variados') + '.', '',
               '**Páginas no PDF:** ' + ', '.join(map(str, pdf_pages)) + '.', '',
               f"**Início no original inglês:** {page['sourceStart']}", '',
               f"**Fim no original inglês:** {page['sourceEnd']}", '']
    for i, panel in enumerate(page['panels'], 1):
        script += [f"{i}. {panel['text']}", '']
script += ['## Nomes fixados em português brasileiro', '', names['note'], '',
           '| Original inglês | PDF em espanhol | Nome nesta HQ |', '| --- | --- | --- |']
script += [f"| {n['english']} | {n['spanishPdf']} | {n['ptBR']} |" for n in names['characters']]
script += ['', '## Reprodução da arte', '',
           'As gravuras existentes foram recompostas sem regenerar os personagens ou cenários. '
           'As instruções finais de edição, com todas as legendas, estão em `chapters/prompts/`. '
           'A direção de arte e as descrições das cenas ficam em `capitulo-2.json`.', '']
(ROOT / 'chapters/capitulo-2.js').write_text('/* Gerado por scripts/prepare_chapter_2.py. */\nwindow.__CHAPTER_2__ = ' + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n')
(ROOT / 'chapters/capitulo-2-roteiro.md').write_text('\n'.join(script))
print(f"{len(manifest['pages'])} pranchas; 40 legendas; nomes fixados pela lista editorial.")
