# React Stockcharts Example

## Installation

1. Install Rails
2. Fork the project and make a local copy
3. `cd react_stockcharts_example`
4. `yarn install`
5. `bundle install`
6. run `rails s` to start the server (CTRL + C to stop it)
7. in a separate window, run `./bin/webpack-dev-server` to pick up react changes without having to reload the page
8. head to `https://localhost:3000` to see the sample page

## Brief

Using the react-stockcharts library at https://github.com/rrag/react-stockcharts set up a react component that can render the given data, as well as toggle on and off specific indicators by passing in true/false in the indicators object provided. We should be able to add future indicators easily somewhere too. For example, if I decided later on to add a 31 day exponential moving average (ema indicator with 31 day setting), I should be able to define this somewhere in the react component as `ema31` and then pass `{ema31: true}` into the indicators props and have this show up on the chart. Chart should also have annotations showing the entry and exit point of the trade.

I've already installed react-stockcharts into this project with yarn, so you should be good to go.

Please comment and document where necessary, you can add to this readme if you like!

## How it works

Example chart data for a trade is loaded into `example_trade.json` in the root of the project.

I'm loading this into the `app/controllers/static_pages_controller` and separating the data into instance variables (those things with an @ at the front). Anything marked as an instance variables (@) is automatically available in the corresponding view file located at: `app/views/static_pages/index.html.erb`. This is where the HTML for the page lives. It's a simple page with two boxes, the bottom is just outputting the data for easy reference, and the top will be where the chart goes and is currently rendering a sample react component set up in `app/javascript/components/charts/Stocks.js`. This file is where you will need to add your javascript.

The component at the moment has all the vital information passed into it's props and is using them to set the state, and render them back out on the page as an example. Feel free to change this to however you think is best.
