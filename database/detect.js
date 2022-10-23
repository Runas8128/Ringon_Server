const { config } = require('../config');
const Notion = require('../util/Notion');

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
    this.id_map = config.notion.detect;
    this.full_db = new Notion.Database(this.id_map.full);
    this.prob_db = new Notion.Database(this.id_map.prob);

    /** @type {FullDetectObj[]} */
    this.full = [];
    /** @type {ProbDetectObj[]} */
    this.prob = [];
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

  async load() {
    this.full = await this.full_db.load(
      { name: 'target', type: 'title' },
      { name: 'result', type: 'rich_text' },
    );

    this.prob = await this.prob_db.load(
      { name: 'target', type: 'title' },
      { name: 'result', type: 'rich_text' },
      { name: 'ratio', type: 'number' },
    );
  }
}

module.exports = Detect;
