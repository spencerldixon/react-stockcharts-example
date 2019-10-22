import React from 'react'
import PropTypes from 'prop-types'
import { timeFormat } from 'd3-time-format'
import { format } from 'd3-format'
import moment from 'moment'

import { PriceCoordinate } from 'react-stockcharts/lib/coordinates'
import { TypeChooser } from 'react-stockcharts/lib/helper'
import {
	buyPath,
	sellPath,
	Label,
	SvgPathAnnotation,
	Annotate
} from 'react-stockcharts/lib/annotation'
import { ChartCanvas, Chart } from 'react-stockcharts'
import {
	BarSeries,
	StraightLine,
	AreaSeries,
	CandlestickSeries,
	LineSeries,
	BollingerSeries,
	MACDSeries,
	RSISeries
} from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY
} from 'react-stockcharts/lib/coordinates'

import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
import {
	OHLCTooltip,
	MovingAverageTooltip,
	BollingerBandTooltip,
	MACDTooltip,
	RSITooltip,
	SingleValueTooltip
} from 'react-stockcharts/lib/tooltip'
import { ema, wma, rsi, sma, atr, tma, macd, bollingerBand } from 'react-stockcharts/lib/indicator'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { last } from 'react-stockcharts/lib/utils'

const macdAppearance = {
	stroke: {
		macd: '#FF0000',
		signal: '#00F300'
	},
	fill: {
		divergence: '#4682B4'
	}
}
const mouseEdgeAppearance = {
	textFill: '#542605',
	stroke: '#05233B',
	strokeOpacity: 1,
	strokeWidth: 3,
	arrowWidth: 5,
	fill: '#BCDEFA'
}
const bbStroke = {
	top: '#964B00',
	middle: '#000000',
	bottom: '#964B00'
}

const bbFill = '#4682B4'

class Stocks extends React.Component {
	constructor(props) {
		super(props)
		this.state = { ...this.props.indicators }
	}

