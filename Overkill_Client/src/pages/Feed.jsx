import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { listOffers, offerFilterOptions } from '../services/offers'
import { createApplication } from '../services/applications'
import chevronDown from '../assets/icons/chevron-down.svg'
import searchIcon from '../assets/icons/search.svg'
import locationIcon from '../assets/icons/location.svg'
import filterIcon from '../assets/icons/filter.svg'
import checkIcon from '../assets/icons/check.svg'
import heartIcon from '../assets/icons/heart.svg'
import heartFilledIcon from '../assets/icons/heart-filled.svg'
import arrowLeftIcon from '../assets/icons/arrow-left.svg'
import externalLinkIcon from '../assets/icons/external-link.svg'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'



const EMPTY_FILTERS = {
  q: '',
  city: '',
  company: '',
  contract: '',
  kind: '',
  remote: '',
  salaryMin: '',
  category: '',
}

const FILTER_NAMES = Object.keys(EMPTY_FILTERS)

function readFiltersFromSearchParams(searchParams) {
  return FILTER_NAMES.reduce(
    (nextFilters, name) => ({ ...nextFilters, [name]: searchParams.get(name)?.trim() || '' }),
    {},
  )
}

const KIND_LABELS = {
  job: 'Emploi',
  internship: 'Stage',
  apprenticeship: 'Alternance',
}

const FILTER_LABELS = {
  company: 'Entreprise',
  contract: 'Contrat',
  kind: 'Type',
  remote: 'Organisation',
  salaryMin: 'Salaire min.',
  category: 'Catégorie',
}

