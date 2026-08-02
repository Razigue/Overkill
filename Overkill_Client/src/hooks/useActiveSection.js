import { useEffect, useState } from 'react'

function useActiveSection(items) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

        if (current) setActiveId(current.target.id)
      },
      { rootMargin: '-20% 0px -65%' },
    )

    items.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [items])

  return [activeId, setActiveId]
}

export default useActiveSection
