import {Component, Prop, State} from '@stencil/core';
import {Block} from "./Block";

@Component({
  tag: 'aion-blocks',
  styleUrl: 'aion-blocks.scss',
  shadow: true
})
export class AionBlocks {
  @Prop() duration: number;

  @Prop() limit: number;

  @Prop() gqlUrl: string;

  @State() blocks: Block[] = [];

  // blocks(first: 10, before: 1529873) {
  BLOCKS_QUERY: string =  `
    query blocks($first: Long) {
     blockApi {
      blocks(first: $first) {
        number
        hash
        parentHash
        nrgLimit
        nrgConsumed
        timestamp
        txDetails {
          from
          to
          value
          txHash
        }
      }
    }
  }
  `
  constructor() {

  }

  componentDidLoad() {
    this.fetchBlocks();

    let duration = this.duration;

    //Less than 10 sec should not be allowed
    if(this.duration < 10)
      duration = 10;

    setInterval(() => {
      this.fetchBlocks();

    }, duration * 1000);
  }

  private fetchBlocks() {
    fetch(this.gqlUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"query": this.BLOCKS_QUERY, "variables": {"first": this.limit}}),
    })
      .then(res => res.json())
      .then(res => {
        console.log("fetched");

        if(this.blocks)
          this.blocks.splice(0, this.blocks.length)

        let fetchedBlocks = ((res["data"])["blockApi"])["blocks"] as [Block];
        this.blocks = fetchedBlocks.map(b => {
          let date = new Date(b.timestamp * 1000);
          b.date = date;

          return b;
        })

      });
  }

  render() {
    return (
      <div class="o-container o-container--medium u-text">
        {this.blocks.map((blk) =>
          <div  class="c-card u-highest">
            <div class="c-card__item c-card__item--brand">#{blk.number}
            <span class="u-small">{blk.date.toDateString()} {blk.date.toLocaleTimeString()}</span>
              <div class="u-small">
                <a href={"https://mainnet.aion.network/#/block/" + blk.number} target="_blank">
                  <i> 0x{blk.hash}&nbsp;</i>
                </a>
              </div>
            </div>

            <div class="c-card-body">
              <div class="o-panel-container">
              <ol class="c-list  u-small">
                {blk.txDetails.map( (tx, index) => {

                    return (

                      <li class="c-list__item" key={index}>
                        <div class="o-grid ">
                          <div class="o-grid__cell o-grid__cell--width-20">
                            Tx Hash
                          </div>
                          <div class="o-grid__cell">

                            <a href={"https://mainnet.aion.network/#/transaction/" + tx.txHash} target="_blank">

                              {tx.txHash}&nbsp;
                            </a>
                          </div>
                        </div>
                        <div class="o-grid">
                          <div class="o-grid__cell o-grid__cell--width-20">
                            From
                          </div>
                          <div class="o-grid__cell">
                            0x{tx.from}
                          </div>
                        </div>
                        <div class="o-grid ">
                          <div class="o-grid__cell o-grid__cell--width-20">
                            To
                          </div>
                          <div class="o-grid__cell">
                            0x{tx.to}
                          </div>
                        </div>
                        <div class="o-grid ">
                          <div class="o-grid__cell o-grid__cell--width-20">
                            Value
                          </div>
                          <div class="o-grid__cell">
                            {tx.value / Math.pow(10, 18)} AION
                          </div>
                        </div>
                      </li>
                    );
                  }

                )}

              </ol>
              </div>
            </div>
          </div>
        )}
      </div>

    );
  }
}
