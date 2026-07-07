/* ProCare — shared data + logic (demo layer, localStorage-backed).
   In production this is replaced by a real API + database. */
(function (global) {
  "use strict";

  const KEY = "procare_v1";

  // Default seed data — the "CMS" content the admin panel can edit.
  const SEED = {
    services: [
      { id: "hvac", name: "HVAC & Climate Systems", icon: "❄️", cat: "Technical",
        blurb: "Preventive servicing, repairs and 24/7 emergency cover for chillers, AHUs and split units.",
        price: 220, unit: "per visit", duration: 120, active: true,
        properties: ["Hotel","Resort","Residential","Commercial"] },
      { id: "elec", name: "Electrical Maintenance", icon: "⚡", cat: "Technical",
        blurb: "Certified inspections, fault-finding, panel upgrades and compliance testing.",
        price: 180, unit: "per visit", duration: 90, active: true,
        properties: ["Hotel","Residential","Commercial"] },
      { id: "plumb", name: "Plumbing & Water Systems", icon: "🚰", cat: "Technical",
        blurb: "Leak detection, pump servicing, drainage and water-quality management.",
        price: 160, unit: "per visit", duration: 90, active: true,
        properties: ["Hotel","Resort","Residential","Commercial"] },
      { id: "clean", name: "Deep Cleaning & Housekeeping", icon: "🧽", cat: "Facilities",
        blurb: "Scheduled deep cleans, common-area upkeep and post-event turnaround crews.",
        price: 320, unit: "per crew/day", duration: 240, active: true,
        properties: ["Hotel","Resort","Residential","Commercial"] },
      { id: "land", name: "Landscaping & Grounds", icon: "🌿", cat: "Facilities",
        blurb: "Grounds maintenance, irrigation, seasonal planting and pool-deck care.",
        price: 140, unit: "per visit", duration: 120, active: true,
        properties: ["Resort","Residential","Commercial"] },
      { id: "sec", name: "Security & Access Systems", icon: "🔐", cat: "Technical",
        blurb: "CCTV, access control and alarm servicing with rapid response call-outs.",
        price: 200, unit: "per visit", duration: 90, active: true,
        properties: ["Hotel","Residential","Commercial"] },
    ],
    // Business hours slots offered per day
    slotTemplate: ["08:00","10:00","12:00","14:00","16:00"],
    // Bookings created by clients (used to block double-booking)
    bookings: [
      { id:"BK-1042", service:"hvac", serviceName:"HVAC & Climate Systems", date: offsetDate(2), time:"10:00",
        property:"Grand Marina Hotel", type:"Hotel", contact:"Ops Team", email:"ops@example.com",
        status:"confirmed", amount:220 },
      { id:"BK-1043", service:"clean", serviceName:"Deep Cleaning & Housekeeping", date: offsetDate(3), time:"08:00",
        property:"Willowbrook Residences", type:"Residential", contact:"Facilities", email:"fm@example.com",
        status:"hold", amount:320 },
      { id:"BK-1041", service:"elec", serviceName:"Electrical Maintenance", date: offsetDate(-1), time:"14:00",
        property:"Central Plaza Mall", type:"Commercial", contact:"Site Admin", email:"admin@example.com",
        status:"done", amount:180 },
    ],
  };

  function offsetDate(days) {
    // deterministic-ish date string based on load time
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const fresh = JSON.parse(JSON.stringify(SEED));
    save(fresh);
    return fresh;
  }
  function save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  const DB = {
    all() { return load(); },
    reset() { localStorage.removeItem(KEY); return load(); },

    services(activeOnly) {
      const s = load().services;
      return activeOnly ? s.filter(x => x.active) : s;
    },
    service(id) { return load().services.find(s => s.id === id); },
    saveService(svc) {
      const db = load();
      const i = db.services.findIndex(s => s.id === svc.id);
      if (i >= 0) db.services[i] = svc; else db.services.push(svc);
      save(db); return svc;
    },
    deleteService(id) {
      const db = load();
      db.services = db.services.filter(s => s.id !== id);
      save(db);
    },

    bookings() { return load().bookings.slice().sort((a,b)=> (a.date+a.time) < (b.date+b.time) ? 1 : -1); },
    // slots already taken for a given service+date (double-booking guard)
    takenSlots(serviceId, date) {
      return load().bookings
        .filter(b => b.service === serviceId && b.date === date && b.status !== "cancelled")
        .map(b => b.time);
    },
    slotTemplate() { return load().slotTemplate; },
    addBooking(b) {
      const db = load();
      // guard: reject if slot already taken
      const clash = db.bookings.some(x => x.service===b.service && x.date===b.date && x.time===b.time && x.status!=="cancelled");
      if (clash) return { ok:false, reason:"slot_taken" };
      b.id = "BK-" + (1044 + db.bookings.length);
      db.bookings.push(b);
      save(db);
      return { ok:true, booking:b };
    },
    setStatus(id, status) {
      const db = load();
      const b = db.bookings.find(x => x.id === id);
      if (b) b.status = status;
      save(db);
    },
  };

  // ---- shared UI helpers ----
  function money(n){ return "$" + Number(n).toLocaleString(); }
  function fmtDate(iso){
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  }
  function toast(msg){
    let t = document.querySelector(".toast");
    if(!t){ t=document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
    t.innerHTML = "✓ " + msg;
    requestAnimationFrame(()=>t.classList.add("show"));
    clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2600);
  }

  // reveal on scroll
  function initReveal(){
    const els = document.querySelectorAll(".reveal");
    if(!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("in")); return; }
    const io = new IntersectionObserver((es)=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
    },{threshold:.12});
    els.forEach(e=>io.observe(e));
  }

  // mobile menu
  function initMenu(){
    const btn = document.querySelector(".menu-btn");
    const links = document.querySelector(".nav-links");
    if(btn&&links){ btn.addEventListener("click",()=>{
      const open = links.style.display === "flex";
      links.style.display = open ? "" : "flex";
      links.style.flexDirection="column";
      links.style.position="absolute";links.style.top="70px";links.style.left="0";links.style.right="0";
      links.style.background="#fff";links.style.padding="18px 24px";links.style.borderBottom="1px solid var(--line)";links.style.gap="1rem";
    }); }
  }

  global.PC = { DB, money, fmtDate, toast, initReveal, initMenu };
  document.addEventListener("DOMContentLoaded", ()=>{ initReveal(); initMenu(); });
})(window);
