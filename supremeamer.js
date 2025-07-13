// ==== SupremeAmer Affiliate Network JS ====
// NOTE: This is a *template*. You must set your real Appwrite, $SA, and BNB addresses, and harden anti-fraud in production!

// ====== CONFIG ======
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1'; // your endpoint
const APPWRITE_PROJECT = '68370442000c3c15b9f3'; // your project ID
const DB_ID = '683705ff00244f73e93f';
const USERS_COLL = 'users', TX_COLL = 'transaction_collection', ADVERTS_COLL = 'adverts', PARTS_COLL = 'participations';
const TOKEN_ADDRESS = "0xYourSupremeAmerBnbTokenAddress"; // your SA token contract
const FUND_RECIPIENT = "0xYourAdminTreasuryBnbAddress"; // your admin/treasury BNB address

const tokenAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

const WELCOME_BONUS = 200; // $SA
const TASK_REWARD = [500, 1000]; // $SA (min, max)
const INVITE_REWARD = 800; // $SA
const ADVERT_MIN_REACH = 1000;
const ADVERT_BNB_FEE = 0.001; // BNB
const FUND_MIN_BNB = 0.0007;
const FUND_MIN_SA = 5000;
const FUND_CHARGE = 0.8/100; // 0.8%
const CASHOUT_MIN_SA = 20000;
const BAN_FINE_BNB = 0.0004; // Fine to unban
const IP_FROZEN_HOURS = 24;

// ====== APPWRITE INIT ======
const client = new Appwrite.Client();
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT);
const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

// ====== STATE ======
let provider, signer, currentAddress, currentUser, userDocId, userDoc, userProfilePic;
let marketAdverts = [], tasks = [], txHistory = [];

// ====== UTILS ======
function showToast(msg, color='green') {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `fixed top-8 right-6 bg-${color}-600 text-white px-4 py-2 rounded shadow-lg z-50 show`;
  setTimeout(()=>toast.classList.add('hide'),2500);
  setTimeout(()=>{toast.classList.remove('show');},3000);
}
function randomAlphaNum(n=7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({length:n},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
}
function getLocalProfilePic(uid) {
  return localStorage.getItem(`profilePic_${uid}`) || "default-avatar.png";
}
function setLocalProfilePic(uid, dataUrl) {
  localStorage.setItem(`profilePic_${uid}`, dataUrl);
}
function getIp() {
  return fetch('https://api.ipify.org?format=json').then(res=>res.json()).then(d=>d.ip);
}
function storeTx(tx) {
  let arr = JSON.parse(localStorage.getItem('txHistory')||'[]');
  arr.unshift(tx);
  localStorage.setItem('txHistory',JSON.stringify(arr.slice(0,100)));
}
function getTxHistory() {
  return JSON.parse(localStorage.getItem('txHistory')||'[]');
}
function sleep(ms) { return new Promise(res=>setTimeout(res,ms)); }

// ====== TABS ======
document.querySelectorAll(".tab-btn[data-tab]").forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    this.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(tc=>tc.classList.remove("active"));
    if(this.dataset.tab) document.getElementById(this.dataset.tab).classList.add("active");
    document.querySelectorAll(".tab-btn").forEach(b=>b.setAttribute('aria-selected', 'false'));
    this.setAttribute('aria-selected', 'true');
  });
});

// ====== MODALS ======
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function openModal(id) { document.getElementById(id).classList.add("open"); }
document.querySelectorAll(".close-modal").forEach(btn=>{
  btn.onclick = () => btn.closest(".modal-bg").classList.remove("open");
});
document.getElementById("profileBtn").onclick = ()=> openModal("profileModal");

// ====== PROFILE PICTURE UPLOAD ======
document.getElementById("profile-pic-upload").onchange = function(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    userProfilePic = ev.target.result;
    setLocalProfilePic(currentUser.$id, userProfilePic);
    document.getElementById("profile-pic").src = userProfilePic;
    document.getElementById("profile-pic-thumb").src = userProfilePic;
  };
  reader.readAsDataURL(file);
};

// ====== LOGOUT ======
document.getElementById("logoutBtn").onclick = async()=>{
  await account.deleteSession('current');
  localStorage.clear();
  window.location.reload();
};

