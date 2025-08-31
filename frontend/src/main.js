import './index.css';

document.querySelector('#app').innerHTML = `
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
`;

// Fetch sites from API
fetch("/api/sites")
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById("sitesTable");
    tbody.innerHTML = data.map(site => `
      <tr class="border-b">
        <td class="p-2">${site.id}</td>
        <td class="p-2">${site.location}</td>
        <td class="p-2">
          <span class="${site.status === 'online' ? 'text-green-600 font-bold' :
                         site.status === 'offline' ? 'text-red-600 font-bold' :
                         'text-yellow-600'}">${site.status}</span>
        </td>
        <td class="p-2">CSA v1.1</td>
        <td class="p-2">${new Date().toLocaleTimeString()}</td>
        <td class="p-2 space-x-2">
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">Ping</button>
          <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Reboot</button>
          <button class="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded">Logs</button>
        </td>
      </tr>
    `).join("");
  });
