import { jsPDF } from 'jspdf'
import googleSansRegularDataUrl from '../assets/fonts/GoogleSans-Regular.ttf?inline'
import googleSansBoldDataUrl from '../assets/fonts/GoogleSans-Bold.ttf?inline'

const DISPLAY_FONT = 'GoogleSans'

const PDF_FONTS = [
  ['GoogleSans-Regular.ttf', googleSansRegularDataUrl, 'normal'],
  ['GoogleSans-Bold.ttf', googleSansBoldDataUrl, 'bold'],
]

const COLORS = {
  ink: [23, 23, 23],
  copper: [210, 145, 92],
  copperDark: [138, 75, 32],
  copperPale: [235, 192, 157],
  track: [221, 213, 206],
  body: [78, 56, 36],
  muted: [102, 102, 102],
  paper: [250, 247, 244],
  paperDeep: [242, 220, 203],
  white: [255, 255, 255],
}

const PAGE = {
  width: 210,
  height: 297,
  margin: 18,
  contentWidth: 174,
  bottom: 278,
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u202F\u00A0]/g, ' ')
    .trim()
}

function normalizeMarkdownText(value) {
  return String(value ?? '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u202F\u00A0]/g, ' ')
    .trim()
}

function parseInlineMarkdown(value, baseStyle = 'normal') {
  const text = normalizeMarkdownText(value)
  const markerPattern = /(\*\*\*[^*]+\*\*\*|___[^_]+___|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g
  const segments = []
  let cursor = 0

  const addSegment = (segmentText, style = baseStyle) => {
    if (!segmentText) return
    const previous = segments[segments.length - 1]
    if (previous?.style === style) previous.text += segmentText
    else segments.push({ text: segmentText, style })
  }

  for (const match of text.matchAll(markerPattern)) {
    addSegment(text.slice(cursor, match.index))
    const token = match[0]
    if ((token.startsWith('***') && token.endsWith('***')) || (token.startsWith('___') && token.endsWith('___'))) {
      addSegment(token.slice(3, -3), 'bolditalic')
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      addSegment(token.slice(2, -2), baseStyle === 'italic' ? 'bolditalic' : 'bold')
    } else if (token.startsWith('`') && token.endsWith('`')) {
      addSegment(token.slice(1, -1), 'bold')
    } else {
      addSegment(token.slice(1, -1), baseStyle === 'bold' ? 'bolditalic' : 'italic')
    }
    cursor = match.index + token.length
  }

  addSegment(text.slice(cursor))
  return segments
}

function safeFilename(value) {
  const baseName = cleanText(value || 'cv')
    .replace(/\.pdf$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return baseName || 'cv'
}

function formatDate(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function registerDisplayFont(doc) {
  PDF_FONTS.forEach(([filename, dataUrl, style]) => {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    doc.addFileToVFS(filename, base64)
    doc.addFont(filename, DISPLAY_FONT, style)
  })
}

export function createAtsAnalysisPdf({ markdown, filename, generatedAt = new Date() }) {
  const report = String(markdown || '').trim()
  if (!report) throw new Error('Aucune analyse à exporter.')

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  registerDisplayFont(doc)
  let y = PAGE.margin

  const setColor = (color, target = 'text') => {
    if (target === 'fill') doc.setFillColor(...color)
    else if (target === 'draw') doc.setDrawColor(...color)
    else doc.setTextColor(...color)
  }

  const addPage = () => {
    doc.addPage()
    y = PAGE.margin
  }

  const configureFont = ({ size, style = 'normal', color = COLORS.body, family = 'helvetica' }) => {
    doc.setFont(family, style)
    doc.setFontSize(size)
    setColor(color)
  }

  const wrapText = (text, { width, size, style = 'normal', color = COLORS.body, family = 'helvetica' }) => {
    configureFont({ size, style, color, family })
    return doc.splitTextToSize(cleanText(text), width)
  }

  const layoutInlineText = (text, {
    width,
    size = 9.2,
    baseStyle = 'normal',
    color = COLORS.body,
    family = 'helvetica',
  }) => {
    const lines = [[]]
    let lineWidth = 0

    const startNewLine = () => {
      lines.push([])
      lineWidth = 0
    }

    parseInlineMarkdown(text, baseStyle).forEach((segment) => {
      segment.text.split(/\s+/).filter(Boolean).forEach((word) => {
        configureFont({ size, style: segment.style, color, family })
        const prefix = lineWidth > 0 ? ' ' : ''
        const token = `${prefix}${word}`
        const tokenWidth = doc.getTextWidth(token)

        if (lineWidth > 0 && lineWidth + tokenWidth > width) {
          startNewLine()
        }

        configureFont({ size, style: segment.style, color, family })
        const renderedToken = lineWidth > 0 ? ` ${word}` : word
        const renderedWidth = doc.getTextWidth(renderedToken)

        if (renderedWidth <= width) {
          lines[lines.length - 1].push({ text: renderedToken, style: segment.style, width: renderedWidth })
          lineWidth += renderedWidth
          return
        }

        const fragments = doc.splitTextToSize(word, width)
        fragments.forEach((fragment, fragmentIndex) => {
          if (fragmentIndex > 0 || lineWidth > 0) startNewLine()
          configureFont({ size, style: segment.style, color, family })
          const fragmentWidth = doc.getTextWidth(fragment)
          lines[lines.length - 1].push({ text: fragment, style: segment.style, width: fragmentWidth })
          lineWidth = fragmentWidth
        })
      })
    })

    return lines.filter((line) => line.length)
  }

  const ensureBlockSpace = (height) => {
    const usablePageHeight = PAGE.bottom - PAGE.margin
    if (height <= usablePageHeight && y + height > PAGE.bottom) addPage()
  }

  const addWrappedText = (text, options = {}) => {
    const {
      x = PAGE.margin,
      width = PAGE.contentWidth,
      size = 9.2,
      lineHeight = 4.8,
      color = COLORS.body,
      style = 'normal',
      family = 'helvetica',
      gapAfter = 3,
    } = options
    const value = cleanText(text)
    if (!value) return
    const lines = wrapText(value, { width, size, style, color, family })
    ensureBlockSpace(lines.length * lineHeight + gapAfter)

    lines.forEach((line) => {
      if (y + lineHeight > PAGE.bottom) addPage()
      configureFont({ size, style, color, family })
      doc.text(line, x, y)
      y += lineHeight
    })
    y += gapAfter
  }

  const addInlineText = (text, options = {}) => {
    const {
      x = PAGE.margin,
      width = PAGE.contentWidth,
      size = 9.2,
      lineHeight = 4.8,
      color = COLORS.body,
      baseStyle = 'normal',
      family = 'helvetica',
      gapAfter = 3,
    } = options
    const lines = layoutInlineText(text, { width, size, baseStyle, color, family })
    if (!lines.length) return
    ensureBlockSpace(lines.length * lineHeight + gapAfter)

    lines.forEach((line) => {
      if (y + lineHeight > PAGE.bottom) addPage()
      let cursorX = x
      line.forEach((segment) => {
        configureFont({ size, style: segment.style, color, family })
        doc.text(segment.text, cursorX, y)
        cursorX += segment.width
      })
      y += lineHeight
    })
    y += gapAfter
  }

  const score = report.match(/(?:diagnostic\s+ats[^\n]*?|score[^\n]*?)(\d{1,3})\s*\/\s*100/i)?.[1]
    || report.match(/\b(\d{1,3})\s*\/\s*100\b/)?.[1]
    || '—'
  const reportTitle = 'Analyse générale de compatibilité'

  doc.setProperties({
    title: `Diagnostic ATS - ${cleanText(filename || 'CV')}`,
    subject: 'Analyse générale de compatibilité ATS',
    author: 'Overkill',
    creator: 'Overkill',
  })

  setColor(COLORS.ink, 'fill')
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 52, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setColor(COLORS.copperPale)
  doc.text('OVERKILL  /  DIAGNOSTIC ATS', PAGE.margin + 10, y + 12)
  doc.setFont(DISPLAY_FONT, 'bold')
  doc.setFontSize(30)
  setColor(COLORS.white)
  doc.text(score, PAGE.margin + 10, y + 32)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setColor(COLORS.copperPale)
  doc.text('sur 100', PAGE.margin + 10, y + 40)
  doc.setFont(DISPLAY_FONT, 'bold')
  doc.setFontSize(19)
  setColor(COLORS.white)
  doc.text(doc.splitTextToSize(reportTitle, 112), PAGE.margin + 48, y + 23, { lineHeightFactor: 1.08 })
  y += 64

  const sourceName = cleanText(filename || 'CV')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setColor(COLORS.copperDark)
  doc.text('Fichier analysé', PAGE.margin, y)
  doc.text("Date de l'analyse", PAGE.width - PAGE.margin, y, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setColor(COLORS.ink)
  doc.text(doc.splitTextToSize(sourceName, 105)[0], PAGE.margin, y + 5.5)
  doc.setFont('helvetica', 'normal')
  setColor(COLORS.body)
  doc.text(formatDate(generatedAt), PAGE.width - PAGE.margin, y + 5.5, { align: 'right' })
  setColor(COLORS.track, 'draw')
  doc.setLineWidth(0.3)
  doc.line(PAGE.margin, y + 11, PAGE.width - PAGE.margin, y + 11)
  y += 20

  const blocks = []
  let paragraph = []
  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
    paragraph = []
  }

  report.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      return
    }
    if (/^#\s+/.test(line)) return
    const heading = line.match(/^(#{2,4})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      return
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/) || line.match(/^\d+[.)]\s+(.+)$/)
    if (bullet) {
      flushParagraph()
      blocks.push({ type: 'bullet', text: bullet[1] })
      return
    }
    if (/^>\s?/.test(line)) {
      flushParagraph()
      blocks.push({ type: 'quote', text: line.replace(/^>\s?/, '') })
      return
    }
    if (/^---+$/.test(line)) {
      flushParagraph()
      blocks.push({ type: 'rule' })
      return
    }
    paragraph.push(line)
  })
  flushParagraph()

  const getBlockHeight = (block) => {
    if (!block) return 0
    if (block.type === 'paragraph') {
      return layoutInlineText(block.text, { width: PAGE.contentWidth, size: 9.2 }).length * 4.8 + 3
    }
    if (block.type === 'heading') {
      const isSection = block.level === 2
      const lines = wrapText(block.text, {
        width: PAGE.contentWidth,
        size: isSection ? 18 : 12.5,
        style: 'bold',
        color: COLORS.ink,
        family: DISPLAY_FONT,
      })
      return (isSection ? 16 : 4) + lines.length * (isSection ? 7.4 : 5.8) + (isSection ? 4 : 2)
    }
    if (block.type === 'bullet') {
      return Math.max(4.8, layoutInlineText(block.text, { width: PAGE.contentWidth - 8, size: 9.2 }).length * 4.8) + 3
    }
    if (block.type === 'quote') {
      return layoutInlineText(block.text, {
        width: PAGE.contentWidth - 12,
        size: 9.4,
        baseStyle: 'italic',
        family: 'helvetica',
      }).length * 4.9 + 8
    }
    return 8
  }

  blocks.forEach((block, index) => {
    if (block.type === 'heading') {
      const ownHeight = getBlockHeight(block)
      const nextHeight = Math.min(getBlockHeight(blocks[index + 1]), 45)
      ensureBlockSpace(ownHeight + nextHeight)
      const isSection = block.level === 2
      y += isSection ? 8 : 2
      if (isSection) {
        setColor(COLORS.track, 'draw')
        doc.setLineWidth(0.3)
        doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y)
        y += 8
      }
      addWrappedText(block.text, {
        size: isSection ? 18 : 12.5,
        lineHeight: isSection ? 7.4 : 5.8,
        color: COLORS.ink,
        style: 'bold',
        family: DISPLAY_FONT,
        gapAfter: isSection ? 4 : 2,
      })
      return
    }

    if (block.type === 'bullet') {
      ensureBlockSpace(getBlockHeight(block))
      setColor(COLORS.copper, 'fill')
      doc.circle(PAGE.margin + 1.5, y - 1.2, 1.05, 'F')
      addInlineText(block.text, {
        x: PAGE.margin + 8,
        width: PAGE.contentWidth - 8,
        size: 9.2,
        lineHeight: 4.8,
        gapAfter: 3,
      })
      return
    }

    if (block.type === 'quote') {
      ensureBlockSpace(getBlockHeight(block))
      setColor(COLORS.track, 'draw')
      doc.setLineWidth(0.3)
      doc.line(PAGE.margin, y - 3.5, PAGE.width - PAGE.margin, y - 3.5)
      addInlineText(block.text, {
        x: PAGE.margin + 5,
        width: PAGE.contentWidth - 10,
        size: 9.4,
        lineHeight: 4.9,
        color: COLORS.muted,
        baseStyle: 'italic',
        family: 'helvetica',
        gapAfter: 4,
      })
      return
    }

    if (block.type === 'rule') {
      ensureBlockSpace(8)
      setColor(COLORS.track, 'draw')
      doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y)
      y += 8
      return
    }

    addInlineText(block.text)
  })

  const totalPages = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber)
    setColor(COLORS.track, 'draw')
    doc.setLineWidth(0.3)
    doc.line(PAGE.margin, 285, PAGE.width - PAGE.margin, 285)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setColor(COLORS.muted)
    doc.text("Estimation générale - aucun résultat de candidature n'est garanti.", PAGE.margin, 291)
    doc.text(`${pageNumber} / ${totalPages}`, PAGE.width - PAGE.margin, 291, { align: 'right' })
  }

  const dateSlug = generatedAt.toISOString().slice(0, 10)
  return {
    doc,
    outputFilename: `diagnostic-ats-${safeFilename(filename)}-${dateSlug}.pdf`,
  }
}

export function downloadAtsAnalysisPdf(options) {
  const { doc, outputFilename } = createAtsAnalysisPdf(options)
  doc.save(outputFilename)
}