// ====== WALLET ======
document.getElementById("connectWalletBtn").onclick = async()=>{
  if(!window.ethereum) return alert("Install MetaMask.");
  provider = new ethers.BrowserProvider(window.ethereum);
  await window.ethereum.request({method:"eth_requestAccounts"});
  signer = await provider.getSigner();
  currentAddress = await signer.getAddress();
  document.getElementById("walletStatus").textContent = "Wallet Connected";
  document.getElementById("connectWalletBtn").classList.add("hide");
  document.getElementById("disconnectWalletBtn").classList.remove("hide");
  updateWalletDisplay();
};
document.getElementById("disconnectWalletBtn").onclick = ()=>{
  provider = signer = currentAddress = null;
  document.getElementById("walletStatus").textContent = "Wallet Disconnected";
  document.getElementById("wallet-details").classList.add("hide");
  document.getElementById("connectWalletBtn").classList.remove("hide");
  document.getElementById("disconnectWalletBtn").classList.add("hide");
};
async function updateWalletDisplay() {
  document.getElementById("wallet-details").classList.remove("hide");
  document.getElementById("wallet-address").textContent = currentAddress||"";
  if(provider && currentAddress) {
    const bnb = ethers.formatEther(await provider.getBalance(currentAddress));
    document.getElementById("eth-balance").textContent = Number(bnb).toFixed(4)+' BNB';
    try {
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const bal = await contract.balanceOf(currentAddress);
      const dec = await contract.decimals();
      document.getElementById("sa-balance").textContent = ethers.formatUnits(bal,dec)+" $SA";
    } catch{document.getElementById("sa-balance").textContent = "0";}
  }
  document.getElementById("wallet-network").textContent = (await provider.getNetwork()).name;
}

// ====== REGISTER/LOGIN & INIT ======
window.addEventListener("DOMContentLoaded", async()=>{
  try {
    currentUser = await account.get();
    let users = await databases.listDocuments(DB_ID, USERS_COLL, [Appwrite.Query.equal('email', currentUser.email)]);
    userDoc = users.documents[0]; userDocId = userDoc.$id;
    // Assign referral code if missing
    if(!userDoc.referralCode) {
      let code;
      do {
        code = randomAlphaNum(7);
        let exists = await databases.listDocuments(DB_ID, USERS_COLL, [Appwrite.Query.equal('referralCode', code)]);
        if(!exists.documents.length) break;
      }while(1);
      await databases.updateDocument(DB_ID, USERS_COLL, userDocId, {referralCode: code});
      userDoc.referralCode = code;
    }
    // Handle referral
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if(ref && !userDoc.invitedBy) {
      let refUser = await databases.listDocuments(DB_ID, USERS_COLL, [Appwrite.Query.equal('referralCode', ref)]);
      if(refUser.documents.length) {
        await databases.updateDocument(DB_ID, USERS_COLL, userDocId, {
          invitedBy: refUser.documents[0].$id,
          invitedByUsername: refUser.documents[0].name||refUser.documents[0].email.split('@')[0]
        });
      }
    }
    // Welcome bonus
    if(!userDoc.welcomeBonus) {
      document.getElementById("welcomeCard").classList.remove("hide");
      document.getElementById("dismissWelcome").onclick = dismissWelcome;
      document.getElementById("closeWelcome").onclick = dismissWelcome;
    }
    // Profile info
    document.getElementById("user-email").textContent = currentUser.email;
    document.getElementById("user-username").textContent = currentUser.name||currentUser.email.split('@')[0];
    document.getElementById("user-username-modal").textContent = currentUser.name||currentUser.email.split('@')[0];
    document.getElementById("user-email-modal").textContent = currentUser.email;
    document.getElementById("user-id").textContent = currentUser.$id;
    document.getElementById("invite-code").textContent = userDoc.referralCode||"";
    document.getElementById("profile-pic").src = getLocalProfilePic(currentUser.$id);
    document.getElementById("profile-pic-thumb").src = getLocalProfilePic(currentUser.$id);

    setReferralUI();
    await loadBalance();
    await renderAdverts();
    await renderMarket();
    await renderInvites();

    // Balance hide/show
    let showBal = true;
    document.getElementById("toggle-balance").onclick = ()=>{
      showBal = !showBal;
      document.getElementById("balance-num").style.display = showBal?"":"none";
      document.getElementById("toggle-balance").textContent = showBal?"Hide":"Show";
    };
  } catch(e) {
    // Not logged in
    showToast("Please log in.", "red");
  }
});

