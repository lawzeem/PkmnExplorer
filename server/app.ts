import express from 'express'

import pokemonData from '../src/data/pokemon.json'
import { STAT_FILTER_CONFIG } from '../src/lib/statFilters'

const app = express()

app.get('/api/pokemon', (req, res) => {
  const page = parseInt((req.query.page as string) || '1')
  const limit = parseInt((req.query.limit as string) || '20')
  const search = (req.query.search as string) || ''
  const types = ((req.query.type as string) || '')
    .split(',')
    .map(type => type.trim().toLowerCase())
    .filter(Boolean)

  let filteredPokemon = pokemonData

  if (search) {
    filteredPokemon = filteredPokemon.filter(
      pokemon =>
        pokemon.name.toLowerCase().includes(search.toLowerCase()) ||
        pokemon.types.some(type =>
          type.toLowerCase().includes(search.toLowerCase())
        ) ||
        pokemon.description.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (types.length > 0) {
    filteredPokemon = filteredPokemon.filter(pokemon =>
      pokemon.types.some(type => types.includes(type.toLowerCase()))
    )
  }

  for (const config of STAT_FILTER_CONFIG) {
    const minParam = req.query[`${config.field}Min`] as string | undefined
    const maxParam = req.query[`${config.field}Max`] as string | undefined
    const min = minParam !== undefined ? Number(minParam) : undefined
    const max = maxParam !== undefined ? Number(maxParam) : undefined

    if (min === undefined && max === undefined) continue

    filteredPokemon = filteredPokemon.filter(pokemon => {
      const value = pokemon[config.field]
      if (min !== undefined && value < min) return false
      if (max !== undefined && value > max) return false
      return true
    })
  }

  const sortBy = req.query.sortBy as string | undefined
  const sortField = STAT_FILTER_CONFIG.find(
    config => config.field === sortBy
  )?.field
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1

  if (sortField) {
    filteredPokemon = [...filteredPokemon].sort(
      (a, b) => (a[sortField] - b[sortField]) * sortOrder
    )
  }

  const total = filteredPokemon.length
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedPokemon = filteredPokemon.slice(startIndex, endIndex)

  res.json({
    data: paginatedPokemon,
    pagination: {
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit,
      page,
      total,
      totalPages
    }
  })
})

export default app
