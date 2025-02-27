import { formatISO } from 'date-fns'
import { LineChartContent } from 'sourcegraph'

import { buildSearchURLQuery } from '@sourcegraph/shared/src/util/url'

import { InsightDataSeries, SearchPatternType } from '../../../../../graphql-operations'
import { semanticSort } from '../../../../../insights/utils/semantic-sort'
import { PageRoutes } from '../../../../../routes.constants'
import { InsightFilters, SearchBasedInsightSeries } from '../../types'

interface SeriesDataset {
    dateTime: number
    [seriesKey: string]: number
}

/**
 * Minimal input type model for {@link createLineChartContent} function
 */
export type InsightDataSeriesData = Pick<InsightDataSeries, 'seriesId' | 'label' | 'points'>

/**
 * Generates line chart content for visx chart. Note that this function relies on the fact that
 * all series are indexed. This generator is used only for GQL api, only there we have indexed series
 * for setting-based api see {@link createLineChartContent}
 *
 * @param series - insight series with points data
 * @param seriesDefinition - insight definition with line settings (color, name, query)
 * @param filters - insight drill-down filters
 */
export function createLineChartContent(
    series: InsightDataSeriesData[],
    seriesDefinition: SearchBasedInsightSeries[] = [],
    filters?: InsightFilters
): LineChartContent<SeriesDataset, 'dateTime'> {
    const definitionMap = Object.fromEntries<SearchBasedInsightSeries>(
        seriesDefinition.map(definition => [definition.id, definition])
    )

    const { includeRepoRegexp = '', excludeRepoRegexp = '' } = filters ?? {}

    return {
        chart: 'line',
        data: getDataPoints(series),
        series: series
            .map(line => ({
                name: definitionMap[line.seriesId]?.name ?? line.label,
                dataKey: line.seriesId,
                stroke: definitionMap[line.seriesId]?.stroke,
                linkURLs: Object.fromEntries(
                    [...line.points]
                        .sort((a, b) => Date.parse(a.dateTime) - Date.parse(b.dateTime))
                        .map((point, index, points) => {
                            const previousPoint = points[index - 1]
                            const date = Date.parse(point.dateTime)

                            // Use formatISO instead of toISOString(), because toISOString() always outputs UTC.
                            // They mark the same point in time, but using the user's timezone makes the date string
                            // easier to read (else the date component may be off by one day)
                            const after = previousPoint ? formatISO(Date.parse(previousPoint.dateTime)) : ''
                            const before = formatISO(date)

                            const includeRepoFilter = includeRepoRegexp ? `repo:${includeRepoRegexp}` : ''
                            const excludeRepoFilter = excludeRepoRegexp ? `-repo:${excludeRepoRegexp}` : ''

                            const repoFilter = `${includeRepoFilter} ${excludeRepoFilter}`
                            const afterFilter = after ? `after:${after}` : ''
                            const beforeFilter = `before:${before}`
                            const dateFilters = `${afterFilter} ${beforeFilter}`
                            const diffQuery = `${repoFilter} type:diff ${dateFilters} ${
                                definitionMap[line.seriesId].query
                            }`
                            const searchQueryParameter = buildSearchURLQuery(
                                diffQuery,
                                SearchPatternType.literal,
                                false
                            )

                            return [date, `${window.location.origin}${PageRoutes.Search}?${searchQueryParameter}`]
                        })
                ),
            }))
            .sort((a, b) => semanticSort(a.name, b.name)),
        xAxis: {
            dataKey: 'dateTime',
            scale: 'time',
            type: 'number',
        },
    }
}

/**
 * Groups data series by dateTime (x axis) of each series
 */
export function getDataPoints(series: InsightDataSeriesData[]): SeriesDataset[] {
    const dataByXValue = new Map<string, SeriesDataset>()

    for (const line of series) {
        for (const point of line.points) {
            let dataObject = dataByXValue.get(point.dateTime)
            if (!dataObject) {
                dataObject = {
                    dateTime: Date.parse(point.dateTime),
                    // Initialize all series to null (empty chart) value
                    ...Object.fromEntries(series.map(line => [line.seriesId, null])),
                }
                dataByXValue.set(point.dateTime, dataObject)
            }
            dataObject[line.seriesId] = point.value
        }
    }

    return [...dataByXValue.values()]
}
