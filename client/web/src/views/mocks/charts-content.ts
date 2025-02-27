import { LineChartContent } from 'sourcegraph'

import { semanticSort } from '../../insights/utils/semantic-sort'

export const LINE_CHART_CONTENT_MOCK: LineChartContent<any, string> = {
    chart: 'line',
    data: [
        { x: 1588965700286 - 4 * 24 * 60 * 60 * 1000, a: 4000, b: 15000 },
        { x: 1588965700286 - 3 * 24 * 60 * 60 * 1000, a: 4000, b: 26000 },
        { x: 1588965700286 - 2 * 24 * 60 * 60 * 1000, a: 5600, b: 20000 },
        { x: 1588965700286 - 1 * 24 * 60 * 60 * 1000, a: 9800, b: 19000 },
        { x: 1588965700286, a: 12300, b: 17000 },
    ],
    series: [
        {
            dataKey: 'a',
            name: 'A metric',
            stroke: 'var(--warning)',
            linkURLs: {
                [1588965700286 - 4 * 24 * 60 * 60 * 1000]: '#A:1st_data_point',
                [1588965700286 - 3 * 24 * 60 * 60 * 1000]: '#A:2st_data_point',
                [1588965700286 - 3 * 24 * 60 * 60 * 1000]: '#A:3rd_data_point',
                [1588965700286 - 2 * 24 * 60 * 60 * 1000]: '#A:4th_data_point',
                [1588965700286 - 1 * 24 * 60 * 60 * 1000]: '#A:5th_data_point',
            },
        },
        {
            dataKey: 'b',
            name: 'B metric',
            stroke: 'var(--warning)',
        },
    ].sort((a, b) => semanticSort(a.name, b.name)),
    xAxis: {
        dataKey: 'x',
        scale: 'time',
        type: 'number',
    },
}

export const LINE_CHART_TESTS_CASES_EXAMPLE: LineChartContent<any, string> = {
    chart: 'line',
    data: [
        { x: 1588965700286 - 4 * 24 * 60 * 60 * 1000, a: 4000, b: 15000, c: 12000, d: 11000, f: 13000 },
        { x: 1588965700286 - 3 * 24 * 60 * 60 * 1000, a: 4000, b: 26000, c: 14000, d: 11000, f: 5000 },
        { x: 1588965700286 - 2 * 24 * 60 * 60 * 1000, a: 5600, b: 20000, c: 15000, d: 13000, f: 63000 },
        { x: 1588965700286 - 1 * 24 * 60 * 60 * 1000, a: 9800, b: 19000, c: 9000, d: 8000, f: 13000 },
        { x: 1588965700286, a: 12300, b: 17000, c: 8000, d: 8500, f: 16000 },
    ],
    series: [
        {
            dataKey: 'a',
            name: 'React Test renderer',
            stroke: 'var(--blue)',
            linkURLs: {
                [1588965700286 - 4 * 24 * 60 * 60 * 1000]: '#A:1st_data_point',
                [1588965700286 - 3 * 24 * 60 * 60 * 1000]: '#A:2st_data_point',
                [1588965700286 - 3 * 24 * 60 * 60 * 1000]: '#A:3rd_data_point',
                [1588965700286 - 2 * 24 * 60 * 60 * 1000]: '#A:4th_data_point',
                [1588965700286 - 1 * 24 * 60 * 60 * 1000]: '#A:5th_data_point',
            },
        },
        {
            dataKey: 'b',
            name: 'Enzyme',
            stroke: 'var(--pink)',
        },
        {
            dataKey: 'c',
            name: 'React Testing Library',
            stroke: 'var(--red)',
        },
    ].sort((a, b) => semanticSort(a.name, b.name)),
    xAxis: {
        dataKey: 'x',
        scale: 'time',
        type: 'number',
    },
}

export const LINE_CHART_WITH_MANY_LINES: LineChartContent<any, string> = {
    chart: 'line',
    data: [
        { x: 1588965700286 - 4 * 24 * 60 * 60 * 1000, a: 4000, b: 15000, c: 12000, d: 11000, f: 13000 },
        { x: 1588965700286 - 3 * 24 * 60 * 60 * 1000, a: 4000, b: 26000, c: 14000, d: 11000, f: 5000 },
        { x: 1588965700286 - 2 * 24 * 60 * 60 * 1000, a: 5600, b: 20000, c: 15000, d: 13000, f: 63000 },
        { x: 1588965700286 - 1 * 24 * 60 * 60 * 1000, a: 9800, b: 19000, c: 9000, d: 8000, f: 13000 },
        { x: 1588965700286, a: 12300, b: 17000, c: 8000, d: 8500, f: 16000 },
    ],
    series: [
        {
            dataKey: 'a',
            name: 'React functional components',
            stroke: 'var(--warning)',
            linkURLs: {
                [1588965700286 - 4 * 24 * 60 * 60 * 1000]: '#A:1st_data_point',
                [1588965700286 - 3 * 24 * 60 * 60 * 1000]: '#A:2st_data_point',
                [1588965700286 - 3 * 24 * 60 * 60 * 1000]: '#A:3rd_data_point',
                [1588965700286 - 2 * 24 * 60 * 60 * 1000]: '#A:4th_data_point',
                [1588965700286 - 1 * 24 * 60 * 60 * 1000]: '#A:5th_data_point',
            },
        },
        {
            dataKey: 'b',
            name: 'Class components',
            stroke: 'var(--warning)',
        },
        { dataKey: 'c', name: 'useTheme adoption', stroke: 'var(--blue)' },
        { dataKey: 'd', name: 'Class without CSS modules', stroke: 'var(--purple)' },
        { dataKey: 'f', name: 'Functional components without CSS modules', stroke: 'var(--green)' },
    ].sort((a, b) => semanticSort(a.name, b.name)),
    xAxis: {
        dataKey: 'x',
        scale: 'time',
        type: 'number',
    },
}

