'use client'

import { useState } from 'react'

export default function ScientificNameField({ 
  value, 
  onChange,
  onCommonNameFetched 
}: { 
  value: string
  onChange: (value: string) => void
  onCommonNameFetched: (commonName: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [matchStatus, setMatchStatus] = useState<string | null>(null)

  const fetchAndCorrectName = async () => {
    if (!value.trim()) return
    
    setLoading(true)
    setMatchStatus(null)
    
    try {
      // Step 1: Fuzzy match with GBIF (verbose to get alternatives)
      const matchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(value)}&verbose=true`
      const matchResponse = await fetch(matchUrl)
      const matchData = await matchResponse.json()
      
      if (!matchData.usageKey) {
        setMatchStatus('No match found in taxonomic database')
        alert('Could not find this name in the taxonomic database')
        return
      }

      const matchType = matchData.matchType || 'UNKNOWN'
      const rank = matchData.rank || 'UNKNOWN'
      let chosenName = ''

      // If we got a higher‑rank match (e.g., genus instead of species), look for a species alternative
      if (matchType === 'HIGHERRANK' || rank !== 'SPECIES') {
        setMatchStatus(`Found at ${rank} level; looking for species…`)
        
        // Check if alternatives are provided
        if (matchData.alternatives && matchData.alternatives.length > 0) {
          // Find first species‑level alternative
          const speciesAlt = matchData.alternatives.find(
            (alt: any) => alt.rank === 'SPECIES'
          )
          if (speciesAlt) {
            chosenName = speciesAlt.scientificName || speciesAlt.canonicalName
            setMatchStatus(`Using species: ${chosenName}`)
            alert(`Scientific name corrected to species: ${chosenName}`)
          } else {
            // No species alternative, fall back to the matched name
            chosenName = matchData.scientificName || matchData.canonicalName || value
            setMatchStatus(`No species found; using ${rank} name: ${chosenName}`)
          }
        } else {
          chosenName = matchData.scientificName || matchData.canonicalName || value
          setMatchStatus(`Using ${rank} name: ${chosenName}`)
        }
      } else {
        // Normal species‑level match
        chosenName = matchData.scientificName || matchData.canonicalName || value
        if (chosenName !== value) {
          setMatchStatus(`Corrected to: ${chosenName}`)
          alert(`Scientific name corrected to: ${chosenName}`)
        } else {
          setMatchStatus('Name accepted')
        }
      }

      // Update the input field with the chosen name
      if (chosenName && chosenName !== value) {
        onChange(chosenName)
      }

      // Step 2: Fetch common name using the chosen name
      const commonResponse = await fetch(`/api/itis?name=${encodeURIComponent(chosenName)}`)
      const commonData = await commonResponse.json()
      
      if (commonResponse.ok && commonData.commonName) {
        onCommonNameFetched(commonData.commonName)
        setMatchStatus(prev => prev ? prev + ' – common name fetched' : 'Common name fetched')
      } else {
        setMatchStatus(prev => prev ? prev + ' – no common name found' : 'No common name found')
        alert('Could not fetch common name: ' + (commonData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Network error while looking up name')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter scientific name..."
        />
        <button
          onClick={fetchAndCorrectName}
          disabled={loading || !value}
          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Get Common Name'}
        </button>
      </div>
      {matchStatus && (
        <p className="text-sm text-gray-600">{matchStatus}</p>
      )}
    </div>
  )
}
