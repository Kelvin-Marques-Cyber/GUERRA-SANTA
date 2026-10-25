#!/usr/bin/env python3
"""Diagrama gravuras existentes e aplica as legendas como texto vetorial.
As fontes vêm do commit anterior; os desenhos não são regenerados.
"""
import json
import subprocess
from io import BytesIO
from pathlib import Path
from PIL import Image
from reportlab import rl_config
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
SOURCE_COMMIT = '88f507d0acfd74cd1122f691cd85246d9a1f0322'
INK, PAPER = HexColor('#181714'), HexColor('#f5f1e7')
WIDTH, MARGIN, GUTTER, HEADER = 1448, 22, 18, 98

def wrap(text, width, size):
    lines, line = [], ''
    for word in text.split():
        candidate = f'{line} {word}'.strip()
        if line and pdfmetrics.stringWidth(candidate, 'Times-Roman', size) > width:
            lines.append(line)
            line = word
        else:
            line = candidate
    return lines + ([line] if line else [])

def source_images():
    result = {}
    for number in range(1, 11):
        path = f'assets/capitulo-2/prancha-{number:02d}.png'
        raw = subprocess.check_output(['git', 'show', f'{SOURCE_COMMIT}:{path}'], cwd=ROOT)
        image = Image.open(BytesIO(raw)).convert('RGB')
        encoded = BytesIO()
        image.save(encoded, format='JPEG', quality=92, subsampling=0, optimize=True)
        encoded.seek(0)
        result[number] = (ImageReader(encoded), image.size)
    return result

def draw_crop(doc, sources, number, box, x, top, width, height):
    source, (sw, sh) = sources[number]
    x0, y0, x1, y1 = box
    scale = width / (x1 - x0)
    doc.saveState()
    clip = doc.beginPath()
    clip.rect(x, top - height, width, height)
    doc.clipPath(clip, stroke=0, fill=0)
    doc.drawImage(source, x - x0 * scale, top - (sh - y0) * scale,
                  width=sw * scale, height=sh * scale)
    doc.restoreState()

def panel_metrics(panel, width):
    box = panel['sourceArt']['box']
    art_height = (box[3] - box[1]) * width / (box[2] - box[0])
    return 0, [], 0, art_height

def draw_panel(doc, sources, panel, x, top, width):
    _, _, _, height = panel_metrics(panel, width)
    draw_crop(doc, sources, panel['sourceArt']['page'], panel['sourceArt']['box'],
              x, top, width, height)
    art = panel['sourceArt']
    x0, y0, x1, y1 = art['box']
    box = art['captionBox']
    relative_box = [box[0] - x0, box[1] - y0, box[2] - x0, box[3] - y0]
    doc.saveState()
    doc.translate(x, top - height)
    scale = width / (x1 - x0)
    doc.scale(scale, scale)
    replace_caption(doc, panel['text'], relative_box, y1 - y0)
    doc.restoreState()
    doc.setStrokeColor(INK)
    doc.setLineWidth(2)
    doc.rect(x, top - height, width, height, stroke=1, fill=0)

def replace_caption(doc, text, box, page_height):
    x0, y0, x1, y1 = box
    size = 22
    while size >= 13:
        lines = wrap(text, x1 - x0 - 18, size)
        if len(lines) * size * 1.08 <= y1 - y0 - 14:
            break
        size -= 0.25
    assert size >= 13, text
    doc.setFillColor(PAPER)
    doc.rect(x0 - 1, page_height - y1 - 1, x1 - x0 + 2, y1 - y0 + 2, stroke=0, fill=1)
    doc.setFillColor(INK)
    doc.setFont('Times-Roman', size)
    for i, line in enumerate(lines):
        doc.drawString(x0 + 8, page_height - y0 - 7 - size - i * size * 1.08, line)

def build():
    data = json.loads((ROOT / 'chapters/capitulo-2.json').read_text())
    sources = source_images()
    output = ROOT / 'downloads/A_Guerra_Santa_Capitulo_II.pdf'
    rl_config.useA85 = False
    doc = canvas.Canvas(str(output), pageCompression=1)
    doc.setTitle('A Guerra Santa - Capítulo II - O domínio de Diabolus')
    doc.setAuthor('John Bunyan - adaptação visual em português brasileiro')
    doc.setSubject('Dez pranchas; diagramação e nomenclatura revisadas.')
    for page in data['pages']:
        if page['layout'] == 'splash':
            w, h = sources[page['number']][1]
            doc.setPageSize((w, h))
            doc.drawImage(sources[page['number']][0], 0, 0, width=w, height=h)
            for panel, box in zip(page['panels'], page['captionBoxes']):
                replace_caption(doc, panel['text'], box, h)
        else:
            rows = page['rows']
            row_heights = []
            for row in rows:
                width = (WIDTH - MARGIN * 2 - GUTTER * (len(row) - 1)) / len(row)
                row_heights.append(max(sum(panel_metrics(page['panels'][i], width)[2:]) for i in row))
            h = round(HEADER + sum(row_heights) + GUTTER * (len(rows) - 1) + 44)
            doc.setPageSize((WIDTH, h))
            doc.setFillColor(PAPER)
            doc.rect(0, 0, WIDTH, h, stroke=0, fill=1)
            doc.setFillColor(INK)
            doc.setFont('Times-Bold', 28)
            doc.drawCentredString(WIDTH / 2, h - 34, 'A GUERRA SANTA · CAPÍTULO II')
            doc.setFont('Times-Roman', 23)
            doc.drawCentredString(WIDTH / 2, h - 65, f"{page['number']:02d} · {page['title']}")
            doc.setStrokeColor(INK)
            doc.setLineWidth(1.3)
            doc.line(MARGIN, h - 79, WIDTH - MARGIN, h - 79)
            top = h - HEADER
            for row, rh in zip(rows, row_heights):
                width = (WIDTH - MARGIN * 2 - GUTTER * (len(row) - 1)) / len(row)
                for col, index in enumerate(row):
                    draw_panel(doc, sources, page['panels'][index], MARGIN + col * (width + GUTTER), top, width)
                top -= rh + GUTTER
            doc.setFont('Times-Roman', 15)
            doc.drawCentredString(WIDTH / 2, 15, f"CAPÍTULO II · {page['number']:02d}")
        bookmark = f"prancha-{page['number']:02d}"
        doc.bookmarkPage(bookmark)
        doc.addOutlineEntry(f"{page['number']:02d} - {page['title']}", bookmark, level=0)
        doc.showPage()
    doc.save()
    print(f'PDF: {len(data["pages"])} pranchas; {output.stat().st_size / 1048576:.2f} MiB')
    import fitz
    with fitz.open(output) as pdf:
        for i, page in enumerate(pdf, 1):
            pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
            pix.save(str(ROOT / f'assets/capitulo-2/prancha-{i:02d}.png'))
            print(f'Prancha {i:02d}: {pix.width} × {pix.height}')

if __name__ == '__main__':
    build()
