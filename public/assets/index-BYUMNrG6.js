(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function o(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(t){if(t.ep)return;t.ep=!0;const r=o(t);fetch(t.href,r)}})();async function i(){try{const e=await(await fetch("/api/sites")).json();d(e)}catch(n){console.error("Error fetching sites:",n),document.getElementById("sitesTableBody").innerHTML='<tr><td colspan="7" class="text-center text-red-500">Error loading sites</td></tr>'}}function d(n){const e=document.getElementById("sitesTableBody");e.innerHTML="",n.forEach(o=>{var t;const s=document.createElement("tr");s.innerHTML=`
      <td class="px-4 py-2">${o.id}</td>
      <td class="px-4 py-2">${o.e911Location}</td>
      <td class="px-4 py-2">${o.status}</td>
      <td class="px-4 py-2">${o.device}</td>
      <td class="px-4 py-2">${((t=o.fxsLines)==null?void 0:t.length)||0}</td>
      <td class="px-4 py-2">${a(o.lastSync)}</td>
      <td class="px-4 py-2 flex gap-2">
        <button class="px-3 py-1 bg-blue-500 text-white rounded">Ping</button>
        <button class="px-3 py-1 bg-yellow-500 text-white rounded">Reboot</button>
        <button class="px-3 py-1 bg-gray-600 text-white rounded">Logs</button>
      </td>
    `,e.appendChild(s)})}function a(n){if(!n)return"—";const e=new Date(n);return isNaN(e)?"Invalid Date":`${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")}/${e.getFullYear()}`}i();
