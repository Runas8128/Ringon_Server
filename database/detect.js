const { ChatInputCommandInteraction } = require('discord.js');
const { config } = require('../config');
const { _load } = require('./_load');
const { catch_timeout } = require('../util/notion');
const Logger = require('../util/Logger');
const logger = Logger.getLogger(__filename);

/**
 * @param {Array<T>} targets
 * @param {Array<number>} weights
 * @returns {T}
 */
function select_weight(targets, weights) {
  const total_weight = weights.reduce((prev, curr) => prev + curr, 0);
  const weighted_random = Math.random() * total_weight;
  const last_index = targets.length - 1;
  let current_weight = 0;

  for (let i = 0; i < last_index; ++i) {
    current_weight += weights[i];
    if (weighted_random < current_weight) {
      return targets[i];
    }
  }

  return targets[last_index];
}

/**
 *  @typedef FullDetectObj
 *    @property {string} target
 *    @property {string} result
 *
 *  @typedef ProbDetectObj
 *    @property {string} target
 *    @property {string} result
 *    @property {number} ratio
 */
class Detect {
  constructor() {
    this.last_sync = 0;

    this.id_map = config.id.notion.detect;

    /** @type {FullDetectObj[]} */
    this.full = [];
    /** @type {ProbDetectObj[]} */
    this.prob = [];
  }

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async load(interaction) {
    const sync_start = Date.now();
    if (sync_start - this.last_sync <= 60 * 60 * 1000) return;

    await catch_timeout(interaction, async () => {
      this.full = await _load(
        this.id_map.full,
        { name: 'target', type: 'title' },
        { name: 'result', type: 'rich_text' },
      );

      this.prob = await _load(
        this.id_map.prob,
        { name: 'target', type: 'title' },
        { name: 'result', type: 'rich_text' },
        { name: 'ratio', type: 'number' },
      );

      this.last_sync = Date.now();
      logger.info(`syncing success. time duration: ${this.last_sync - sync_start}ms`);
    });
  }

  /**
   * @param {string} target
   * @return {string?}
   */
  get_result(target) {
    const full_detect = this.full.find((obj) => obj.target == target);
    if (full_detect) {
      return full_detect.result;
    }

    const prob_detect = this.prob.filter((obj) => obj.target == target);
    if (prob_detect) {
      const result_list = prob_detect.map((obj) => obj.result);
      const ratio_list = prob_detect.map((obj) => obj.ratio);
      return select_weight(result_list, ratio_list);
    }

    return null;
  }
}

module.exports = Detect;
