export type StatField =
  | 'attack'
  | 'defense'
  | 'generation'
  | 'height'
  | 'hp'
  | 'speed'
  | 'weight'

export type StatFilterConfig = {
  field: StatField
  label: string
  max: number
  min: number
  step: number
  unit?: string
}

export const STAT_FILTER_CONFIG: StatFilterConfig[] = [
  { field: 'generation', label: 'Generation', max: 9, min: 1, step: 1 },
  {
    field: 'height',
    label: 'Height',
    max: 20,
    min: 0.3,
    step: 0.1,
    unit: 'm'
  },
  {
    field: 'weight',
    label: 'Weight',
    max: 1000,
    min: 0.1,
    step: 1,
    unit: 'kg'
  },
  { field: 'hp', label: 'HP', max: 255, min: 20, step: 1 },
  { field: 'attack', label: 'Attack', max: 190, min: 5, step: 1 },
  { field: 'defense', label: 'Defense', max: 230, min: 5, step: 1 },
  { field: 'speed', label: 'Speed', max: 200, min: 5, step: 1 }
]

export type SortOrder = 'asc' | 'desc'

export type SortState = null | { field: StatField; order: SortOrder }

export type StatRanges = Record<StatField, [number, number]>

export function cycleSort(current: SortState, field: StatField): SortState {
  if (!current || current.field !== field) return { field, order: 'asc' }
  if (current.order === 'asc') return { field, order: 'desc' }
  return null
}

export function getDefaultStatRanges(): StatRanges {
  const entries = STAT_FILTER_CONFIG.map(
    config => [config.field, [config.min, config.max]] as const
  )
  return Object.fromEntries(entries) as StatRanges
}

export function isStatRangeActive(
  config: StatFilterConfig,
  range: [number, number]
) {
  return range[0] > config.min || range[1] < config.max
}
