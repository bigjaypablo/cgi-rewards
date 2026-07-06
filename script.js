// Load local wallet icons into each button
const walletIcons = ['phantom', 'solflare', 'backpack', 'metamask', 'trustwallet', 'coinbase'];

walletIcons.forEach(name => {
  fetch(`wallet-icons/${name}.svg`)
    .then(res => res.text())
    .then(svg => {
      const slot = document.querySelector(`.wallet-icon-slot[data-icon="${name}"]`);
      if (slot) slot.innerHTML = svg;
    })
    .catch(err => console.error(`Failed to load icon: ${name}`, err));
});





// ===== VIEW ELEMENTS =====
const landingView = document.getElementById('landingView');
const dashboardView = document.getElementById('dashboardView');
const walletModal = document.getElementById('walletModal');

// ===== OPEN / CLOSE MODAL =====
function openModal() {
  walletModal.classList.remove('hidden');
}
function closeModal() {
  walletModal.classList.add('hidden');
}

document.getElementById('connectBtnNav').addEventListener('click', openModal);
document.getElementById('connectBtnHero').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);

// ===== TAB SWITCHING (Solana / EVM) =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabSolana = document.getElementById('tabSolana');
const tabEvm = document.getElementById('tabEvm');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.dataset.tab === 'solana') {
      tabSolana.classList.remove('hidden');
      tabEvm.classList.add('hidden');
    } else {
      tabEvm.classList.remove('hidden');
      tabSolana.classList.add('hidden');
    }
  });
});

// ===== WALLET CONNECT LOGIC =====
const walletButtons = document.querySelectorAll('.wallet-option');

walletButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const wallet = btn.dataset.wallet;
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span class="wallet-spinner"></span><span>Connecting...</span>`;
    btn.disabled = true;

    try {
      let address = null;

      if (wallet === 'phantom') {
        if (window.solana && window.solana.isPhantom) {
          const resp = await window.solana.connect();
          address = resp.publicKey.toString();
        } else {
          alert('Phantom not detected. Install it to continue.');
          btn.innerHTML = originalContent;
          btn.disabled = false;
          return;
        }
      }

      else if (wallet === 'solflare') {
        if (window.solflare && window.solflare.isSolflare) {
          await window.solflare.connect();
          address = window.solflare.publicKey.toString();
        } else {
          alert('Solflare not detected. Install it to continue.');
          btn.innerHTML = originalContent;
          btn.disabled = false;
          return;
        }
      }

      else if (wallet === 'backpack') {
        if (window.backpack && window.backpack.isBackpack) {
          const resp = await window.backpack.connect();
          address = resp.publicKey.toString();
        } else {
          alert('Backpack not detected. Install it to continue.');
          btn.innerHTML = originalContent;
          btn.disabled = false;
          return;
        }
      }

      else if (wallet === 'metamask') {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
        } else {
          alert('MetaMask not detected. Install it to continue.');
          btn.innerHTML = originalContent;
          btn.disabled = false;
          return;
        }
      }
      
      else if (wallet === 'trustwallet' || wallet === 'coinbase') {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
       } else {
         alert(`${wallet === 'trustwallet' ? 'Trust Wallet' : 'Coinbase Wallet'} not detected. Install it to continue.`);
         btn.innerHTML = originalContent;
         btn.disabled = false;
         return;
       }
     }

      if (address) {
        const networkMap = {
          phantom: 'solana',
          solflare: 'solana',
          backpack: 'solana',
          metamask: 'base',
          trustwallet: 'bnb',
          coinbase: 'base',
        };
        btn.innerHTML = originalContent;
        btn.disabled = false;
        onWalletConnected(address, wallet, networkMap[wallet]);
      }

    } catch (err) {
      console.error('Wallet connection failed:', err);
      alert('Connection failed or was rejected.');
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  });
});

// ===== ON SUCCESSFUL CONNECT =====
function onWalletConnected(address, walletName, network) {
  closeModal();
  landingView.classList.add('hidden');
  dashboardView.classList.remove('hidden');

  const shortAddress = address.slice(0, 4) + '...' + address.slice(-4);
  document.getElementById('walletPillAddress').textContent = shortAddress;

  

  fetch(`network-icons/${network}.svg`)
    .then(res => {
      if (!res.ok) throw new Error(`Network icon fetch failed: ${res.status} for network-icons/${network}.svg`);
      return res.text();
    })
    .then(svg => {
      document.getElementById('walletPillNetwork').innerHTML = svg;
    })
    .catch(err => alert(err.message));

  fetch(`wallet-icons/${walletName}.svg`)
    .then(res => {
      if (!res.ok) throw new Error(`Wallet icon fetch failed: ${res.status} for wallet-icons/${walletName}.svg`);
      return res.text();
    })
    .then(svg => {
      document.getElementById('walletPillWallet').innerHTML = svg;
    })
    .catch(err => alert(err.message));

  populateDashboard(address);
}




// ===== COPY REFERRAL LINK =====
document.getElementById('copyBtn').addEventListener('click', () => {
  const input = document.getElementById('referralLink');
  input.select();
  navigator.clipboard.writeText(input.value);
  const btn = document.getElementById('copyBtn');
  btn.textContent = 'Copied!';
  setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
});












// ===== WALLET PILL DROPDOWN =====
const walletPill = document.getElementById('walletPill');
const walletDropdown = document.getElementById('walletDropdown');

walletPill.addEventListener('click', () => {
  walletDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!walletPill.contains(e.target) && !walletDropdown.contains(e.target)) {
    walletDropdown.classList.add('hidden');
  }
});

document.getElementById('copyAddressBtn').addEventListener('click', () => {
  const address = document.getElementById('walletPillAddress').textContent;
  navigator.clipboard.writeText(address);
  walletDropdown.classList.add('hidden');
});

document.getElementById('switchWalletBtn').addEventListener('click', () => {
  walletDropdown.classList.add('hidden');
  openModal();
});

document.getElementById('disconnectBtn').addEventListener('click', () => {
  walletDropdown.classList.add('hidden');
  dashboardView.classList.add('hidden');
  landingView.classList.remove('hidden');
  document.getElementById('walletPillAddress').textContent = '—';
  document.getElementById('walletPillNetwork').innerHTML = '';
  document.getElementById('walletPillWallet').innerHTML = '';
});




// ===== MOCK DATA =====
const mockActivity = [
  { wallet: '7xKq...9pLm', date: 'Jul 4', points: 120 },
  { wallet: '3nRt...2wZa', date: 'Jul 3', points: 80 },
  { wallet: 'Fq8v...6cBn', date: 'Jul 2', points: 200 },
  { wallet: '9mYh...4dEk', date: 'Jul 1', points: 60 },
  { wallet: '2pXs...8jTr', date: 'Jun 30', points: 150 },
];

const chartLabels = ['May 7', 'May 15', 'May 23', 'May 31', 'Jun 8', 'Jun 16', 'Jun 24', 'Jul 2'];
const chartDataRefs = [0, 1, 0, 2, 1, 3, 2, 4];
const chartDataPoints = [0, 40, 0, 90, 60, 140, 100, 180];

// ===== POPULATE DASHBOARD (called after wallet connects) =====
function populateDashboard(address) {
  document.getElementById('statReferrals').textContent = '47';
  document.getElementById('statPoints').textContent = '2,340';
  document.getElementById('statRank').textContent = '#12';
  document.getElementById('statPending').textContent = '180';
  document.getElementById('statClicks').textContent = '312';
  document.getElementById('statConv').textContent = '15%';

  document.getElementById('referralLink').value =
    `https://rewards.cryptogrowthindex.com/ref/${address.slice(0, 8)}`;

  // Recent referrals preview (top 3)
  const previewBody = document.getElementById('recentPreviewBody');
  previewBody.innerHTML = mockActivity.slice(0, 3).map(row => `
    <tr>
      <td>${row.wallet}</td>
      <td>${row.date}</td>
      <td class="points-cell">+${row.points}</td>
    </tr>
  `).join('');

  // Full referrals table
  const fullBody = document.getElementById('activityTableBody');
  fullBody.innerHTML = mockActivity.map(row => `
    <tr>
      <td>${row.wallet}</td>
      <td>${row.date}</td>
      <td class="points-cell">+${row.points}</td>
    </tr>
  `).join('');

  renderChart('refs');
}

