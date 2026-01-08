import { useEffect } from 'react'

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title
    
    if (title) {
      document.title = title.includes('Vixora') ? title : `${title} - Vixora`
    } else {
      document.title = 'Vixora'
    }
    
    return () => {
      document.title = previousTitle
    }
  }, [title])
}