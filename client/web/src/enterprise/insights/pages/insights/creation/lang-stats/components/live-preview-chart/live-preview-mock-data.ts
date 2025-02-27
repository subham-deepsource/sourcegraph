import { random } from 'lodash'

import { PieChartContent } from '../../../../../../core/backend/code-insights-backend-types'

interface PreviewDatum {
    name: string
    value: number
    fill: string
}

export const DEFAULT_PREVIEW_MOCK: PieChartContent<PreviewDatum> = {
    data: [
        {
            name: 'Covered',
            value: 0.3,
            fill: 'var(--oc-grape-7)',
        },
        {
            name: 'Not covered',
            value: 0.7,
            fill: 'var(--oc-orange-7)',
        },
    ],
    getDatumName: datum => datum.name,
    getDatumColor: datum => datum.fill,
    getDatumValue: datum => datum.value,
}

export function getRandomLangStatsMock(): PieChartContent<PreviewDatum> {
    const randomFirstPieValue = random(0, 0.6)
    const randomSecondPieValue = 1 - randomFirstPieValue

    return {
        data: [
            {
                name: 'JavaScript',
                value: randomFirstPieValue,
                fill: 'var(--oc-grape-7)',
            },
            {
                name: 'Typescript',
                value: randomSecondPieValue,
                fill: 'var(--oc-orange-7)',
            },
        ],
        getDatumName: datum => datum.name,
        getDatumColor: datum => datum.fill,
        getDatumValue: datum => datum.value,
    }
}
