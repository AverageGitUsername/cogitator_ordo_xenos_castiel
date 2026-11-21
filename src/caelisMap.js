import caelisMap from './assets/caelis-9.webp';

// Published CMS drafts can still contain either of the disabled Dropbox shares.
export function resolveCaelisMap(source) {
  if (!source || /dropbox(?:usercontent)?\.com\/scl\/fi\/(?:xuzc7518eva3pcmeao0p0|dvtngj3jd4njpco5ah4vq)\//i.test(source)) {
    return caelisMap;
  }
  return source;
}

export { caelisMap };