function Feed() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches)
  const [filters, setFilters] = useState(() => readFiltersFromSearchParams(searchParams))
  const [draftSearch, setDraftSearch] = useState(() => ({
    q: searchParams.get('q')?.trim() || '',
    city: searchParams.get('city')?.trim() || '',
  }))
  const [offers, setOffers] = useState([])
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [applicationPrompt, setApplicationPrompt] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    // TODO API (GET /api/userfav) : charger ici les favoris de l'utilisateur connecté.
    // Conserver pour chaque entrée { favoriteId, offerId } : le DELETE attend l'ID du favori,
    // pas l'ID de l'offre. L'état actuel ne contient que les IDs d'offres pour la démo.
    // Le localStorage sert uniquement à tester l'interface en attendant le branchement.
    const savedFavorites = localStorage.getItem('overkill-favorites')

    try {
      const parsedFavorites = savedFavorites ? JSON.parse(savedFavorites) : []
      return Array.isArray(parsedFavorites) ? parsedFavorites : []
    } catch {
      return []
    }
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [status, setStatus] = useState('loading')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const lastFocusedElement = useRef(null)
  const filterButtonRef = useRef(null)
  const filterDialogRef = useRef(null)
  const offerDetailRef = useRef(null)
  const applicationDialogRef = useRef(null)
  const applicationTriggerRef = useRef(null)

  const applyFilters = (nextFilters) => {
    const nextSearchParams = new URLSearchParams()

    FILTER_NAMES.forEach((name) => {
      if (nextFilters[name]) nextSearchParams.set(name, nextFilters[name])
    })

    setSelectedOffer(null)
    setStatus('loading')
    setPage(1)
    setFilters(nextFilters)
    setSearchParams(nextSearchParams, { replace: true })
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const handleBreakpointChange = (event) => setIsMobile(event.matches)

    mediaQuery.addEventListener('change', handleBreakpointChange)
    return () => mediaQuery.removeEventListener('change', handleBreakpointChange)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    listOffers(filters, page, controller.signal)
      .then(({ items: nextOffers, pagination: nextPagination }) => {
        setOffers(nextOffers)
        setPagination(nextPagination)
        setStatus('success')
        setSelectedOffer((currentOffer) => {
          if (!currentOffer) return null
          return nextOffers.find((offer) => offer.id === currentOffer.id) || null
        })
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error')
      })

    return () => controller.abort()
  }, [filters, page])

  useEffect(() => {
    localStorage.setItem('overkill-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      if (applicationPrompt && applicationPrompt.status !== 'saving') {
        setApplicationPrompt(null)
        window.requestAnimationFrame(() => applicationTriggerRef.current?.focus())
      } else if (selectedOffer) {
        setSelectedOffer(null)
        window.requestAnimationFrame(() => lastFocusedElement.current?.focus())
      } else {
        setIsFiltersOpen(false)
        window.requestAnimationFrame(() => filterButtonRef.current?.focus())
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [applicationPrompt, selectedOffer])

  useEffect(() => {
    const pageContent = document.getElementById('feed-page-content')
    const offerDetail = document.getElementById('offer-detail-panel')
    const shouldLockPage = isFiltersOpen || Boolean(applicationPrompt) || (Boolean(selectedOffer) && isMobile)

    if (pageContent) {
      pageContent.inert = shouldLockPage
      if (shouldLockPage) pageContent.setAttribute('aria-hidden', 'true')
      else pageContent.removeAttribute('aria-hidden')
    }
    if (offerDetail) {
      offerDetail.inert = Boolean(applicationPrompt)
      if (applicationPrompt) offerDetail.setAttribute('aria-hidden', 'true')
      else offerDetail.removeAttribute('aria-hidden')
    }
    document.body.style.overflow = shouldLockPage ? 'hidden' : ''

    return () => {
      if (pageContent) {
        pageContent.inert = false
        pageContent.removeAttribute('aria-hidden')
      }
      if (offerDetail) {
        offerDetail.inert = false
        offerDetail.removeAttribute('aria-hidden')
      }
      document.body.style.overflow = ''
    }
  }, [applicationPrompt, isFiltersOpen, isMobile, selectedOffer])



  useEffect(() => {
    if (!isFiltersOpen) return undefined

    const handleFocusTrap = (event) => {
      if (event.key !== 'Tab') return

      const focusableElements = filterDialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href]',
      )
      if (!focusableElements?.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [isFiltersOpen])

  useEffect(() => {
    if (!selectedOffer || !isMobile) return undefined

    const handleFocusTrap = (event) => {
      if (event.key !== 'Tab') return
      const focusableElements = offerDetailRef.current?.querySelectorAll(
        'button:not([disabled]), [href]',
      )
      if (!focusableElements?.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [isMobile, selectedOffer])

  const activeFiltersCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) => !['q', 'city'].includes(key) && value !== '',
      ).length,
    [filters],
  )

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([key, value]) => !['q', 'city'].includes(key) && value !== '')
        .map(([name, value]) => ({
          name,
          label: FILTER_LABELS[name],
          value: formatFilterValue(name, value),
        })),
    [filters],
  )

  const submitSearch = (event) => {
    event.preventDefault()
    applyFilters({
      ...filters,
      q: draftSearch.q.trim(),
      city: draftSearch.city.trim(),
    })
  }

  const updateFilter = (name, value) => {
    applyFilters({
      ...filters,
      [name]: value,
    })
  }

  const resetFilters = () => {
    setStatus('loading')
    setPage(1)
    setDraftSearch({ q: '', city: '' })
    applyFilters({ ...EMPTY_FILTERS })
  }

  const resetAdvancedFilters = () => {
    applyFilters({
      ...EMPTY_FILTERS,
      q: filters.q,
      city: filters.city,
    })
  }

  const changePage = (nextPage) => {
    if (status === 'loading' || nextPage < 1 || nextPage > pagination.totalPages) return

    setSelectedOffer(null)
    setStatus('loading')
    setPage(nextPage)
    document.getElementById('feed-results')?.scrollIntoView({ block: 'start' })
  }

  const toggleFavorite = (offerId) => {
    // TODO API :
    // - POST /api/userfav avec { offer_id: offerId } pour ajouter un favori.
    // - DELETE /api/userfav/{favoriteId} pour le retirer.
    // - Mémoriser le favoriteId retourné/chargé pour faire correspondre favori et offre.
    // Conserver cette mise à jour locale pour un retour visuel immédiat.
    setFavorites((currentFavorites) =>
      currentFavorites.includes(offerId)
        ? currentFavorites.filter((favoriteId) => favoriteId !== offerId)
        : [...currentFavorites, offerId],
    )
  }

  const openOffer = (offer) => {
    lastFocusedElement.current = document.activeElement
    setSelectedOffer(offer)
  }

  const closeOffer = (restoreFocus = true) => {
    setSelectedOffer(null)
    if (restoreFocus) {
      window.requestAnimationFrame(() => lastFocusedElement.current?.focus())
    }
  }

  const handleExternalOfferClick = () => {
    const isAuthenticated = Boolean(
      localStorage.getItem('user') && localStorage.getItem('token'),
    )
    if (!isAuthenticated) return

    applicationTriggerRef.current = document.activeElement
    setApplicationPrompt({ offer: selectedOffer, status: 'idle', message: '' })
  }

  const confirmApplication = async () => {
    if (!applicationPrompt?.offer || applicationPrompt.status === 'saving') return

    setApplicationPrompt((current) => ({ ...current, status: 'saving', message: '' }))
    try {
      const result = await createApplication(applicationPrompt.offer.id)
      setApplicationPrompt((current) => ({
        ...current,
        status: 'success',
        message: result.alreadyExists
          ? 'Cette candidature était déjà enregistrée dans votre profil.'
          : 'La candidature a été ajoutée à votre profil.',
      }))
    } catch (error) {
      setApplicationPrompt((current) => ({
        ...current,
        status: 'error',
        message: error.message,
      }))
    }
  }

  const handlePageClick = (event) => {
    if (!selectedOffer || event.target.closest('[data-offer-card]')) return
    closeOffer(false)
  }

  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#171717]">
      <div id="feed-page-content" onClick={handlePageClick}>
        <Header />

        <main className="min-h-[calc(100vh-5rem)]">
          <section className="border-b border-black/10 bg-[#f6eee8]">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
              <div>
                <h1 className="text-3xl font-black tracking-[-0.025em] text-black sm:text-4xl">
                  Offres d’emploi
                </h1>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-gray-600">
                  Recherche une offre, compare les informations utiles et ouvre le détail sans
                  quitter la liste.
                </p>
              </div>

              <form
                className="mt-6 grid gap-2 rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(71,48,32,0.08)] sm:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)_auto]"
                onSubmit={submitSearch}
              >
                <SearchField
                  label="Métier ou compétence"
                  value={draftSearch.q}
                  onChange={(value) => setDraftSearch((current) => ({ ...current, q: value }))}
                  placeholder="Ex. React, Product Designer…"
                  icon={<img src={searchIcon} alt="" className="h-5 w-5" />}
                />
                <SearchField
                  label="Localisation"
                  value={draftSearch.city}
                  onChange={(value) => setDraftSearch((current) => ({ ...current, city: value }))}
                  placeholder="Ville"
                  icon={<img src={locationIcon} alt="" className="h-5 w-5" />}
                />
                <button
                  type="submit"
                  className="min-h-12 rounded-xl bg-black px-6 text-sm font-bold text-white transition-colors hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20"
                >
                  Rechercher
                </button>
              </form>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl items-start gap-7 px-4 py-6 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8 lg:py-8">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <FilterPanel
                  filters={filters}
                  activeCount={activeFiltersCount}
                  onChange={updateFilter}
                  onTextChange={updateFilter}
                  onReset={resetAdvancedFilters}
                />
              </div>
            </aside>

            <div id="feed-results" className="min-w-0 scroll-mt-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-xl font-semibold text-black">Offres récentes</h2>
                  <span className="text-sm text-gray-500">
                    
                    {status === 'loading'
                      ? 'Chargement…'
                      : `${pagination.total} résultat${pagination.total !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <button
                  ref={filterButtonRef}
                  type="button"
                  onClick={() => setIsFiltersOpen(true)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-semibold text-black transition hover:border-gray-500 lg:hidden"
                >
                  <img src={filterIcon} alt="" className="h-4 w-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d2915c] px-1.5 text-xs text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {activeFilters.length > 0 && (
                <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.name}
                      type="button"
                      onClick={() => updateFilter(filter.name, '')}
                      className="group inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#dfc5b0] bg-[#fbf2eb] px-3 text-xs font-semibold text-[#75421d] transition hover:border-[#c47f48] hover:bg-[#f4e2d3] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#d2915c]/25"
                      aria-label={`Retirer le filtre ${filter.label} : ${filter.value}`}
                    >
                      <span>{filter.label} · {filter.value}</span>
                      <span className="text-base leading-none opacity-60 transition group-hover:opacity-100" aria-hidden="true">×</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={resetAdvancedFilters}
                    className="min-h-9 px-2 text-xs font-semibold text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-black focus:outline-none focus-visible:ring-3 focus-visible:ring-[#d2915c]/25"
                  >
                    Tout effacer
                  </button>
                </div>
              )}

              <div aria-busy={status === 'loading'}>
              {status === 'loading' && <OffersLoading />}
              {status === 'error' && (
                <StateMessage
                  title="Impossible de charger les offres"
                  description="Vérifie la connexion au serveur puis réessaie."
                  actionLabel="Réessayer"
                  onAction={() => {
                    setStatus('loading')
                    setFilters((currentFilters) => ({ ...currentFilters }))
                  }}
                />
              )}
              {status === 'success' && offers.length === 0 && (
                <StateMessage
                  title="Aucune offre trouvée"
                  description="Essaie une autre recherche ou retire quelques filtres."
                  actionLabel="Effacer les filtres"
                  onAction={resetFilters}
                />
              )}
              {status === 'success' && offers.length > 0 && (
                <div className="space-y-3" aria-live="polite">
                  {offers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isSelected={selectedOffer?.id === offer.id}
                      isFavorite={favorites.includes(offer.id)}
                      onSelect={() => openOffer(offer)}
                      onFavorite={() => toggleFavorite(offer.id)}
                    />
                  ))}
                </div>
              )}
              {status === 'success' && pagination.totalPages > 1 && (
                <nav
                  className="mt-6 flex items-center justify-between gap-3 border-t border-black/10 pt-5"
                  aria-label="Pagination des offres"
                >
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                    className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-black transition-colors hover:border-[#a96531] hover:bg-[#a96531] hover:text-white focus:outline-none focus:ring-3 focus:ring-[#d2915c]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-black"
                  >
                    Précédent
                  </button>
                  <span className="text-sm font-medium text-gray-600" aria-live="polite">
                    Page {page} sur {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-black transition-colors hover:border-[#a96531] hover:bg-[#a96531] hover:text-white focus:outline-none focus:ring-3 focus:ring-[#d2915c]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-black"
                  >
                    Suivant
                  </button>
                </nav>
              )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres des offres">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => {
              setIsFiltersOpen(false)
              window.requestAnimationFrame(() => filterButtonRef.current?.focus())
            }}
            aria-label="Fermer les filtres"
          />
          <div
            ref={filterDialogRef}
            className="animate-offer-panel-in absolute inset-y-0 left-0 w-[min(90vw,22rem)] overflow-y-auto bg-[#faf7f4] p-4 shadow-2xl"
          >
            <FilterPanel
              filters={filters}
              activeCount={activeFiltersCount}
              onChange={updateFilter}
              onTextChange={updateFilter}
              onReset={resetAdvancedFilters}
              onClose={() => {
                setIsFiltersOpen(false)
                window.requestAnimationFrame(() => filterButtonRef.current?.focus())
              }}
            />
          </div>
        </div>
      )}

      {selectedOffer && (
        <OfferDetail
          panelRef={offerDetailRef}
          offer={selectedOffer}
          isFavorite={favorites.includes(selectedOffer.id)}
          isModal={isMobile}
          onClose={closeOffer}
          onFavorite={() => toggleFavorite(selectedOffer.id)}
          onExternalVisit={handleExternalOfferClick}
        />
      )}

      {applicationPrompt && (
        <ApplicationConfirmDialog
          dialogRef={applicationDialogRef}
          offer={applicationPrompt.offer}
          status={applicationPrompt.status}
          message={applicationPrompt.message}
          onConfirm={confirmApplication}
          onClose={() => {
            if (applicationPrompt.status === 'saving') return
            setApplicationPrompt(null)
            window.requestAnimationFrame(() => applicationTriggerRef.current?.focus())
          }}
        />
      )}
    </div>
  )
}

function SearchField({ label, value, onChange, placeholder, icon }) {
  const inputRef = useRef(null)

  const clearInput = () => {
    onChange('')
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl border border-gray-200 bg-white pl-3.5 pr-1.5 transition focus-within:border-[#c47f48] focus-within:ring-3 focus-within:ring-[#d2915c]/12">
      <span className="opacity-55" aria-hidden="true">
        {icon}
      </span>
      <label className="min-w-0 flex-1">
        <span className="block text-[0.68rem] font-medium text-gray-500">{label}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={120}
          autoComplete="off"
          className="mt-0.5 w-full bg-transparent text-sm font-medium text-black outline-none placeholder:font-normal placeholder:text-gray-400"
        />
      </label>
      {value && (
        <button
          type="button"
          onClick={clearInput}
          aria-label={`Effacer ${label.toLocaleLowerCase('fr')}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xl leading-none text-gray-500 transition hover:bg-[#f1ebe6] hover:text-black focus:outline-none focus-visible:ring-3 focus-visible:ring-[#d2915c]/25"
        >
          ×
        </button>
      )}
    </div>
  )
}

