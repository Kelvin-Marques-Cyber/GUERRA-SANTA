#!/usr/bin/env python3
"""Exporta as dez pranchas completas, sem cortes e sem capa adicional."""
import json
import textwrap
from io import BytesIO
from pathlib import Path

from PIL import Image
from reportlab import rl_config
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'chapters/capitulo-2.json').read_text())
output = ROOT / 'downloads/A_Guerra_Santa_Capitulo_II.pdf'
output.parent.mkdir(exist_ok=True)
font_path = Path('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf')
font_name = 'Times-Roman'
if font_path.exists():
    pdfmetrics.registerFont(TTFont('ChapterSerif', str(font_path)))
    font_name = 'ChapterSerif'
# Evita a expansão ASCII85 dos fluxos binários.
rl_config.useA85 = False
doc = canvas.Canvas(str(output), pageCompression=1)
doc.setTitle('A Guerra Santa - Capítulo II - 10 pranchas')
doc.setAuthor('John Bunyan - adaptação visual em português brasileiro')
doc.setSubject('Texto conferido no PDF fornecido pelo usuário, tradução de Santiago Escuain, páginas 8 a 13; nomes em PT-BR conforme lista editorial.')
doc.setCreator('GUERRA-SANTA')
for page in data['pages']:
    path = ROOT / f"assets/capitulo-2/prancha-{page['number']:02d}.png"
    with Image.open(path) as im:
        width, height = im.size
    # Resolução original preservada; os PNGs do site continuam sem perdas.
    pw, ph = width / 2, height / 2
    doc.setPageSize((pw, ph))
    # JPEG de alta qualidade apenas na exportação para reduzir o tamanho do PDF.
    image_data = BytesIO()
    with Image.open(path) as image:
        image.save(image_data, format='JPEG', quality=92, subsampling=0, optimize=True)
    image_data.seek(0)
    doc.drawImage(ImageReader(image_data), 0, 0, width=pw, height=ph)
    bookmark = f"prancha-{page['number']:02d}"
    doc.bookmarkPage(bookmark)
    doc.addOutlineEntry(f"{page['number']:02d} - {page['title']}", bookmark, level=0)
    # Camada pesquisável das legendas; a aparência é a prancha integral.
    text = doc.beginText(24, ph - 24)
    text.setFont(font_name, 9)
    text.setLeading(12)
    text.setTextRenderMode(3)
    paragraphs = [f"Prancha {page['number']:02d} - {page['title']}"] + [q['text'] for q in page['panels']]
    for paragraph in paragraphs:
        for line in textwrap.wrap(paragraph, width=max(40, int((pw - 48) / 5))):
            text.textLine(line)
        text.textLine('')
    doc.drawText(text)
    doc.showPage()
doc.save()
print(f'{output.name}: {len(data["pages"])} páginas, {output.stat().st_size / 1048576:.1f} MiB')
