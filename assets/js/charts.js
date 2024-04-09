const retailStackedBarChart = {
    chart: {
        type: 'column',
        renderTo: "retail-chart",
        plotBackgroundColor: null,
        plotBorderWidth: 0, //null,
        plotShadow: false,
        height: 400,
        fontSize: "1em"
    },
    title: {
        text: 'Retail Categories',
        align: 'left'
    },
    xAxis: {
        categories: ['2013'],
        labels: {
            style: {
                fontSize: '12px'
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Percent'
        }
    },
    tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}</b> <br/>',
        shared: true
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                format: '{point.percentage:.0f}%',
                style: {
                    fontSize: '12px'
                },
                showInLegend: false
            }
        }
    },
    series: [],
}

const webAndSocialChart = {
    chart: {
        renderTo: "web-and-social-chart",
        type: "column",
        plotBackgroundColor: null,
        plotBorderWidth: 0, //null,
        plotShadow: false,
        height: 300,
    },
    title: {
        text: ""
    },
    xAxis: {
        categories: ['Web 2013', 'Social 2013', 'Web 2020', 'Social 2020', 'Web 2022', 'Social 2022'],
        crosshair: true,
        accessibility: {
            description: 'Web or Social Years'
        }
    },
    yAxis: {
        min: 0,
        max: 100,
        labels: {
            format: '{value}%'
        },
        accessibility: {
            description: 'Share of retail with social or website'
        }
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: []
    // series: [
    //     {
    //         name: 'District Name',
    //         data: [20, 30, 25, 40, 34, 60]
    //     },
    //     {
    //         name: 'Retail District Average',
    //         data: [30, 33, 40, 35, 40, 40]
    //     }
    // ]
}

const banksChart = {
    chart: {
        renderTo: "bank-chart",
        type: "column",
        plotBackgroundColor: null,
        plotBorderWidth: 0, //null,
        plotShadow: false,
        height: 300,
    },
    title: {
        text: ""
    },
    xAxis: {
        categories: ['2013', '2020', '2022'],
        crosshair: true,
        accessibility: {
            description: 'Years'
        }
    },
    yAxis: {
        min: 0,
        accessibility: {
            description: 'Total bank branches'
        }
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: []
    // series: [
    //     {
    //         name: 'District Name',
    //         data: [3, 4, 4]
    //     },
    //     {
    //         name: 'Retail District Average',
    //         data: [6, 7, 8]
    //     }
    // ]
}

const retailTenancyChart = {
    chart: {
        type: 'column',
        renderTo: "tenancy-chart",
        plotBackgroundColor: null,
        plotBorderWidth: 0, //null,
        plotShadow: false,
        height: 400,
        fontSize: "1em"
    },
    title: {
        text: 'Retail Categories',
        align: 'left'
    },
    xAxis: {
        categories: ['District Name 2013', 'Retail District Average 2020', 'District Name 2020', 'Retail District Avergae 2020', 'District Name 2022', 'Retail District Average 2022'],
        labels: {
            style: {
                fontSize: '12px'
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Percent'
        }
    },
    tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}</b> <br/>',
        shared: true
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                format: '{point.percentage:.0f}%',
                style: {
                    fontSize: '12px'
                },
                showInLegend: false
            }
        }
    },
    series: []
    // series: [
    //     {
    //         name: 'Local',
    //         data: [15, 18, 20, 19, 25, 21]
    //     },
    //     {
    //         name: 'Chain',
    //         data: [85, 72, 80, 71, 75, 79]
    //     }
    // ],
}

export {retailStackedBarChart, banksChart, webAndSocialChart, retailTenancyChart}