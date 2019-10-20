class StaticPagesController < ApplicationController
  def index
    file  = File.read(Rails.root.join('example_trade.json'))
    @data = JSON.parse(file)

    @entry_level        = @data['entry_level']
    @exit_level         = @data['exit_level']
    @entry_timestamp    = DateTime.parse(@data['entry_timestamp']).to_i
    @exit_timestamp     = DateTime.parse(@data['exit_timestamp']).to_i
    @stop_loss_level    = @data['stop_loss_level']
    @buy_sell           = @data['buy_sell']
    @indicators         = @data['indicators']
    @chart_data         = @data['chart_data']
  end
end