// ========== WELCOME BONUS ==========
async function dismissWelcome() {
  document.getElementById("welcomeCard").classList.add("hide");
  await databases.updateDocument(DB_ID, USERS_COLL, userDocId, {welcomeBonus: true});
  await databases.createDocument(DB_ID, TX_COLL, 'unique()', {
    userId: currentUser.$id, type: "credit", amount: WELCOME_BONUS, date: new Date().toISOString(),
    description: "Welcome Bonus", status: "completed"
  });
  await loadBalance();
}

// ========== REFERRAL ==========
function setReferralUI() {
  const baseInvite = userDoc.referralCode;
  const inviteUrl = window.location.origin + "/register.html?ref=" + baseInvite;
  document.getElementById("invitation-url").textContent = inviteUrl;
  document.getElementById("copyProfileInviteBtn").onclick = ()=> {
    navigator.clipboard.writeText(inviteUrl); showToast("Copied invite link!");
  };
  document.getElementById("showQrBtn").onclick = ()=>{
    new QRious({element:document.getElementById("inviteQr"), value:inviteUrl, size:160});
    document.getElementById("inviteQrWrap").classList.toggle("hide");
  };
}

// ========== BALANCE ==========
async function loadBalance() {
  let txs = await databases.listDocuments(DB_ID, TX_COLL, [Appwrite.Query.equal('userId', currentUser.$id)]);
  let balance = txs.documents.reduce((s,tx)=>s+(parseFloat(tx.amount)||0),0);
  document.getElementById("balance-num").textContent = balance;
}

// ========== FUND ==========
document.getElementById("fundBtn").onclick = ()=>openModal("fundModal");
document.getElementById("fundAsset").onchange = updateFundFee;
document.getElementById("fundAmount").oninput = updateFundFee;
function updateFundFee() {
  const amt = parseFloat(document.getElementById("fundAmount").value)||0;
  const asset = document.getElementById("fundAsset").value;
  let fee = amt*FUND_CHARGE;
  document.getElementById("fundFee").textContent = "Fee: "+fee.toFixed(4)+" "+asset;
}
document.getElementById("fundPayBtn").onclick = async()=>{
  const amt = parseFloat(document.getElementById("fundAmount").value);
  const asset = document.getElementById("fundAsset").value;
  if(asset==="BNB" && amt<FUND_MIN_BNB) return showToast("Min 0.0007 BNB","red");
  if(asset==="SA" && amt<FUND_MIN_SA) return showToast("Min 5000 SA","red");
  const fee = amt*FUND_CHARGE;
  if(asset==="BNB") {
    if(!signer) return showToast("Connect wallet!","red");
    try{
      const tx=await signer.sendTransaction({to:FUND_RECIPIENT,value:ethers.parseEther(amt.toString())});
      await tx.wait();
      await databases.createDocument(DB_ID, TX_COLL, 'unique()',{
        userId:currentUser.$id,type:"fund",amount:amt-fee,date:new Date().toISOString(),
        description:`Fund BNB (fee ${fee})`,status:"pending",txHash:tx.hash
      });
      storeTx({type:"fund",amount:amt-fee,desc:"Fund BNB",date:new Date().toISOString()});
      closeModal("fundModal"); showToast("Funded! Await admin approval.");
    }catch(e){showToast("Tx failed","red");}
  } else { // $SA
    try{
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const dec = await contract.decimals();
      const tx = await contract.transfer(FUND_RECIPIENT, ethers.parseUnits((amt).toString(), dec));
      await tx.wait();
      await databases.createDocument(DB_ID, TX_COLL, 'unique()',{
        userId:currentUser.$id,type:"fund-sa",amount:amt-fee,date:new Date().toISOString(),
        description:`Fund SA (fee ${fee})`,status:"pending",txHash:tx.hash
      });
      storeTx({type:"fund",amount:amt-fee,desc:"Fund SA",date:new Date().toISOString()});
      closeModal("fundModal"); showToast("Funded! Await admin approval.");
    }catch(e){showToast("Tx failed","red");}
  }
};
// ========== CASHOUT ==========
document.getElementById("cashoutBtn").onclick = ()=>openModal("cashoutModal");
document.getElementById("cashoutConfirmBtn").onclick = async()=>{
  const amt = parseFloat(document.getElementById("cashoutAmount").value);
  if(!amt || amt<CASHOUT_MIN_SA) return showToast("Min is 20000 $SA","red");
  if(!signer) return showToast("Connect wallet!","red");
  await databases.createDocument(DB_ID, TX_COLL, 'unique()',{
    userId:currentUser.$id,type:"cashout",amount:-amt,date:new Date().toISOString(),
    description:`Cashout to wallet`,status:"pending",wallet:currentAddress
  });
  storeTx({type:"cashout",amount:-amt,desc:"Cashout",date:new Date().toISOString()});
  closeModal("cashoutModal"); showToast("Cashout request sent!");
};
// ========== HISTORY ==========
document.getElementById("historyBtn").onclick = ()=>{
  let arr = getTxHistory();
  document.getElementById("history-content").innerHTML = arr.length ? (
    "<ul>"+arr.map(tx=>`<li>${tx.date}: <span class="text-green-700">${tx.type}</span> <b>${tx.amount}</b> (${tx.desc||""})</li>`).join("")+"</ul>"
  ) : "<div>No history.</div>";
  openModal("historyModal");
};

