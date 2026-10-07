/*
 * dc-runtime.js — motor mínimo de plantillas para albert.fig
 * ----------------------------------------------------------
 * Las páginas se diseñaron en el lienzo de diseño de Claude, que usa:
 *   {{expresion}}            valores en texto y atributos
 *   <sc-for list as>         repetir un bloque por cada elemento de una lista
 *   <sc-if value>            mostrar un bloque solo si el valor es verdadero
 *   onClick="{{fn}}" …       eventos
 *   ref="{{fn}}"             recibir el elemento del DOM
 *   class Component extends DCLogic { renderVals() { … } }
 * Este archivo reproduce ese comportamiento en un navegador normal,
 * sin dependencias. Cada setState vuelve a pintar la plantilla y
 * actualiza el DOM existente (no lo reemplaza), así las animaciones
 * CSS y los estilos puestos desde JS se conservan.
 */
(function () {
  'use strict';

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const p = typeof patch === 'function' ? patch(this.state, this.props) : patch;
      if (p) this.state = Object.assign({}, this.state, p);
      if (this.__dcSchedule) this.__dcSchedule();
    }
  }

  const EVENT_MAP = { onclick: 'click', onsubmit: 'submit', oninput: 'input', onkeydown: 'keydown', onkeyup: 'keyup', onfocus: 'focus', onblur: 'blur', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave' };
  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const ONE = /^\{\{\s*([^}]+?)\s*\}\}$/;

  function resolve(expr, scope) {
    expr = expr.trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    let v = scope;
    for (const k of expr.split('.')) { if (v == null) return undefined; v = v[k]; }
    return v;
  }
  function text(str, scope) {
    return str.replace(HOLE, (m, e) => { const v = resolve(e, scope); return v == null || typeof v === 'function' ? '' : String(v); });
  }
  function value(attr, scope) {
    const m = (attr || '').trim().match(ONE);
    return m ? resolve(m[1], scope) : undefined;
  }

  // Construye un árbol DOM nuevo (no conectado) a partir de la plantilla.
  // Cada nodo generado lleva una clave estable (su posición en la plantilla
  // + el índice dentro de un sc-for). Así, cuando aparece o desaparece un
  // bloque, el resto de elementos conserva su identidad en el DOM.
  function build(node, scope, out, key) {
    key = key || '';
    let ci = 0;
    for (const ch of Array.from(node.childNodes)) {
      const k = key + '/' + (ci++);
      if (ch.nodeType === 3) { const t = document.createTextNode(text(ch.nodeValue, scope)); t.__dcKey = k; out.appendChild(t); continue; }
      if (ch.nodeType !== 1) continue;
      const tag = ch.localName;
      if (tag === 'sc-for') {
        const list = value(ch.getAttribute('list'), scope);
        const as = ch.getAttribute('as') || 'item';
        if (Array.isArray(list)) list.forEach((it, i) => {
          const s2 = Object.create(scope); s2[as] = it; s2[as + 'Index'] = i;
          build(ch.content || ch, s2, out, k + '#' + i);
        });
        continue;
      }
      if (tag === 'sc-if') {
        if (value(ch.getAttribute('value'), scope)) build(ch.content || ch, scope, out, k + '?');
        continue;
      }
      const el = ch.namespaceURI && ch.namespaceURI !== 'http://www.w3.org/1999/xhtml'
        ? document.createElementNS(ch.namespaceURI, ch.localName)
        : document.createElement(ch.localName);
      el.__dcOn = {}; el.__dcAttrs = {};
      for (const a of Array.from(ch.attributes)) {
        const n = a.name, low = n.toLowerCase();
        if (low.startsWith('hint-placeholder')) continue;
        if (low === 'ref') { const f = value(a.value, scope); if (typeof f === 'function') el.__dcRef = f; continue; }
        if (low === 'onchange') {
          const f = value(a.value, scope);
          if (typeof f === 'function') el.__dcOn[/^(input|textarea)$/i.test(tag) ? 'input' : 'change'] = f;
          continue;
        }
        if (EVENT_MAP[low]) { const f = value(a.value, scope); if (typeof f === 'function') el.__dcOn[EVENT_MAP[low]] = f; continue; }
        const v = text(a.value, scope);
        el.setAttribute(n, v); el.__dcAttrs[n] = v;
      }
      el.__dcKey = k;
      build(ch.content || ch, scope, el, k);
      out.appendChild(el);
    }
  }

  function bindEvents(el, on) {
    el.__dcOn = on;
    el.__dcBound = el.__dcBound || {};
    for (const type in on) {
      if (el.__dcBound[type]) continue;
      el.__dcBound[type] = true;
      el.addEventListener(type, (e) => { const f = el.__dcOn && el.__dcOn[type]; if (f) f(e); });
    }
  }

  // Actualiza "old" para que se parezca a "neu" tocando solo lo que cambió.
  const refs = [];
  function patchEl(old, neu) {
    const prev = old.__dcAttrs || {};
    const next = neu.__dcAttrs || {};
    for (const n in prev) if (!(n in next)) old.removeAttribute(n);
    for (const n in next) {
      if (prev[n] !== next[n]) {
        old.setAttribute(n, next[n]);
        if (n === 'value' && 'value' in old) old.value = next[n];
      }
    }
    old.__dcAttrs = next;
    bindEvents(old, neu.__dcOn || {});
    if (neu.__dcRef) refs.push([neu.__dcRef, old]);
    patchChildren(old, neu);
  }
  function adopt(neu) {
    // Nodo nuevo insertado: enlaza eventos y refs de todo su subárbol.
    if (neu.nodeType !== 1) return;
    bindEvents(neu, neu.__dcOn || {});
    if (neu.__dcRef) refs.push([neu.__dcRef, neu]);
    for (const c of Array.from(neu.childNodes)) adopt(c);
  }
  function same(a, b) {
    if (a.nodeType !== b.nodeType) return false;
    if (a.nodeType === 3) return true;
    return a.localName === b.localName && a.namespaceURI === b.namespaceURI;
  }
  function patchChildren(oldP, newP) {
    const map = new Map();
    for (const c of Array.from(oldP.childNodes)) if (c.__dcKey) map.set(c.__dcKey, c);
    const n = Array.from(newP.childNodes);
    const used = new Set();
    for (let i = 0; i < n.length; i++) {
      const b = n[i];
      let a = map.get(b.__dcKey);
      if (a && !same(a, b)) a = null;
      const at = oldP.childNodes[i] || null;
      if (a) {
        used.add(a);
        if (a !== at) oldP.insertBefore(a, at);
        if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; }
        else patchEl(a, b);
      } else {
        oldP.insertBefore(b, at);
        used.add(b);
        adopt(b);
      }
    }
    for (const c of Array.from(oldP.childNodes)) if (c.__dcKey && !used.has(c)) oldP.removeChild(c);
  }

  function mount(Component, opts) {
    opts = opts || {};
    const tpl = document.getElementById(opts.template || 'dc-template');
    const root = document.getElementById(opts.root || 'dc-root');
    const comp = new Component(opts.props || {});
    let queued = false, mounted = false;
    function render() {
      queued = false;
      let vals;
      try { vals = comp.renderVals() || {}; } catch (e) { console.error('[dc] renderVals', e); return; }
      const frag = document.createElement('div');
      build(tpl.content, vals, frag);
      refs.length = 0;
      patchChildren(root, frag);
      const rs = refs.slice(); refs.length = 0;
      for (const [f, el] of rs) { try { f(el); } catch (e) { console.error('[dc] ref', e); } }
      if (!mounted) {
        mounted = true;
        if (typeof comp.componentDidMount === 'function') {
          try { comp.componentDidMount(); } catch (e) { console.error('[dc] componentDidMount', e); }
        }
      }
    }
    comp.__dcSchedule = () => { if (!queued) { queued = true; Promise.resolve().then(render); } };
    window.addEventListener('pagehide', () => { if (typeof comp.componentWillUnmount === 'function') comp.componentWillUnmount(); });
    render();
    return comp;
  }

  window.DCLogic = DCLogic;
  window.DC = { mount };
})();
