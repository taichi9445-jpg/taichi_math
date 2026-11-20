/**
 * 数学デジタル教材を Google Apps Script（GAS）のウェブアプリで開くための入口。
 *
 * しくみ：GitHub Pages に公開している教材のページを、Google のサーバーが取りに行き、
 *   CSS・JS をページの中に入れこみ、教材どうしのリンクをこのウェブアプリの URL に書きかえて返す。
 *   学校の Chromebook で github.io が開けなくても、script.google.com から開ける。
 *   教材を直して GitHub に送れば、GAS は何もしなくても 10 分以内に新しい内容になる。
 *
 * 開き方：  ウェブアプリのURL?p=math2/m/bibun-kiso.html   （p を書かないと数学Ⅱの一覧）
 *           ウェブアプリのURL?p=index.html                 （数学Ⅰの一覧）
 *           &fresh=1 を付けると、すぐに最新を取りに行く
 */
var BASE = 'https://taichi9445-jpg.github.io/taichi_math/';
var START = 'math2/index.html';
var CACHE_SEC = 600;

function doGet(e) {
  var prm = (e && e.parameter) || {};
  var page = cleanPath(prm.p || START);
  if (!page) return message('ページの名前が正しくありません。');
  var fresh = prm.fresh === '1';
  // 2026-11-19：うまく作れなかったときは、白い画面ではなく理由を出す
  try {
    var text = getText(page, fresh);
    if (text === null) return message('ページが見つかりませんでした：' + page);
    var html = buildPage(page, text, fresh);
    var m = html.match(/<title>([^<]*)<\/title>/i);
    return HtmlService.createHtmlOutput(html)
      .setTitle(m ? m[1] : '数学デジタル教材')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return message('ページを開けませんでした（' + page + '）。<br>理由：' + String((err && err.message) || err).replace(/</g, '&lt;'));
  }
}

// 「m/abc.html」「math2/m/abc.html」のような、教材の中の .html だけを通す
function cleanPath(p) {
  p = String(p).replace(/^\/+/, '');
  if (!/^[A-Za-z0-9_\-\/]+\.html$/.test(p) || p.indexOf('..') >= 0) return null;
  return p;
}

// ページの場所から見た相対パス（../assets/x.css など）を、教材全体の中の場所にする
function resolvePath(baseDir, rel) {
  var parts = (baseDir + rel).split('/'), out = [];
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '..') out.pop();
    else if (parts[i] !== '.' && parts[i] !== '') out.push(parts[i]);
  }
  return out.join('/');
}

function getText(path, fresh) {
  var url = BASE + path, cache = CacheService.getScriptCache(), key = 'f:' + url;
  if (!fresh) { var hit = cache.get(key); if (hit !== null) return hit; }
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
  if (res.getResponseCode() !== 200) return null;
  var text = res.getContentText('UTF-8');
  try { cache.put(key, text, CACHE_SEC); } catch (err) { /* 100KB をこえるものは毎回取りに行く */ }
  return text;
}

function buildPage(page, html, fresh) {
  var dir = page.indexOf('/') >= 0 ? page.slice(0, page.lastIndexOf('/') + 1) : '';
  var self = ScriptApp.getService().getUrl();
  var isRel = function (u) { return !/^([a-z]+:|\/\/|#|data:)/i.test(u); };
  var noQuery = function (u) { return u.split('#')[0].split('?')[0]; };

  // CSS を中に入れる
  html = html.replace(/<link\b[^>]*>/gi, function (tag) {
    var href = (tag.match(/href\s*=\s*"([^"]+)"/i) || [])[1];
    if (!href || !/rel\s*=\s*"stylesheet"/i.test(tag) || !isRel(href)) return tag;
    var css = getText(resolvePath(dir, noQuery(href)), fresh);
    return css === null ? tag : '<style>\n' + css + '\n</style>';
  });
  // JS を中に入れる
  html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*"([^"]+)"([^>]*)>\s*<\/script>/gi, function (tag, a, src, b) {
    if (!isRel(src)) return tag;
    var js = getText(resolvePath(dir, noQuery(src)), fresh);
    return js === null ? tag : '<script>\n' + safeJs(js) + '\n</script>';
  });
  // ページの中に直接書いてある script も同じようにする
  html = html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, function (all, open, body, close) {
    return /\bsrc\s*=/i.test(open) ? all : open + safeJs(body) + close;
  });
  // 教材どうしのリンク（JS の中の文字も）を、このウェブアプリの ?p= にする。画面全体で開くように target="_top"
  html = html.replace(/href="([^"#?]+\.html)(#[^"]*)?"/g, function (all, href, hash) {
    if (!isRel(href)) return all;
    var to = resolvePath(dir, href);
    return 'href="' + self + '?p=' + to + (hash || '') + '" target="_top"';
  });
  // 2026-11-20：script の中身は base64 の文字（英数字だけ）にして送り、画面の側でもとにもどして動かす。
  //   GAS が途中で JS の文字を変えてしまっても動くように（#27 相互関係が GAS だけで白くなった件）
  var k = 0;
  html = html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, function (all, open, body, close) {
    if (/\bsrc\s*=/i.test(open) || /\btype\s*=\s*"(?!text\/javascript)[^"]*"/i.test(open) || !body.trim()) return all;
    k++;
    return '<script>__gasRun("' + Utilities.base64Encode(body, Utilities.Charset.UTF_8) + '","script' + k + '")</script>';
  });
  // いちばん最初に：もとにもどして動かす仕組みと、エラーを画面に出す仕組み
  var boot = '<script>(function(){' +
    'function show(t){var b=document.getElementById("gas-err");if(!b){b=document.createElement("div");b.id="gas-err";' +
    'b.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#fff5f5;color:#a61e1e;border:2px solid #c92a2a;border-radius:8px;padding:10px;font:14px/1.5 sans-serif;white-space:pre-wrap;max-height:40vh;overflow:auto";' +
    'b.textContent="うまく動きませんでした。この画面を先生に見せてください。\\n";(document.body||document.documentElement).appendChild(b);}b.textContent+=t+"\\n";}' +
    'window.addEventListener("error",function(e){show((e.message||"error")+" ["+(e.filename||"").split("/").pop()+" "+(e.lineno||"")+":"+(e.colno||"")+"]");});' +
    'window.addEventListener("unhandledrejection",function(e){show("Promise: "+(e.reason&&e.reason.message||e.reason));});' +
    'window.__gasRun=function(b,name){try{var s=atob(b),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);' +
    'var src=new TextDecoder("utf-8").decode(u),el=document.createElement("script");el.text=src+"\\n//# sourceURL="+name+".js";' +
    'var c=document.currentScript;c.parentNode.insertBefore(el,c.nextSibling);}catch(err){show(name+": "+err.message);}};' +
    '})();</script>';
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, function (h) { return h + boot; }) : boot + html;
  return html;
}

// JS の文字の中の「</text>」などは「<\/text>」と書いても同じ意味。GAS が HTML の閉じタグとまちがえて止まらないようにする（2026-11-19）
//   閉じタグの形（</ ＋ 名前 ＋ >）だけを書きかえる。/</g のような正規表現はそのまま
function safeJs(js) { return js.replace(/<\/([A-Za-z][\w-]*\s*>)/g, '<\\/$1'); }

function message(t) {
  return HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:20px">' + t + '</p><p style="font:16px sans-serif;padding:0 20px"><a href="' + ScriptApp.getService().getUrl() + '" target="_top">数学Ⅱの一覧へ</a></p>')
    .setTitle('数学デジタル教材').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
