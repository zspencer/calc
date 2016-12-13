/* global window */

export const MAX_EXPERIENCE = 45;
export const MIN_EXPERIENCE = 0;

export const HISTOGRAM_BINS = 12;

// TODO: This is duplicated from server-side code; consolidate it.
export const EDU_HIGH_SCHOOL = 'HS';
export const EDU_ASSOCIATES = 'AA';
export const EDU_BACHELORS = 'BA';
export const EDU_MASTERS = 'MA';
export const EDU_PHD = 'PHD';

export const EDU_LABELS = {
  [EDU_HIGH_SCHOOL]: 'High School',
  [EDU_ASSOCIATES]: 'Associates',
  [EDU_BACHELORS]: 'Bachelors Degree',
  [EDU_MASTERS]: 'Masters Degree',
  [EDU_PHD]: 'Ph.D',
};

export const BUSINESS_SIZE_LABELS = {
  s: 'small business',
  o: 'other than small',
};

export const SITE_LABELS = {
  customer: 'customer',
  contractor: 'contractor',
  both: 'both',
};

// TODO: This is duplicated from server-side code; consolidate it.
export const SCHEDULE_LABELS = {
  Consolidated: 'Consolidated',
  FABS: '520 - Legacy FABS',
  AIMS: '541 - Legacy AIMS',
  'Language Services': '73802 - Legacy Language',
  PES: '871 - Legacy PES',
  MOBIS: '874 - Legacy MOBIS',
  Logistics: '87405 - Legacy Logistics',
  Environmental: '899 - Legacy Environmental',
  'IT Schedule 70': '132 - IT 70',
};

export const CONTRACT_YEAR_LABELS = {
  current: 'Current year',
  1: 'One year out',
  2: 'Two years out',
};

export const DEFAULT_CONTRACT_YEAR = 'current';

export const EMPTY_RATES_DATA = {
  minimum: 0,
  maximum: 0.001,
  average: 0,
  first_standard_deviation: 0,
  count: 0,
  results: [],
  wage_histogram: [
    { count: 0, min: 0, max: 0 },
  ],
};

export const DEFAULT_SORT = { key: 'current_price', descending: false };

export const QUERY_TYPE_MATCH_ALL = 'match_all';

export const QUERY_TYPE_MATCH_PHRASE = 'match_phrase';

export const QUERY_TYPE_MATCH_EXACT = 'match_exact';

export const DEFAULT_QUERY_TYPE = QUERY_TYPE_MATCH_ALL;

export const QUERY_TYPE_LABELS = {
  [QUERY_TYPE_MATCH_ALL]: 'Contains words',
  [QUERY_TYPE_MATCH_PHRASE]: 'Contains phrase',
  [QUERY_TYPE_MATCH_EXACT]: 'Exact match',
};

export const API_HOST = window.API_HOST;

export const API_RATES_CSV = `${API_HOST}rates/csv/`;