function FilterPanel({ filters, activeCount, onChange, onTextChange, onReset, onClose }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold">Filtres</h2>
          {activeCount > 0 && (
            <span className="text-xs text-[#8a542d]">
              {activeCount} actif{activeCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-gray-600 transition hover:bg-[#f1ebe6] hover:text-black"
            aria-label="Fermer les filtres"
          >
            ×
          </button>
        )}
      </div>

      <FilterGroup
        legend="Type d’offre"
        name="kind"
        value={filters.kind}
        options={offerFilterOptions.kinds}
        onChange={onChange}
        defaultOpen
      />
      <FilterGroup
        legend="Contrat"
        name="contract"
        value={filters.contract}
        options={offerFilterOptions.contracts}
        onChange={onChange}
        defaultOpen
      />
      <FilterGroup
        legend="Organisation"
        name="remote"
        value={filters.remote}
        options={offerFilterOptions.remote}
        onChange={onChange}
      />
      <FilterGroup
        legend="Catégorie"
        name="category"
        value={filters.category}
        options={offerFilterOptions.categories.map((category) => ({
          value: category,
          label: category,
        }))}
        onChange={onChange}
      />

      <CollapsibleFilterSection title="Salaire minimum" active={filters.salaryMin !== ''}>
        <label className="sr-only" htmlFor="salary-min">
          Salaire minimum
        </label>
        <select
          id="salary-min"
          value={filters.salaryMin}
          onChange={(event) => onTextChange('salaryMin', event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-[#c47f48] focus:ring-3 focus:ring-[#d2915c]/12"
        >
          <option value="">Indifférent</option>
          <option value="35000">35 000 €</option>
          <option value="45000">45 000 €</option>
          <option value="55000">55 000 €</option>
        </select>
      </CollapsibleFilterSection>

      <CollapsibleFilterSection title="Entreprise" active={filters.company !== ''}>
        <label className="sr-only" htmlFor="company-filter">
          Entreprise
        </label>
        <input
          id="company-filter"
          type="text"
          value={filters.company}
          onChange={(event) => onTextChange('company', event.target.value)}
          placeholder="Nom de l’entreprise"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-[#c47f48] focus:ring-3 focus:ring-[#d2915c]/12"
        />
      </CollapsibleFilterSection>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 text-sm font-medium text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-black"
        >
          Tout effacer · {activeCount}
        </button>
      )}
    </div>
  )
}

function FilterGroup({ legend, name, value, options, onChange, defaultOpen = false }) {
  const choices = [{ value: '', label: 'Tous' }, ...options]

  return (
    <CollapsibleFilterSection title={legend} defaultOpen={defaultOpen} active={value !== ''}>
      <fieldset>
        <legend className="sr-only">{legend}</legend>
        <div className="space-y-1.5">
        {choices.map((option) => (
          <label
            key={option.value}
            className="group flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm font-medium text-gray-700 hover:text-black"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(name, option.value)}
              className="peer sr-only"
            />
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full border border-gray-300 bg-white transition peer-checked:border-[#c47f48] peer-checked:bg-[#d2915c] peer-focus-visible:ring-3 peer-focus-visible:ring-[#d2915c]/20">
              <img src={checkIcon} alt="" className="h-3 w-3 invert" />
            </span>
            <span className="group-hover:text-black">{option.label}</span>
          </label>
        ))}
        </div>
      </fieldset>
    </CollapsibleFilterSection>
  )
}

function CollapsibleFilterSection({ title, children, defaultOpen = false, active = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const regionId = `filter-${title.toLocaleLowerCase('fr').replaceAll(/[^a-z0-9]+/g, '-')}`

  return (
    <section className="mt-4 border-t border-gray-200 pt-2.5">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex min-h-8 w-full items-center justify-between gap-3 rounded-md text-left text-sm font-semibold text-black outline-none transition hover:text-[#8a542d] focus-visible:ring-3 focus-visible:ring-[#d2915c]/20"
        aria-expanded={isOpen}
        aria-controls={regionId}
      >
        <span className="flex items-center gap-2">
          {title}
          {active && <span className="h-1.5 w-1.5 rounded-full bg-[#d2915c]" aria-label="Filtre actif" />}
        </span>
        <img
          src={chevronDown}
          alt=""
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div id={regionId} className="mt-2">
          {children}
        </div>
      )}
    </section>
  )
}

function OfferCard({ offer, isSelected, isFavorite, onSelect, onFavorite }) {
  return (
    <article
      data-offer-card
      className={`relative overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow,transform] duration-200 ${
        isSelected
          ? 'border-[#c47f48] bg-[#fffaf6] shadow-[0_10px_24px_rgba(71,48,32,0.08)]'
          : 'border-gray-200 hover:-translate-y-0.5 hover:border-[#c9b5a5] hover:shadow-[0_10px_24px_rgba(71,48,32,0.07)]'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full p-4 pr-16 text-left outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-[#d2915c]/25 sm:p-5 sm:pr-20"
        aria-label={`Ouvrir l’offre ${offer.title} chez ${offer.company}`}
      >
        <div className="flex items-start gap-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-black sm:text-xl">
                  {offer.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {offer.company} · {formatLocation(offer)}
                </p>
              </div>
              <span className="w-fit shrink-0 rounded-md border border-[#ebd3c0] bg-[#fbf2eb] px-2.5 py-1 text-xs font-semibold text-[#75421d]">
                {formatContract(offer.contract)}
              </span>
            </div>

            <OfferDescription description={offer.description} preview />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-500">
                <span>{formatRemote(offer.isRemote)}</span>
                <span className="text-gray-300" aria-hidden="true">·</span>
                <span>Publiée {formatPublishedDate(offer.publishedAt, true)}</span>
              </div>
              <p className="text-sm font-bold text-black">{formatSalary(offer)}</p>
            </div>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className={`absolute right-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-3 focus:ring-[#d2915c]/20 sm:right-4 sm:top-4 ${
          isFavorite
            ? 'border-[#e3b995] bg-[#f4e2d3]'
            : 'border-gray-200 bg-white hover:border-gray-400'
        }`}
      >
        <img
          src={isFavorite ? heartFilledIcon : heartIcon}
          alt=""
          className="h-5 w-5"
        />
      </button>
    </article>
  )
}

function OfferDetail({ panelRef, offer, isFavorite, isModal, onClose, onFavorite, onExternalVisit }) {
  return (
    <aside
      ref={panelRef}
      id="offer-detail-panel"
      className="animate-offer-panel-in fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-[-12px_0_32px_rgba(23,23,23,0.14)] sm:w-[min(92vw,42rem)] lg:w-1/2 lg:max-w-[50vw]"
      role="dialog"
      aria-modal={isModal}
      aria-labelledby="offer-detail-title"
    >
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-3.5 sm:px-7">
        <button
          type="button"
          onClick={() => onClose()}
          autoFocus
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-gray-700 transition hover:bg-[#f4eee9] hover:text-black focus:outline-none focus:ring-3 focus:ring-[#d2915c]/20"
        >
          <img src={arrowLeftIcon} alt="" className="h-4 w-4" />
          Retour aux offres
        </button>
        <button
          type="button"
          onClick={onFavorite}
          aria-pressed={isFavorite}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-3 focus:ring-[#d2915c]/20 ${
            isFavorite ? 'border-[#e3b995] bg-[#f4e2d3]' : 'border-gray-200 hover:border-gray-400'
          }`}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <img
            src={isFavorite ? heartFilledIcon : heartIcon}
            alt=""
            className="h-5 w-5"
          />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 py-7 sm:px-7 sm:py-8">
          <div className="flex items-start gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600">
                <span className="text-[#8a542d]">{KIND_LABELS[offer.kind] || offer.kind}</span>
                <span className="mx-2 text-gray-300" aria-hidden="true">·</span>
                {formatContract(offer.contract)}
              </p>
              <h2 id="offer-detail-title" className="mt-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.025em] text-black">
                {offer.title}
              </h2>
              <p className="mt-2 text-base font-medium text-gray-600">
                {offer.company} · {formatLocation(offer)}
              </p>
            </div>
          </div>

          <dl className="mt-7 grid grid-cols-2 border-y border-gray-200 sm:grid-cols-3">
            <DetailStat term="Organisation" description={formatRemote(offer.isRemote)} />
            <DetailStat term="Salaire" description={formatSalary(offer)} />
            <DetailStat
              term="Publiée"
              description={formatPublishedDate(offer.publishedAt)}
              className="col-span-2 sm:col-span-1"
            />
          </dl>

          <DetailSection title="Stack">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(offer.extractedSkills) && offer.extractedSkills.length > 0 ? (
                offer.extractedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-gray-200 bg-[#e7e5df] px-2.5 py-1.5 text-sm font-medium text-black"
                  >
                    {skill.replaceAll('"','').replaceAll('[','').replaceAll(']','')}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-600">Aucune compétence renseignée.</p>
              )}
            </div>
          </DetailSection>

          <DetailSection title="Résumé de l’offre">
            <OfferDescription description={offer.description} />
          </DetailSection>

          <div className="mt-9 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-600">
            <p>
              Offre publiée sur <span className="font-bold text-black">We Love Dev</span>.
              Overkill centralise l’annonce, mais la candidature se poursuit sur le site d’origine.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-5 py-4 sm:px-7">
        <a
          href={offer.externalUrl}
          target="_blank"
          rel="noreferrer"
          onClick={onExternalVisit}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20"
        >
          Postuler sur le site d’origine
          <img src={externalLinkIcon} alt="" className="h-4 w-4 invert" />
        </a>
      </div>
    </aside>
  )
}

function ApplicationConfirmDialog({ dialogRef, offer, status, message, onConfirm, onClose }) {
  const isSaving = status === 'saving'
  const isSuccess = status === 'success'

  useEffect(() => {
    const handleFocusTrap = (event) => {
      if (event.key !== 'Tab') return

      const focusableElements = dialogRef.current?.querySelectorAll('button:not([disabled])')
      if (!focusableElements?.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [dialogRef])

  return (
    <div
      className="animate-login-backdrop-in fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-confirm-title"
        aria-describedby="application-confirm-description"
        className="animate-login-in w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-8"
      >
        <span className="inline-flex rounded-full bg-[#fbf2eb] px-3 py-1 text-xs font-bold text-[#75421d]">Suivi de candidature</span>
        <h2 id="application-confirm-title" className="mt-5 text-2xl font-black tracking-[-0.02em] text-black">
          {isSuccess ? 'Candidature enregistrée' : 'Avez-vous postulé ?'}
        </h2>
        <p id="application-confirm-description" className="mt-3 text-sm leading-6 text-gray-600">
          {isSuccess
            ? message
            : <>Confirmez uniquement si vous avez envoyé votre candidature pour <strong className="font-bold text-black">{offer.title}</strong> chez {offer.company}.</>}
        </p>
        {status === 'error' && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {message} Vous pouvez réessayer.
          </p>
        )}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isSuccess ? (
            <button type="button" autoFocus onClick={onClose} className="min-h-12 rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20">Terminer</button>
          ) : (
            <>
              <button type="button" onClick={onClose} disabled={isSaving} className="min-h-12 rounded-xl border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 transition hover:border-black hover:text-black focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20 disabled:cursor-not-allowed disabled:opacity-50">Non, pas cette fois</button>
              <button type="button" autoFocus onClick={onConfirm} disabled={isSaving} className="min-h-12 rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20 disabled:cursor-wait disabled:opacity-70">{isSaving ? 'Enregistrement…' : 'Oui, j’ai postulé'}</button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
function DetailStat({ term, description, className = '' }) {
  return (
    <div className={`border-gray-200 px-3 py-4 [&:not(:last-child)]:border-r ${className}`}>
      <dt className="text-xs font-medium text-gray-500">{term}</dt>
      <dd className="mt-1 text-sm font-semibold text-black">{description}</dd>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <section className="mt-9 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold tracking-[-0.01em] text-black">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function OfferDescription({ description, preview = false }) {
  const normalizedDescription = normalizeOfferDescription(
    description || 'Description non renseignée.',
  )

  if (preview) {
    return (
      <p className="mt-3 line-clamp-2 max-w-[68ch] text-sm leading-6 text-gray-600">
        {createPlainTextPreview(normalizedDescription)}
      </p>
    )
  }

  return (
    <div className="max-w-[70ch] space-y-4 [overflow-wrap:anywhere] text-base leading-8 text-gray-700 [&_a]:font-semibold [&_a]:text-[#8a542d] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-semibold [&_strong]:text-black">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          a: ({ node, ...props }) => {
            void node
            return <a {...props} target="_blank" rel="noreferrer noopener" />
          },
        }}
      >
        {normalizedDescription}
      </ReactMarkdown>
    </div>
  )
}

function normalizeOfferDescription(description) {
  return String(description)
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n\n')
    .replace(/\*\*[ \t]*([^*\n]*?\S)[ \t]*\*\*/g, '**$1**')
    .replace(/__[ \t]*([^_\n]*?\S)[ \t]*__/g, '__$1__')
}

function createPlainTextPreview(description) {
  return String(description)
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2')
    .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1$2')
    .replace(/~~([^~\n]+)~~/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function OffersLoading() {
  return (
    <div className="space-y-4" role="status" aria-label="Chargement des offres">
      <span className="sr-only">Chargement des offres…</span>
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex animate-pulse gap-4 motion-reduce:animate-none">
            <div className="flex-1">
              <div className="h-5 w-2/3 rounded bg-[#eee7e1]" />
              <div className="mt-3 h-4 w-1/3 rounded bg-[#eee7e1]" />
              <div className="mt-6 h-4 w-full rounded bg-[#f3efeb]" />
              <div className="mt-2 h-4 w-4/5 rounded bg-[#f3efeb]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StateMessage({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#f4e2d3] text-[#7a431c]">
        <img src={searchIcon} alt="" className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a96531]"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function formatContract(contract) {
  if (!contract) return 'Contrat non précisé'
  return contract.length <= 3
    ? contract.toLocaleUpperCase('fr')
    : contract.charAt(0).toLocaleUpperCase('fr') + contract.slice(1)
}

function formatLocation(offer) {
  return offer.city || 'Ville non précisée'
}

function formatSalary(offer) {
  if (!offer.salaryMin && !offer.salaryMax) return 'Salaire non précisé'

  const formatter = new Intl.NumberFormat('fr-FR')
  const currency = offer.salaryCurrency === 'USD' ? '$' : '€'
  const formatAmount = (amount) => {
    const value = Number(amount)
    if (!Number.isFinite(value)) return null
    return value < 1000 ? `${formatter.format(value)} k${currency}` : `${formatter.format(value)} ${currency}`
  }

  if (offer.salaryMin && offer.salaryMax) {
    return `${formatAmount(offer.salaryMin)} – ${formatAmount(offer.salaryMax)}`
  }

  return offer.salaryMin
    ? `Dès ${formatAmount(offer.salaryMin)}`
    : `Jusqu’à ${formatAmount(offer.salaryMax)}`
}

function formatPublishedDate(date, relative = false) {
  if (!date) return 'Date inconnue'
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'Date inconnue'

  if (relative) {
    const days = Math.max(0, Math.floor((Date.now() - parsedDate.getTime()) / 86400000))
    if (days === 0) return 'aujourd’hui'
    if (days === 1) return 'hier'
    if (days < 30) return `il y a ${days} jours`
  }

  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(
    parsedDate,
  )
}

function formatRemote(remote) {
  if (!remote) return 'Organisation non précisée'
  const normalizedRemote = String(remote).toLocaleLowerCase('fr')
  const match = offerFilterOptions.remote.find(({ value }) => value === normalizedRemote)
  return match?.label || remote
}

function formatFilterValue(name, value) {
  if (name === 'kind') return KIND_LABELS[value] || value
  if (name === 'remote') return formatRemote(value)
  if (name === 'salaryMin') return `${new Intl.NumberFormat('fr-FR').format(value)} €`
  if (name === 'contract') return formatContract(value)
  return value
}

export default Feed
