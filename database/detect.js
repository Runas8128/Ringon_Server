const { config: { notion } } = require('../config');
const Notion = require('../util/Notion');

/**
 * @param {Array<{ target: T, weight: number }>} targets
 * @returns {T?}
 * @template T
 */
function select_weight(targets) {
  if (targets.length == 0) return null;

  const total_weight = targets
    .map(obj => obj.weight)
    .reduce((prev, curr) => prev + curr, 0);
  const weighted_random = Math.random() * total_weight;

  let current_weight = 0;

  for (const { target, weight } of targets) {
    current_weight += weight;
    if (weighted_random < current_weight) return target;
  }

  return targets[targets.length - 1];
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
    this.id_map = notion.detect;
    this.full_db = new Notion.Database(this.id_map.full);
    this.prob_db = new Notion.Database(this.id_map.prob);

    /** @type {FullDetectObj[]} */
    this.full = [];
    /** @type {ProbDetectObj[]} */
    this.prob = [];
  }

  get_full = target => this.full
    .find(obj => obj.target == target)
    ?.result;

  get_prob = target => select_weight(this.prob
    .filter(obj => obj.target == target)
    .map(obj => ({ target: obj.result, weight: obj.ratio })));

  get_result = target =>
    this.get_full(target) ?? this.get_prob(target) ?? null;

  load() {
    this.full_db.load(
      { name: 'target', type: 'title' },
      { name: 'result', type: 'rich_text' },
    ).then(result => this.full = result);

    this.prob_db.load(
      { name: 'target', type: 'title' },
      { name: 'result', type: 'rich_text' },
      { name: 'ratio', type: 'number' },
    ).then(result => this.prob = result);
  }
}

module.exports = Detect;
