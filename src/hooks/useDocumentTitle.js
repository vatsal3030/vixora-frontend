import { useEffect } from 'react'

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title
    
    if (title) {
      document.title = title.includes('Vidora') ? title : `${title} - Vidora`
    } else {
      document.title = 'Vidora'
    }
    
    return () => {
      document.title = previousTitle
    }
  }, [title])
}