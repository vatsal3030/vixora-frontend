import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function VideoDescription({ description, maxLines = 3 }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const needsExpansion = description && description.length > 150

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div 
        className={`text-sm text-gray-300 whitespace-pre-wrap ${
          !isExpanded && needsExpansion ? `line-clamp-${maxLines}` : ''
        }`}
      >
        {description || 'No description available.'}
      </div>
      
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-white mt-2 transition"
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}
