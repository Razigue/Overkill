import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const WEBHOOK_URL = import.meta.env.VITE_N8N_ATS_WEBHOOK_URL

const markdownComponents = {
  h1: ({ children }) => (
    <h1 id="results-title" className="max-w-[24ch] text-4xl font-black leading-[1.08] tracking-[-0.03em] text-black sm:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-14 border-t border-black/15 pt-7 text-2xl font-black leading-tight tracking-[-0.02em] text-black first:mt-0 first:border-0 first:pt-0 sm:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-9 max-w-[60ch] text-lg font-extrabold leading-snug text-black sm:text-xl">{children}</h3>,
  p: ({ children }) => <p className="mt-3 max-w-[72ch] break-words text-base leading-7 text-[#4e3824] first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-5 max-w-[72ch] list-disc space-y-3 pl-6 marker:text-lg marker:text-[#d2915c]">{children}</ul>,
  ol: ({ children }) => <ol className="mt-5 max-w-[72ch] list-decimal space-y-3 pl-6 marker:font-bold marker:text-[#a85f2d]">{children}</ol>,
  li: ({ children }) => <li className="break-words pl-2 text-base leading-7 text-[#4e3824] [&>p]:mt-0 [&>ul]:mt-3">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-[#171717]">{children}</strong>,
  em: ({ children }) => <em className="italic text-[#68482f]">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="mt-8 max-w-[72ch] rounded-xl border border-[#e5c2a5] bg-[#fff8f2] px-5 py-4 text-[#68482f] [&>p]:mt-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-black/15" />,
  table: ({ children }) => <div className="mt-6 overflow-x-auto rounded-xl border border-black/15"><table className="w-full min-w-[36rem] border-collapse text-left text-sm">{children}</table></div>,
  th: ({ children }) => <th className="border-b border-black/20 bg-[#f2dccb] px-4 py-3 font-bold text-black">{children}</th>,
  td: ({ children }) => <td className="border-b border-black/10 px-4 py-3 align-top leading-6 text-[#4e3824]">{children}</td>,
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function AnalyseAts() {
  const fileInputRef = useRef(null)
  const resultsRef = useRef(null)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [exportError, setExportError] = useState('')

  const selectFile = (selectedFile) => {
    setAnalysis(null)
    setError('')
    setExportError('')

    if (!selectedFile) return

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setFile(null)
      setError('Ce format ne peut pas être analysé. Choisissez un CV au format PDF.')
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setError('Ce PDF dépasse 10 Mo. Compressez-le ou exportez une version plus légère.')
      return
    }

    setFile(selectedFile)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files?.[0])
  }

  const resetAnalysis = () => {
    setFile(null)
    setAnalysis(null)
    setError('')
    setExportError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const exportAnalysis = async () => {
    if (!analysis || isExporting) return

    setIsExporting(true)
    setExportError('')

    try {
      const { downloadAtsAnalysisPdf } = await import('../utils/exportAtsAnalysisPdf')
      downloadAtsAnalysisPdf({
        markdown: analysis,
        filename: file?.name || 'cv.pdf',
      })
    } catch {
      setExportError("Le PDF n'a pas pu être créé. Autorisez les téléchargements dans votre navigateur, puis réessayez.")
    } finally {
      setIsExporting(false)
    }
  }

  const analyzeCv = async () => {
    if (!file || isAnalyzing) return

    if (!WEBHOOK_URL) {
      setError("L'analyseur n'est pas encore configuré. Ajoutez VITE_N8N_ATS_WEBHOOK_URL à l'environnement du frontend.")
      return
    }

    setIsAnalyzing(true)
    setAnalysis(null)
    setError('')
    setExportError('')

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 125000)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      const report = (await response.text()).trim()

      if (!response.ok) {
        throw new Error(report || "L'analyse n'a pas pu être terminée. Réessayez avec un autre PDF.")
      }

      if (report.length < 120) {
        throw new Error("Le moteur IA a renvoyé une analyse trop courte. Relancez l'analyse du même PDF.")
      }

      setAnalysis(report)
      window.requestAnimationFrame(() => resultsRef.current?.focus())
    } catch (requestError) {
      if (requestError.name === 'AbortError') {
        setError("L'analyse a pris trop de temps. Vérifiez que LM Studio est démarré, puis réessayez.")
      } else {
        setError(requestError.message || "Une erreur est survenue pendant l'analyse.")
      }
    } finally {
      window.clearTimeout(timeout)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f4] text-[#171717]">
      <span
        hidden
        dangerouslySetInnerHTML={{
          __html: '<!-- THESIS: un atelier de diagnostic montre le passage du document brut aux priorités actionnables, sans tableau de bord abstrait. OWN-WORLD: crème, encre et cuivre Overkill, surfaces papier, traits nets et contrôles tactiles. STORY: comprendre la portée, déposer, consentir, analyser, corriger. FIRST VIEWPORT: promesse à gauche et panneau de dépôt clair immédiatement opérable à droite. FORM: grille de diagnostic, candidate 5, staging direct, seed d5af6c92. -->',
        }}
      />
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${Background})` }}>
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
            <div className="max-w-xl">
              <a href="/ressources/cv" className="text-sm font-bold text-black transition hover:text-[#a85f2d] focus:outline-none focus:ring-2 focus:ring-[#d2915c] focus:ring-offset-4">
                ← Revenir au guide CV
              </a>
              <p className="mt-10 text-sm font-bold uppercase tracking-wide text-[#a85f2d]">Analyse ATS publique</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.03em] text-black sm:text-6xl">
                Votre CV,<br />côté machine.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#4e3824]">
                Obtenez une lecture générale de votre CV, un score sur 100 et des pistes concrètes pour le rendre plus clair pour les logiciels de recrutement.
              </p>
              <div className="mt-8 grid grid-cols-3 border-y border-black/20 py-5 text-sm">
                <div className="pr-4">
                  <p className="font-black text-black">Sans compte</p>
                  <p className="mt-1 text-[#68482f]">Accès public</p>
                </div>
                <div className="border-x border-black/20 px-4">
                  <p className="font-black text-black">Sans stockage</p>
                  <p className="mt-1 text-[#68482f]">Analyse temporaire</p>
                </div>
                <div className="pl-4">
                  <p className="font-black text-black">PDF texte</p>
                  <p className="mt-1 text-[#68482f]">10 Mo maximum</p>
                </div>
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-[#ddd5ce] bg-white" aria-labelledby="upload-title" aria-busy={isAnalyzing}>
              <div className="flex items-center justify-between border-b border-[#ddd5ce] bg-[#f2dccb] px-5 py-4 text-black sm:px-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a4b20]">Poste d’analyse</p>
                  <h2 id="upload-title" className="mt-1 text-xl font-black">Déposer un CV</h2>
                </div>
                <span className="text-sm font-bold text-[#8a4b20]" aria-hidden="true">PDF</span>
              </div>

              <div className="p-5 sm:p-7">
                <div
                  onDragEnter={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-64 flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition-colors ${
                    isDragging ? 'border-black bg-[#f2dccb]' : file ? 'border-[#a85f2d] bg-[#fff8f2]' : 'border-black/35 bg-[#fcfbfa]'
                  }`}
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full ${file ? 'bg-[#d2915c] text-white' : 'bg-black text-white'}`}>
                    {file ? (
                      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {file ? (
                    <>
                      <p className="mt-5 max-w-sm break-all text-lg font-black text-black">{file.name}</p>
                      <p className="mt-2 text-sm text-gray-600">{formatFileSize(file.size)} · prêt à être analysé</p>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 text-sm font-bold text-[#8a4b20] underline decoration-2 underline-offset-4 hover:text-black focus:outline-none focus:ring-2 focus:ring-[#d2915c]">
                        Choisir un autre fichier
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mt-5 text-xl font-black text-black">Glissez votre CV ici</p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">Ou sélectionnez un PDF contenant du texte. Les documents scannés ne peuvent pas encore être lus.</p>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-xl bg-[#d2915c] px-5 py-3 text-sm font-bold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#d2915c] focus:ring-offset-2">
                        Sélectionner mon CV
                      </button>
                    </>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="sr-only"
                    aria-label="Sélectionner un CV au format PDF"
                    aria-describedby="ats-file-constraints"
                    onChange={(event) => selectFile(event.target.files?.[0])}
                  />
                </div>

                {error && (
                  <div role="alert" className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-900">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p id="ats-file-constraints" className="max-w-sm text-xs leading-5 text-gray-500">
                    En lançant l’analyse, le texte du CV est transmis à notre IA puis supprimé du flux de traitement.
                  </p>
                  <button
                    type="button"
                    onClick={analyzeCv}
                    disabled={!file || isAnalyzing}
                    className={`inline-flex min-w-44 items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#d2915c] focus:ring-offset-2 ${
                      isAnalyzing
                        ? 'cursor-wait bg-[#f2dccb] text-[#a85f2d]'
                        : file
                          ? 'bg-black text-white hover:bg-[#a85f2d]'
                          : 'cursor-not-allowed bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-3">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d2915c]/35 border-t-[#a85f2d] motion-reduce:animate-none" aria-hidden="true" />
                        Analyse en cours…
                      </span>
                    ) : 'Analyser mon CV'}
                  </button>
                </div>
                <p className="sr-only" role="status" aria-live="polite">
                  {isAnalyzing ? 'Analyse du CV en cours. Cette opération peut prendre jusqu’à deux minutes.' : ''}
                </p>
              </div>
            </section>
          </div>
        </section>

        {!analysis && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="reading-title">
            <div className="grid gap-10 border-y border-black py-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-sm font-bold text-[#a85f2d]">Ce que nous regardons</p>
                <h2 id="reading-title" className="mt-3 text-4xl font-black leading-tight tracking-[-0.02em] text-black sm:text-5xl">Sept angles, un diagnostic lisible.</h2>
              </div>
              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  ['10', 'Coordonnées professionnelles'],
                  ['20', 'Structure et lisibilité ATS'],
                  ['10', 'Titre et positionnement'],
                  ['25', 'Expériences et impact'],
                  ['15', 'Compétences'],
                  ['10', 'Formation et langues'],
                  ['10', 'Clarté rédactionnelle'],
                ].map(([points, label]) => (
                  <div key={label} className="flex items-baseline gap-4 border-b border-black/15 pb-4">
                    <span className="text-2xl font-black text-[#a85f2d]">{points}</span>
                    <span className="text-sm font-bold text-gray-800">{label}</span>
                  </div>
                ))}
                <p className="text-sm leading-6 text-gray-600 sm:self-center">Le score reste une estimation générale : il ne garantit pas le résultat d’une candidature.</p>
              </div>
            </div>
          </section>
        )}

        {analysis && (
          <section ref={resultsRef} tabIndex="-1" className="mx-auto max-w-7xl px-4 py-16 outline-none sm:px-6 lg:px-8 lg:py-20" aria-labelledby="results-title">
            <div className="overflow-hidden rounded-2xl bg-black text-white">
              <div className="grid gap-7 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#ebc09d]">Diagnostic terminé</p>
                  <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">Votre rapport ATS est prêt.</h2>
                </div>
                <div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={exportAnalysis}
                      disabled={isExporting}
                      className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-[#d2915c] px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-[#ebc09d] focus:ring-offset-2 focus:ring-offset-black disabled:cursor-wait disabled:bg-[#8a5d38] disabled:text-white/80"
                    >
                      {isExporting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
                          Création du PDF…
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Télécharger le PDF
                        </>
                      )}
                    </button>
                    <button type="button" onClick={resetAnalysis} className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                      Analyser un autre CV
                    </button>
                    <a href="/ressources/cv" className="rounded-xl px-3 py-3 text-sm font-bold text-[#ebc09d] underline decoration-white/40 underline-offset-4 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                      Revoir le guide CV
                    </a>
                  </div>
                </div>
              </div>
              {exportError && (
                <p className="px-6 pb-7 text-sm font-medium leading-6 text-red-200 sm:px-10" role="alert">{exportError}</p>
              )}
              <p className="sr-only" role="status" aria-live="polite">
                {isExporting ? 'Création du rapport PDF en cours.' : ''}
              </p>
            </div>

            <article className="mt-12 overflow-hidden rounded-2xl border border-[#ddd5ce] bg-white px-6 py-9 shadow-[0_16px_50px_rgba(78,56,36,0.06)] sm:px-10 sm:py-12 lg:px-16 lg:py-14">
              <div className="mx-auto max-w-4xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {analysis}
                </ReactMarkdown>
              </div>
            </article>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AnalyseAts
