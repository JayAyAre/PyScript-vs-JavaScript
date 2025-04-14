# from flask import Flask, render_template
import plotly.graph_objs as go
import plotly.utils
import json

from pyscript import window, document
# from pyscript.js_modules import plotly_js

# app = Flask(__name__)
window.console.log("1-----")
print("hi!")

# Data for US presidential party control (simplified example)
data = {
    1960: "Democratic", 1961: "Democratic", 1962: "Democratic", 1963: "Democratic",
    1964: "Democratic", 1965: "Democratic", 1966: "Democratic", 1967: "Democratic",
    1968: "Democratic", 1969: "Republican", 1970: "Republican", 1971: "Republican",
    1972: "Republican", 1973: "Republican", 1974: "Republican", 1975: "Republican",
    1976: "Republican", 1977: "Democratic", 1978: "Democratic", 1979: "Democratic",
    1980: "Democratic", 1981: "Republican", 1982: "Republican", 1983: "Republican",
    1984: "Republican", 1985: "Republican", 1986: "Republican", 1987: "Republican",
    1988: "Republican", 1989: "Republican", 1990: "Republican", 1991: "Republican",
    1992: "Republican", 1993: "Democratic", 1994: "Democratic", 1995: "Democratic",
    1996: "Democratic", 1997: "Democratic", 1998: "Democratic", 1999: "Democratic",
    2000: "Democratic", 2001: "Republican", 2002: "Republican", 2003: "Republican",
    2004: "Republican", 2005: "Republican", 2006: "Republican", 2007: "Republican",
    2008: "Republican", 2009: "Democratic", 2010: "Democratic", 2011: "Democratic",
    2012: "Democratic", 2013: "Democratic", 2014: "Democratic", 2015: "Democratic",
    2016: "Democratic", 2017: "Republican", 2018: "Republican", 2019: "Republican",
    2020: "Republican", 2021: "Democratic", 2022: "Democratic", 2023: "Democratic",
    2024: "Democratic"
}


def index():
    years = list(data.keys())
    parties = list(data.values())

    trace = go.Scatter(
        x=years,
        y=parties,
        mode='lines+markers',
        name='US Presidential Party',
        line=dict(color='blue'),
        marker=dict(
            size=8,
            color=['blue' if party ==
                   'Democratic' else 'red' for party in parties],
            symbol=['circle' if party ==
                    'Democratic' else 'square' for party in parties]
        )
    )

    layout = go.Layout(
        title='US Presidential Party Control',
        xaxis=dict(title='Year'),
        yaxis=dict(title='Party', tickvals=['Democratic', 'Republican']),
        hovermode='closest'
    )

    fig = go.Figure(data=[trace], layout=layout)
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    window.console.log("1-----")
    window.console.log(graphJSON)
    window.console.log("2-----")
    plot = window.Plotly.newPlot("chart1", window.JSON.parse(graphJSON))

    # return render_template('index.html', graphJSON=graphJSON)
    # plot = js.Plotly.newPlot("chart1", js.JSON.parse(graphJSON))


index()