// ===== CHART =====
let activityChart = null;

function renderChart(metric) {
  const ctx = document.getElementById('activityChart');
  const data = metric === 'refs' ? chartDataRefs : chartDataPoints;

  if (activityChart) activityChart.destroy();

  activityChart = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: chartLabels,
      datasets: [{
        label: metric === 'refs' ? 'Referrals' : 'Points',
        data: data,
        backgroundColor: 'rgba(59, 55, 242, 0.5)',
        borderColor: '#3b37f2',
        borderWidth: 2,
        tension: 0.3,
        fill: currentChartType === 'line',
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#eceefc' } },
        x: { grid: { display: false } }
      }
    }
  });
}

let currentChartType = 'bar';
let currentMetric = 'refs';

// Metric toggle (Refs / Points)
document.querySelectorAll('.toggle-btn[data-metric]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-metric]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMetric = btn.dataset.metric;
    renderChart(currentMetric);
  });
});

// Range toggle (7D / 30D / All) — mock: just re-renders same data for now
document.querySelectorAll('.toggle-btn[data-range]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-range]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderChart(currentMetric);
  });
});

// ===== DASHBOARD TAB SWITCHING =====
const dashTabButtons = document.querySelectorAll('.dash-tab-btn');
const dashPanels = {
  overview: document.getElementById('dashTabOverview'),
  referrals: document.getElementById('dashTabReferrals'),
  social: document.getElementById('dashTabSocial'),
};

dashTabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    dashTabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    Object.values(dashPanels).forEach(p => p.classList.add('hidden'));
    dashPanels[btn.dataset.dashtab].classList.remove('hidden');
  });
});

// "View all" jumps to My Referrals tab
document.getElementById('viewAllBtn').addEventListener('click', () => {
  document.querySelector('.dash-tab-btn[data-dashtab="referrals"]').click();
});

// ===== SOCIAL SHARE =====
document.getElementById('shareX').addEventListener('click', () => {
  const link = document.getElementById('referralLink').value;
  const text = encodeURIComponent(`Join me on CGI Rewards! ${link}`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
});

document.getElementById('shareTelegram').addEventListener('click', () => {
  const link = document.getElementById('referralLink').value;
  window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}`, '_blank');
});