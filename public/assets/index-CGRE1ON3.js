(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function o(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function t(e){if(e.ep)return;e.ep=!0;const n=o(e);fetch(e.href,n)}})();function a(r,s="info"){const o=document.getElementById("toast-container"),t=document.createElement("div");t.className=`
    px-4 py-2 rounded shadow text-white animate-fadeIn
    ${s==="success"?"bg-green-600":s==="error"?"bg-red-600":"bg-blue-600"}
  `,t.textContent=r,o.appendChild(t),setTimeout(()=>{t.classList.add("opacity-0","transition-opacity","duration-500"),setTimeout(()=>t.remove(),500)},3e3)}window.pingSite=async r=>{const o=await(await fetch(`/api/ping/${r}`,{method:"POST"})).json();a(o.msg,o.ok?"success":"error"),i()};window.rebootSite=async r=>{const o=await(await fetch(`/api/reboot/${r}`,{method:"POST"})).json();a(o.msg,o.ok?"success":"error")};window.fetchLogs=async r=>{const o=await(await fetch(`/api/logs/${r}`)).json();a(`Logs for site ${r} loaded.`,"info"),console.log("Logs:",o.logs)};async function i(){const s=await(await fetch("/api/sites")).json(),o=document.getElementById("sitesTable");o.innerHTML="",s.forEach(t=>{const e=document.createElement("tr");e.className="border-b",e.innerHTML=`
      <td class="px-4 py-2">${t.id}</td>
      <td class="px-4 py-2">${t.location}</td>
      <td class="px-4 py-2 font-semibold ${t.status==="online"?"text-green-600":t.status==="offline"?"text-red-600":"text-yellow-600"}">${t.status}</td>
      <td class="px-4 py-2">${t.device||"—"}</td>
      <td class="px-4 py-2">${t.lastSync||"—"}</td>
      <td class="px-4 py-2 space-x-2">
        <button onclick="pingSite(${t.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ping</button>
        <button onclick="rebootSite(${t.id})" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Reboot</button>
        <button onclick="fetchLogs(${t.id})" class="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">Logs</button>
      </td>
    `,o.appendChild(e)}),document.getElementById("lastUpdated").textContent="Updated: "+new Date().toLocaleString()}i();setInterval(i,1e4);
