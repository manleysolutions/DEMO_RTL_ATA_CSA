(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))a(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const l of e.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function s(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function a(t){if(t.ep)return;t.ep=!0;const e=s(t);fetch(t.href,e)}})();document.querySelector("#app").innerHTML=`
  <div class="max-w-6xl mx-auto p-6">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-uspsBlue">📡 USPS True911+ Deployment Dashboard</h1>
      <span class="text-sm text-gray-500">Updated: ${new Date().toLocaleString()}</span>
    </header>
    <div class="bg-white shadow rounded-lg p-4">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-2">ID</th>
            <th class="p-2">Location</th>
            <th class="p-2">Status</th>
            <th class="p-2">Device</th>
            <th class="p-2">Last Sync</th>
            <th class="p-2">Actions</th>
          </tr>
        </thead>
        <tbody id="sitesTable"></tbody>
      </table>
    </div>
  </div>
`;fetch("/api/sites").then(r=>r.json()).then(r=>{const o=document.getElementById("sitesTable");o.innerHTML=r.map(s=>`
      <tr class="border-b">
        <td class="p-2">${s.id}</td>
        <td class="p-2">${s.location}</td>
        <td class="p-2">
          <span class="${s.status==="online"?"text-green-600 font-bold":s.status==="offline"?"text-red-600 font-bold":"text-yellow-600"}">${s.status}</span>
        </td>
        <td class="p-2">CSA v1.1</td>
        <td class="p-2">${new Date().toLocaleTimeString()}</td>
        <td class="p-2 space-x-2">
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">Ping</button>
          <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Reboot</button>
          <button class="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded">Logs</button>
        </td>
      </tr>
    `).join("")});
