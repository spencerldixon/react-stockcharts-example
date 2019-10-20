import React from "react"
import PropTypes from "prop-types"

class Stocks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entry_level: this.props.entry_level,
      exit_level: this.props.exit_level,
      entry_timestamp: this.props.entry_timestamp,
      exit_timestamp: this.props.exit_timestamp,
      stop_loss_level: this.props.stop_loss_level,
      buy_sell: this.props.buy_sell,
      indicators: this.props.indicators,
      chart_data: this.props.chart_data
    };
  }

  render () {
    return (
      <React.Fragment>
        <div>
          <p>Entry level: {this.state.entry_level}</p>
          <p>Exit level: {this.state.exit_level}</p>
          <p>Entry timestamp: {this.state.entry_timestamp}</p>
          <p>Exit timestamp: {this.state.exit_timestamp}</p>
          <p>Stop loss level: {this.state.stop_loss_level}</p>
          <p>Buy / sell: {this.state.buy_sell}</p>
        </div>
      </React.Fragment>
    );
  }
}

export default Stocks
