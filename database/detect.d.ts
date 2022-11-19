import { Database } from "../util/Notion";

export interface FullDetectObj {
  target: string;
  result: string;
}

export interface ProbDetectObj {
  target: string;
  result: string;
  ratio: number;
}

export = class Detect {
  id_map: { full: string, prob: string };
  full_db: Database;
  prob_db: Database;

  full: FullDetectObj[];
  prob: ProbDetectObj[];

  get_full: (target: string) => string?;
  get_prob: (target: string) => string?;
  get_result: (target: string) => string?;

  load: () => void;
}
