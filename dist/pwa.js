const hasWindow = typeof window !== 'undefined';
const state = {
  supported: hasWindow && 'serviceWorker' in navigator && window.isSecureContext,
  online: hasWindow ? navigator.onLine : true,
  offlineReady:false, updateReady:false, refreshReady:false, checking:false,
  standalone: hasWindow && (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true),
  showInstructions:false, installAvailable:false, installedThisSession:false, installing:false, error:'', note:''
};
let registration, installPrompt, started=false, reloadAfterUpdate=false, hadController=false;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button = (label, action, disabled=false) => `<button class="btn secondary" type="button" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
function changed() { if(hasWindow) window.dispatchEvent(new CustomEvent('yan-pwa-change',{detail:getPwaState()})); }
export function getPwaState() { return {...state}; }

async function readCacheStatus({prepare=false}={}) {
  const worker = registration?.active;
  if (!worker) return;
  try {
    state.offlineReady = await new Promise(resolve => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(false); }, prepare?30000:4000);
      channel.port1.onmessage = event => {
        clearTimeout(timer); channel.port1.close();
        resolve(event.data?.type === 'YAN_CACHE_STATUS' && event.data.ready === true);
      };
      worker.postMessage({type:prepare?'YAN_PREPARE_OFFLINE':'YAN_CACHE_STATUS'}, [channel.port2]);
    });
  } catch { state.offlineReady=false; }
  changed();
}

function watchInstalling(worker) {
  if (!worker) return;
  state.installing=true; changed();
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed') {
      state.installing=false;
      state.updateReady=Boolean(registration?.waiting && navigator.serviceWorker.controller);
      if (!state.updateReady) void readCacheStatus();
      changed();
    }
    if (worker.state === 'activated') { state.installing=false; void readCacheStatus(); }
    if (worker.state === 'redundant') {
      state.installing=false;
      state.error='离线准备或更新没有完成。原有学习数据仍保留，请联网后重试。';
      changed();
    }
  });
}

export async function start() {
  if (!hasWindow || started) return;
  started=true;
  if (!state.supported) { changed(); return; }
  hadController=Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadAfterUpdate) { reloadAfterUpdate=false; window.location.reload(); return; }
    if (hadController) { state.refreshReady=true; state.updateReady=false; }
    hadController=true;
    void readCacheStatus(); changed();
  });
  try {
    const script = new URL('./sw.js', import.meta.url);
    registration=await navigator.serviceWorker.register(script, {scope:new URL('./',import.meta.url).href, updateViaCache:'none'});
    state.updateReady=Boolean(registration.waiting);
    registration.addEventListener('updatefound', () => watchInstalling(registration.installing));
    watchInstalling(registration.installing);
    if (registration.active) await readCacheStatus();
    navigator.serviceWorker.ready.then(() => readCacheStatus()).catch(() => {});
    changed();
  } catch {
    state.error='离线准备未完成。请检查网络，或换用支持网页应用的浏览器。'; changed();
  }
}

async function checkUpdate() {
  state.error=''; state.note='';
  if (!state.online) { state.note='当前离线，可以继续使用已准备好的学习内容。联网后再检查更新。'; changed(); return; }
  if (!state.supported) { state.note='请用手机浏览器打开公开 HTTPS 网址，再添加到主屏幕。'; changed(); return; }
  state.checking=true; changed();
  try {
    if (!registration) { started=false; await start(); }
    if (!registration) throw new Error();
    await registration.update();
    state.updateReady=Boolean(registration.waiting);
    await readCacheStatus({prepare:!registration.installing&&!state.updateReady});
    state.note=registration.installing?'正在准备新版离线内容，请稍候。':state.updateReady?'新版已准备好，保存当前草稿后即可更新。':state.offlineReady?'已检查更新，离线内容可用。':'离线内容尚未准备完成，请稍后重试。';
  } catch { state.error='暂时无法检查更新，请联网后重试。'; }
  state.checking=false; changed();
}

async function install() {
  if (!installPrompt) { state.showInstructions=true; state.note='如果没有安装按钮，请按下面的浏览器菜单说明添加。菜单名称可能因浏览器不同而略有变化。'; changed(); return; }
  const prompt=installPrompt; installPrompt=null; state.installAvailable=false;
  try {
    await prompt.prompt();
    const choice=await prompt.userChoice;
    state.note=choice.outcome==='accepted'?'已提交安装请求，请等待浏览器完成；完成后可从主屏幕打开。':'这次没有添加，仍可继续在网页学习。';
  } catch { state.note='浏览器未能显示安装提示，请使用浏览器菜单添加到主屏幕。'; }
  changed();
}

export function act(action) {
  if (!['pwa-install','pwa-check','pwa-update'].includes(action)) return false;
  if (action==='pwa-install') void install();
  if (action==='pwa-check') void checkUpdate();
  if (action==='pwa-update') {
    if (window.confirm('更新会重新打开当前页面，尚未保存的答题、聊天草稿或影音选择会丢失。请先保存需要保留的内容。现在更新吗？')) {
      if (registration?.waiting) {
        reloadAfterUpdate=true;
        registration.waiting.postMessage({type:'YAN_ACTIVATE_UPDATE'});
      } else if (state.refreshReady) window.location.reload();
      else void checkUpdate();
    }
  }
  return true;
}

export function panel() {
  const ready=state.offlineReady;
  const installState=state.standalone?'正在主屏幕应用中使用':state.installedThisSession?'浏览器已报告安装完成':'把学习放进手机主屏幕';
  const cacheLabel=ready?'内置内容已准备好，可离线学习':state.installing?'正在准备离线学习内容…':state.supported?'首次使用请保持联网，等待离线准备完成':'当前地址或浏览器不支持离线安装';
  return `<section class="panel glass pwa-panel" aria-labelledby="pwa-title"><div class="panel-head"><div><span class="eyebrow">YOUR POCKET STUDIO</span><h2 id="pwa-title">${installState}</h2></div><span class="pill blue">${state.online?'在线':'离线'}</span></div><p class="body-copy">打开公开网址即可学习，不需要电脑一直开着。添加到主屏幕后，点 YAN 图标就能开始。</p><p class="notice ${ready?'':'warm'}" role="status">${cacheLabel}</p><div class="actions">${!state.standalone&&!state.installedThisSession?button(state.installAvailable?'添加到主屏幕':'查看添加方法','pwa-install'):''}${button(state.checking?'正在检查…':'检查更新 / 重试准备','pwa-check',state.checking||state.installing)}${state.updateReady||state.refreshReady?button('保存草稿后更新','pwa-update'):''}</div>${state.updateReady||state.refreshReady?'<p class="notice">新版已准备好。当前页面不会自动刷新；保存草稿后点更新，或关闭所有 YAN 页面再重新打开。</p>':''}${state.error?`<p class="notice warm" role="alert">${esc(state.error)}</p>`:''}${state.note?`<p class="caption" role="status">${esc(state.note)}</p>`:''}<details class="pwa-instructions" ${state.showInstructions?'open':''}><summary>安装方法与离线说明</summary><p><strong>安卓：</strong>用 Chrome、Edge 或支持安装网页应用的浏览器打开公开网址 → 右上角菜单 →“安装应用”或“添加到主屏幕”。聊天软件内打开时，先选择“在浏览器打开”。</p><p><strong>iPhone：</strong>用 Safari 打开网址 → 分享 →“添加到主屏幕”。安装入口由浏览器提供，有些浏览器不会显示网页内安装按钮。</p><p class="caption">离线可用：词汇、复习、语法、内置练习、记录、备份和已保存的笔记。官方资料、TED 等外部入口需要联网；AI 需要另行连接模型。缓存不包含私人 PDF、音视频、API 响应或聊天记录。</p><p class="caption">学习记录仍保存在这个设备的网站数据中。更换网址、浏览器或设备前请导出备份；安装和离线缓存不会自动同步数据。浏览器清理网站数据会移除记录与缓存。</p></details><p class="caption">记录留在这个设备。更换设备前，请到「数据与设置」导出备份。</p></section>`;
}

if (hasWindow) {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt=event; state.installAvailable=true; changed();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt=null; state.installAvailable=false; state.installedThisSession=true;
    state.note='浏览器已报告安装完成，可以从主屏幕打开 YAN。'; changed();
  });
  const display=window.matchMedia('(display-mode: standalone)');
  display.addEventListener?.('change', () => { state.standalone=display.matches || navigator.standalone === true; changed(); });
  for (const type of ['online','offline']) window.addEventListener(type, () => { state.online=navigator.onLine; void readCacheStatus(); changed(); });
  document.addEventListener('visibilitychange', () => { if(document.visibilityState==='visible') void readCacheStatus(); });
  if (document.readyState==='complete') void start();
  else window.addEventListener('load', () => { void start(); }, {once:true});
}