// ========== ADVERT/TASK MARKET ==========
document.getElementById("uploadAdvertBtn").onclick = ()=>openModal("uploadAdvertModal");
document.getElementById("uploadAdvertForm").onsubmit = async function(e){
  e.preventDefault();
  const title = document.getElementById('ad-title').value.trim();
  const cat = document.getElementById('ad-cat').value;
  const reach = parseInt(document.getElementById('ad-reach').value);
  const url = document.getElementById('ad-url').value.trim();
  const desc = document.getElementById('ad-desc').value;
  const imageInput = document.getElementById('ad-image');
  if(title.length<3) return showToast("Title too short","red");
  if(!/^https?:\/\//.test(url)) return showToast("URL must start with http/https","red");
  if(reach<ADVERT_MIN_REACH) return showToast("Reach min 1000","red");
  let imageUrl="";
  if(imageInput.files && imageInput.files[0]) {
    // For demo, skip actual upload, or use Appwrite storage if needed
    const reader = new FileReader();
    reader.onload = async function(ev) {
      imageUrl = ev.target.result;
      await finishAdvertUpload(title,cat,reach,url,desc,imageUrl);
    };
    reader.readAsDataURL(imageInput.files[0]);
    return;
  } else {
    await finishAdvertUpload(title,cat,reach,url,desc,"");
  }
};
async function finishAdvertUpload(title,cat,reach,url,desc,imageUrl) {
  // Fee payment
  if(!signer) return showToast("Connect wallet","red");
  try{
    const tx = await signer.sendTransaction({to:FUND_RECIPIENT, value: ethers.parseEther(ADVERT_BNB_FEE.toString())});
    await tx.wait();
    await databases.createDocument(DB_ID, ADVERTS_COLL, 'unique()',{
      title,category:cat,goal:reach,url,imageUrl,instructions:desc,
      poster:currentUser.$id,posterName:currentUser.name||currentUser.email.split('@')[0],
      posterPic:getLocalProfilePic(currentUser.$id),active:true,createdAt:new Date().toISOString()
    });
    closeModal("uploadAdvertModal"); showToast("Advert uploaded!");
    await renderAdverts(); await renderMarket();
  }catch(e){showToast("Tx failed","red");}
}
async function renderAdverts() {
  // Home page: user's own + active
  let docs = await databases.listDocuments(DB_ID, ADVERTS_COLL, [Appwrite.Query.equal('active',true)]);
  tasks = docs.documents;
  let html = tasks.map(ad=>`
    <div class="card p-3 flex gap-3 items-center fadeIn">
      <img src="${ad.posterPic||'default-avatar.png'}" class="avatar" />
      <div class="flex-1">
        <div class="font-bold text-lg">${ad.title}</div>
        <div class="text-xs">${ad.category} &bull; Goal: ${ad.goal} &bull; Posted by: ${ad.posterName}</div>
        <div class="text-sm text-indigo-800"><b>Instructions:</b> ${ad.instructions||""}</div>
        <a href="${ad.url}" class="text-blue-500 underline" target="_blank">Visit</a>
      </div>
      <button class="btn btn-green participate-btn" data-adid="${ad.$id}">Participate</button>
    </div>
  `).join('');
  document.getElementById("home-tasks").innerHTML = html||"<div>No active tasks.</div>";
  document.querySelectorAll('.participate-btn').forEach(btn=>{
    btn.onclick = ()=>{
      // Participation: reward 500-1000 SA, anti-fraud logic
      let reward = Math.floor(Math.random()*(TASK_REWARD[1]-TASK_REWARD[0]))+TASK_REWARD[0];
      databases.createDocument(DB_ID, TX_COLL, 'unique()',{
        userId:currentUser.$id, type:"task", amount:reward, date:new Date().toISOString(),
        description:"Task participation", status:"completed"
      }).then(()=>{showToast("You earned "+reward+" $SA!");loadBalance();});
    };
  });
}
async function renderMarket() {
  let docs = await databases.listDocuments(DB_ID, ADVERTS_COLL, [Appwrite.Query.equal('active',true)]);
  marketAdverts = docs.documents;
  const sort = document.getElementById("marketSort").value;
  const search = document.getElementById("marketSearch").value.toLowerCase().trim();
  let ads = marketAdverts;
  if(sort!=="newest") ads = ads.filter(ad=>ad.category===sort);
  if(search) ads = ads.filter(ad=>ad.title.toLowerCase().includes(search)||ad.category.toLowerCase().includes(search));
  let html = ads.map(ad=>`
    <div class="card p-3 flex gap-3 items-center fadeIn">
      <img src="${ad.posterPic||'default-avatar.png'}" class="avatar" />
      <div class="flex-1">
        <div class="font-bold text-lg">${ad.title}</div>
        <div class="text-xs">${ad.category} &bull; Goal: ${ad.goal} &bull; Posted by: ${ad.posterName}</div>
        <div class="text-sm text-indigo-800"><b>Instructions:</b> ${ad.instructions||""}</div>
        <a href="${ad.url}" class="text-blue-500 underline" target="_blank">Visit</a>
      </div>
      <button class="btn btn-green participate-btn" data-adid="${ad.$id}">Participate</button>
    </div>
  `).join('');
  document.getElementById("market-list").innerHTML = html||"<div>No adverts found.</div>";
}
document.getElementById("marketSearch").oninput = renderMarket;
document.getElementById("marketSort").onchange = renderMarket;

// ========== INVITES ==========
async function renderInvites() {
  let allUsers = await databases.listDocuments(DB_ID, USERS_COLL, []);
  let myCode = userDoc.referralCode;
  let invites = allUsers.documents.filter(u=>u.invitedBy===currentUser.$id);
  document.getElementById("invite-count").textContent = invites.length;
}

// ========== ANTI-FRAUD (IP CHECK) ==========
window.addEventListener("DOMContentLoaded", async()=>{
  let ip = await getIp();
  let ipUsers = await databases.listDocuments(DB_ID, USERS_COLL, [Appwrite.Query.equal('ip', ip)]);
  if(ipUsers.documents.length>1) {
    let main = ipUsers.documents.find(u=>u.$id===currentUser.$id);
    if(main && main.frozenUntil && new Date()<new Date(main.frozenUntil)) {
      alert("Account frozen due to multi-account. Wait 24h or pay fine to restore.");
      // Ban logic: show fine payment UI, etc.
    }
    if(ipUsers.documents.length>2) {
      await databases.updateDocument(DB_ID, USERS_COLL, currentUser.$id, {status:'banned'});
      alert("Account banned due to repeated multi-account creation.");
    }
  }
});

// ========== END ==========