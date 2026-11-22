const caelisMapByLang = {
  ru: './media/caelis-9-ru.jpg',
  en: './media/caelis-9-en.jpg',
};

const squadFallbackByDropboxId = {
  o099puabe331i42xfws9s: './media/squad/raphael-valturn.jpg',
  pwee2mm0ok44o9yqsac8y: './media/squad/callidus.jpg',
  bndeezf1djsvb3iig9c30: './media/squad/stalver-forge.jpg',
  gkdbme1wvpdj9n637flaq: './media/squad/vincenzo-borgia.jpg',
  w709c1fzi56c5zz27c9c4: './media/squad/lena-valk.jpg',
};

const dropboxShareId = /dropbox(?:usercontent)?\.com\/scl\/fi\/([a-z0-9]+)\//i;

export const caelisMap = caelisMapByLang.ru;

// Published CMS drafts can still contain any of the disabled Dropbox shares.
export function resolveCaelisMap(source, lang = 'ru') {
  const fallback = caelisMapByLang[lang] || caelisMapByLang.ru;
  if (!source) return fallback;
  const match = source.match(dropboxShareId);
  if (match && (match[1] === 'xuzc7518eva3pcmeao0p0' || match[1] === 'dvtngj3jd4njpco5ah4vq')) {
    return fallback;
  }
  return source;
}

export function resolveSquadImage(source) {
  if (!source) return '';
  const match = source.match(dropboxShareId);
  if (match && squadFallbackByDropboxId[match[1]]) {
    return squadFallbackByDropboxId[match[1]];
  }
  return source;
}