export const LINE_CHART_WITH_HUGE_NUMBER_OF_LINES: LineChartContent<any, string> = {
    chart: 'line',
    data: [
        {
            x: 1588965700286 - 4 * 24 * 60 * 60 * 1000,
            a: 4000,
            b: 15000,
            c: 12000,
            d: 11000,
            e: 11000,
            f: 13000,
            g: 5000,
            h: 5000,
            i: 5000,
            j: 7000,
            k: 10000,
            l: 8000,
            m: 3900,
            n: 3000,
            o: 4000,
            p: 5000,
            q: 4500,
            r: 5000,
            s: 5500,
            t: 6000,
        },
        {
            x: 1588965700286 - 3 * 24 * 60 * 60 * 1000,
            a: 4000,
            b: 17000,
            c: 14000,
            d: 11000,
            e: 11000,
            f: 5000,
            g: 5000,
            h: 6000,
            i: 5500,
            j: 7200,
            k: 8000,
            l: 7800,
            m: 4000,
            n: 3000,
            o: 4500,
            p: 5500,
            q: 5500,
            r: 6000,
            s: 7500,
            t: 5000,
        },
        {
            x: 1588965700286 - 2 * 24 * 60 * 60 * 1000,
            a: 5600,
            b: 20000,
            c: 15000,
            d: 13000,
            e: null,
            f: 23000,
            g: 8000,
            h: 7000,
            i: 4500,
            j: 11000,
            k: 10000,
            l: 9000,
            m: 5000,
            n: 3000,
            o: 4000,
            p: 5000,
            q: 4500,
            r: 5000,
            s: 5500,
            t: 6000,
        },
        {
            x: 1588965700286 - 1 * 24 * 60 * 60 * 1000,
            a: 9800,
            b: 19000,
            c: 9000,
            d: 8000,
            e: null,
            f: 13000,
            g: 5000,
            h: 6000,
            i: 5500,
            j: 7200,
            k: 8000,
            l: 7800,
            m: 4000,
            n: 4000,
            o: 5000,
            p: 4000,
            q: 7500,
            r: 8000,
            s: 8500,
            t: 4000,
        },
        {
            x: 1588965700286,
            a: 12300,
            b: 17000,
            c: 8000,
            d: 8500,
            e: null,
            f: 16000,
            g: 9000,
            h: 8000,
            i: 5500,
            j: 12000,
            k: 11000,
            l: 10000,
            m: 6000,
            n: 6000,
            o: 7000,
            p: 8000,
            q: 6500,
            r: 9000,
            s: 10500,
            t: 16000,
        },
    ],
    series: [
        {
            dataKey: 'a',
            name: 'React functional components',
            stroke: 'var(--green)',
        },
        {
            dataKey: 'b',
            name: 'Class components',
            stroke: 'var(--orange)',
        },
        { dataKey: 'c', name: 'useTheme adoption', stroke: 'var(--blue)' },
        { dataKey: 'd', name: 'Class without CSS modules', stroke: 'var(--purple)' },
        { dataKey: 'e', name: '1.11', stroke: 'var(--oc-grape-7)' },
        { dataKey: 'f', name: 'Functional components without CSS modules', stroke: 'var(--oc-red-7)' },
        { dataKey: 'g', name: '1.12', stroke: 'var(--pink)' },
        { dataKey: 'h', name: '1.13', stroke: 'var(--oc-violet-7)' },
        { dataKey: 'i', name: '1.14', stroke: 'var(--indigo)' },
        { dataKey: 'm', name: '1.15', stroke: 'var(--cyan)' },
        { dataKey: 'j', name: '1.16', stroke: 'var(--teal)' },
        { dataKey: 'k', name: '1.17', stroke: 'var(--oc-lime-7)' },
        { dataKey: 'l', name: '1.18', stroke: 'var(--yellow)' },
        { dataKey: 'n', name: '1.19', stroke: 'var(--oc-lime-7)' },
        { dataKey: 'o', name: '1.20', stroke: 'var(--oc-pink-7)' },
        { dataKey: 'p', name: '1.21', stroke: 'var(--oc-red-7)' },
        { dataKey: 'q', name: '1.22', stroke: 'var(--oc-blue-7)' },
        { dataKey: 'r', name: '1.23', stroke: 'var(--oc-grape-7)' },
        { dataKey: 's', name: '1.24', stroke: 'var(--oc-green-7)' },
        { dataKey: 't', name: '1.25', stroke: 'var(--oc-cyan-7)' },
    ].sort((a, b) => semanticSort(a.name, b.name)),
    xAxis: {
        dataKey: 'x',
        scale: 'time',
        type: 'number',
    },
}

export const LINE_CHART_CONTENT_MOCK_EMPTY: LineChartContent<any, string> = {
    chart: 'line',
    data: [],
    series: [
        {
            dataKey: 'a',
            name: 'A metric',
            stroke: 'var(--warning)',
        },
        {
            dataKey: 'b',
            name: 'B metric',
            stroke: 'var(--warning)',
        },
    ].sort((a, b) => semanticSort(a.name, b.name)),
    xAxis: {
        dataKey: 'x',
        scale: 'time',
        type: 'number',
    },
}
