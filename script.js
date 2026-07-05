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
        onWalletConnected(address);
      }

    } catch (err) {
      console.error('Wallet connection failed:', err);
      alert('Connection failed or was rejected.');
    }
  });
});

// ===== ON SUCCESSFUL CONNECT =====
function onWalletConnected(address) {
  closeModal();
  landingView.classList.add('hidden');
  dashboardView.classList.remove('hidden');

  const shortAddress = address.slice(0, 4) + '...' + address.slice(-4);
  document.getElementById('walletPill').textContent = shortAddress;

  // Mock stats — replace with real data later
  document.getElementById('statReferrals').textContent = '47';
  document.getElementById('statPoints').textContent = '2,340';
  document.getElementById('statRank').textContent = '#12';
  document.getElementById('statPending').textContent = '180';

  document.getElementById('referralLink').value =
    `https://rewards.cryptogrowthindex.com/ref/${address.slice(0, 8)}`;
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




// Mock activity data — replace with real data later
const mockActivity = [
  { wallet: '7xKq...9pLm', date: 'Jul 4', points: 120 },
  { wallet: '3nRt...2wZa', date: 'Jul 3', points: 80 },
  { wallet: 'Fq8v...6cBn', date: 'Jul 2', points: 200 },
  { wallet: '9mYh...4dEk', date: 'Jul 1', points: 60 },
  { wallet: '2pXs...8jTr', date: 'Jun 30', points: 150 },
];

function renderActivityTable() {
  const tbody = document.getElementById('activityTableBody');
  tbody.innerHTML = mockActivity.map(row => `
    <tr>
      <td>${row.wallet}</td>
      <td>${row.date}</td>
      <td class="points-cell">+${row.points}</td>
    </tr>
  `).join('');
}

renderActivityTable();







// disconnect button 
document.getElementById('disconnectBtn').addEventListener('click', () => {
  dashboardView.classList.add('hidden');
  landingView.classList.remove('hidden');
  document.getElementById('walletPill').textContent = '—';
});