	render() {
		// console.log(this.props)

		const indicatorControllers = Object.keys(this.props.indicators).map((x, i) => (
			<label key={i + '_indicator_controller'} style={{ margin: 10 }}>
				<input
					type='checkbox'
					checked={this.state[x]}
					name={x + '_indicator'}
					onChange={e => {
						this.setState({ [x]: e.target.checked })
					}}
				/>
				<span style={{ fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>{x}</span>
			</label>
		))

		const bb = bollingerBand()
			.merge((d, c) => {
				d.bb = c
			})
			.accessor(d => d.bb)

		const rsiCalculator = rsi()
			.options({ windowSize: 14 })
			.merge((d, c) => {
				d.rsi = c
			})
			.accessor(d => d.rsi)

		const atr14 = atr()
			.options({ windowSize: 14 })
			.merge((d, c) => {
				d.atr14 = c
			})
			.accessor(d => d.atr14)

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9
			})
			.merge((d, c) => {
				d.macd = c
			})
			.accessor(d => d.macd)

		const tma20 = tma()
			.options({ windowSize: 20 })
			.merge((d, c) => {
				d.tma20 = c
			})
			.accessor(d => d.tma20)

		const ema50 = ema()
			.options({ windowSize: 50 })
			.merge((d, c) => {
				d.ema50 = c
			})
			.accessor(d => d.ema50)

		const ema8 = ema()
			.options({ windowSize: 8 })
			.merge((d, c) => {
				d.ema8 = c
			})
			.accessor(d => d.ema8)

		const ema21 = ema()
			.options({ windowSize: 21 })
			.merge((d, c) => {
				d.ema21 = c
			})
			.accessor(d => d.ema21)

		const smaVolume50 = sma()
			.options({ windowSize: 20, sourcePath: 'volume' })
			.merge((d, c) => {
				d.smaVolume50 = c
			})
			.accessor(d => d.smaVolume50)
			.stroke('#4682B4')
			.fill('#4682B4')

		const { type, width, ratio } = this.props
		const initialData = this.props.chart_data.map(d => {
			return {
				date: new Date(parseInt(d.timestamp * 1000)),
				open: +d.open,
				high: +d.high,
				low: +d.low,
				close: +d.close,
				volume: +d.volume
			}
		})
		const movingAverageTooltip = []
		this.state['8ema'] &&
			movingAverageTooltip.push({
				yAccessor: ema8.accessor(),
				type: 'EMA',
				stroke: ema8.stroke(),
				windowSize: ema8.options().windowSize,
				echo: 'some echo here'
			})
		this.state['20tma'] &&
			movingAverageTooltip.push({
				yAccessor: tma20.accessor(),
				type: 'TMA',
				stroke: tma20.stroke(),
				windowSize: tma20.options().windowSize,
				echo: 'some echo here'
			})
		this.state['21ema'] &&
			movingAverageTooltip.push({
				yAccessor: ema21.accessor(),
				type: 'EMA',
				stroke: ema21.stroke(),
				windowSize: ema21.options().windowSize,
				echo: 'some echo here'
			})
		this.state['50ema'] &&
			movingAverageTooltip.push({
				yAccessor: ema50.accessor(),
				type: 'EMA',
				stroke: ema50.stroke(),
				windowSize: ema50.options().windowSize,
				echo: 'some echo here'
			})

		const calculatedData = ema8(
			ema21(tma20(ema50(smaVolume50(macdCalculator(rsiCalculator(atr14(bb(initialData))))))))
		)
		const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date)
		const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData)

		const start = xAccessor(last(data))
		const end = xAccessor(data[Math.max(0, data.length - 150)])
		const xExtents = [start, end]

		const entryAnnotationProps = {
			fill: '#006517',
			path: sellPath,
			y: ({ yScale }) => yScale(+this.props.entry_level),
			tooltip: d => 'Entry Level ' + timeFormat('%d %B')(d.date)
		}
		const exitAnnotationProps = {
			fill: '#FF0000',
			path: buyPath,
			y: ({ yScale }) => yScale(+this.props.exit_level),
			tooltip: d => 'Exit Level ' + timeFormat('%d %B')(d.date)
		}

		return (
			<>
				{indicatorControllers}
				<ChartCanvas
					height={
						1300
						// Object.keys(this.props.indicators).filter(
						//   x => this.state[x] && (x === 'macd' || x === 'rsi' || x === 'atr' || x === 'volume')
						// ).length * 350
					}
					width={width}
					ratio={ratio}
					margin={{ left: 70, right: 70, top: 10, bottom: 30 }}
					type={type}
					seriesName='MSFT'
					data={data}
					xScale={xScale}
					xAccessor={xAccessor}
					displayXAccessor={displayXAccessor}
					xExtents={xExtents}
				>
					<Chart
						id={1}
						height={300}
						yExtents={[
							d => [d.high, d.low],
							tma20.accessor(),
							ema8.accessor(),
							ema21.accessor(),
							ema50.accessor(),
							bb.accessor()
						]}
						padding={{ top: 10, bottom: 20 }}
					>
						<XAxis axisAt='bottom' orient='bottom' />
						<YAxis axisAt='right' orient='right' ticks={5} />

						<MouseCoordinateX at='bottom' orient='bottom' displayFormat={timeFormat('%Y-%m-%d')} />
						<MouseCoordinateY at='right' orient='right' displayFormat={format('.2f')} />

						<CandlestickSeries />
						{this.state['20tma'] && (
							<LineSeries yAccessor={tma20.accessor()} stroke={tma20.stroke()} />
						)}
						{this.state['50ema'] && (
							<LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />
						)}
						{this.state['8ema'] && (
							<LineSeries yAccessor={ema8.accessor()} stroke={ema8.stroke()} />
						)}
						{this.state['21ema'] && (
							<LineSeries yAccessor={ema21.accessor()} stroke={ema21.stroke()} />
						)}
						{this.state['bb'] && (
							<BollingerSeries yAccessor={d => d.bb} stroke={bbStroke} fill={bbFill} />
						)}

						{this.state['20tma'] && (
							<CurrentCoordinate yAccessor={tma20.accessor()} fill={tma20.stroke()} />
						)}
						{this.state['50ema'] && (
							<CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />
						)}
						{this.state['8ema'] && (
							<CurrentCoordinate yAccessor={ema8.accessor()} fill={ema8.stroke()} />
						)}
						{this.state['21ema'] && (
							<CurrentCoordinate yAccessor={ema21.accessor()} fill={ema21.stroke()} />
						)}

						<OHLCTooltip origin={[-40, 0]} />
						<Annotate
							with={SvgPathAnnotation}
							when={d => {
								return (
									timeFormat('%Y-%m-%d')(d.date) ===
									moment.unix(this.props.entry_timestamp).format('YYYY-MM-DD')
								)
							}}
							usingProps={entryAnnotationProps}
						/>
						<Annotate
							with={SvgPathAnnotation}
							when={d => {
								return (
									timeFormat('%Y-%m-%d')(d.date) ===
									moment.unix(this.props.exit_timestamp).format('YYYY-MM-DD')
								)
							}}
							usingProps={exitAnnotationProps}
						/>
						{/* <StraightLine type='vertical' noHover xValue={100} stroke={'green'} strokeWidth={1} /> */}
						<MovingAverageTooltip
							onClick={e => console.log(e)}
							origin={[-38, 15]}
							options={movingAverageTooltip}
						/>
						{this.state['bb'] && (
							<BollingerBandTooltip
								origin={[-38, 60]}
								yAccessor={d => d.bb}
								options={bb.options()}
							/>
						)}
						<PriceCoordinate
							at='left'
							orient='left'
							price={+this.props.stop_loss_level}
							stroke='#3490DC'
							strokeWidth={2}
							opacity={0.8}
							fill='blue'
							textFill='#fff'
							arrowWidth={0}
							strokeDasharray='ShortDash'
							displayFormat={format('.2f')}
						/>
					</Chart>
					{this.state['volume'] && (
						<Chart
							id={2}
							yExtents={[d => d.volume, smaVolume50.accessor()]}
							height={150}
							origin={(w, h) => [0, h - 900]}
						>
							<YAxis axisAt='left' orient='left' ticks={5} tickFormat={format('.2s')} />

							<MouseCoordinateX
								at='bottom'
								orient='bottom'
								displayFormat={timeFormat('%Y-%m-%d')}
							/>
							<MouseCoordinateY at='left' orient='left' displayFormat={format('.4s')} />

							<BarSeries
								yAccessor={d => d.volume}
								fill={d => (d.close > d.open ? '#6BA583' : 'red')}
							/>
							<AreaSeries
								yAccessor={smaVolume50.accessor()}
								stroke={smaVolume50.stroke()}
								fill={smaVolume50.fill()}
							/>
							<CurrentCoordinate yAccessor={smaVolume50.accessor()} fill={smaVolume50.stroke()} />
							<CurrentCoordinate yAccessor={d => d.volume} fill='#9B0A47' />
						</Chart>
					)}
					{this.state['macd'] && (
						<Chart
							id={3}
							height={150}
							yExtents={macdCalculator.accessor()}
							origin={(w, h) => [0, h - 700]}
							padding={{ top: 10, bottom: 10 }}
						>
							<XAxis axisAt='bottom' orient='bottom' />
							<YAxis axisAt='right' orient='right' ticks={2} />

							<MouseCoordinateX
								at='bottom'
								orient='bottom'
								displayFormat={timeFormat('%Y-%m-%d')}
								rectRadius={5}
								{...mouseEdgeAppearance}
							/>
							<MouseCoordinateY
								at='right'
								orient='right'
								displayFormat={format('.2f')}
								{...mouseEdgeAppearance}
							/>

							<MACDSeries yAccessor={d => d.macd} {...macdAppearance} />
							<MACDTooltip
								origin={[-38, 15]}
								yAccessor={d => d.macd}
								options={macdCalculator.options()}
								appearance={macdAppearance}
							/>
						</Chart>
					)}
					{this.state['rsi'] && (
						<Chart id={4} yExtents={[0, 100]} height={150} origin={(w, h) => [0, h - 200]}>
							<XAxis axisAt='bottom' orient='bottom' showTicks={false} outerTickSize={0} />
							<YAxis axisAt='right' orient='right' tickValues={[30, 50, 70]} />
							<MouseCoordinateY at='right' orient='right' displayFormat={format('.2f')} />

							<RSISeries yAccessor={d => d.rsi} />

							<RSITooltip
								origin={[-38, 15]}
								yAccessor={d => d.rsi}
								options={rsiCalculator.options()}
							/>
						</Chart>
					)}
					{this.state['atr'] && (
						<Chart
							id={5}
							yExtents={atr14.accessor()}
							height={150}
							origin={(w, h) => [0, h - 400]}
							padding={{ top: 10, bottom: 10 }}
						>
							<XAxis axisAt='bottom' orient='bottom' />
							<YAxis axisAt='right' orient='right' ticks={2} />

							<MouseCoordinateX
								at='bottom'
								orient='bottom'
								displayFormat={timeFormat('%Y-%m-%d')}
							/>
							<MouseCoordinateY at='right' orient='right' displayFormat={format('.2f')} />

							<LineSeries yAccessor={atr14.accessor()} stroke={atr14.stroke()} />
							<SingleValueTooltip
								yAccessor={atr14.accessor()}
								yLabel={`ATR (${atr14.options().windowSize})`}
								yDisplayFormat={format('.2f')}
								/* valueStroke={atr14.stroke()} - optional prop */
								/* labelStroke="#4682B4" - optional prop */
								origin={[-40, 15]}
							/>
						</Chart>
					)}
					<CrossHairCursor />
				</ChartCanvas>
			</>
		)
	}
}

Stocks.propTypes = {
	chart_data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(['svg', 'hybrid']).isRequired
}

Stocks.defaultProps = {
	type: 'svg'
}
Stocks = fitWidth(Stocks)

export default Stocks
