let trendChart, topChart;
let rawData;

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    rawData = data;
    initFilters();
    updateDashboard();
  });

function initFilters() {
  const monthSelect = document.getElementById('filterMonth');
  rawData.months.forEach((m,i)=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  const types = [...new Set(rawData.products.map(p => p.type))];
  const typeSelect = document.getElementById('filterType');
  types.forEach(t=>{
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t.toUpperCase();
    typeSelect.appendChild(opt);
  });

  document.querySelectorAll('select').forEach(s=>{
    s.addEventListener('change', updateDashboard);
  });
}

function updateDashboard() {
  const month = document.getElementById('filterMonth').value;
  const year = document.getElementById('filterYear').value;
  const type = document.getElementById('filterType').value;

  let filtered = rawData.products.filter(p=>{
    return (year === 'all' || p.year == year) &&
           (type === 'all' || p.type === type);
  });

  let totalUnit = 0;
  let totalRevenue = 0;
  let monthlySum = new Array(12).fill(0);

  filtered.forEach(p=>{
    p.monthly.forEach((v,i)=>{
      if(month === 'all' || month == i){
        totalUnit += v;
        totalRevenue += v * p.price;
        monthlySum[i] += v;
      }
    });
  });

  document.getElementById('kpiUnit').textContent = totalUnit;
  document.getElementById('kpiRevenue').textContent =
    'Rp ' + totalRevenue.toLocaleString('id-ID');
  document.getElementById('kpiAvg').textContent =
    Math.round(totalUnit / (month === 'all' ? 12 : 1));

  const topProduct = filtered
    .map(p => ({
      name: p.name,
      total: p.monthly.reduce((a,b)=>a+b,0)
    }))
    .sort((a,b)=>b.total-a.total)[0];

  document.getElementById('kpiTop').textContent =
    topProduct ? topProduct.name : '-';

  updateCharts(monthlySum, filtered);
  updateInsight(type);
}

function updateCharts(monthlySum, products) {
  if(trendChart) trendChart.destroy();
  if(topChart) topChart.destroy();

  trendChart = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: rawData.months,
      datasets: [{
        data: monthlySum,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.15)',
        fill: true,
        tension: 0.4
      }]
    },
    options: { plugins:{ legend:{ display:false }}}
  });

  const top5 = products.map(p=>({
    name: p.name,
    total: p.monthly.reduce((a,b)=>a+b,0)
  })).sort((a,b)=>b.total-a.total).slice(0,5);

  topChart = new Chart(document.getElementById('topChart'), {
    type: 'bar',
    data: {
      labels: top5.map(p=>p.name),
      datasets: [{
        data: top5.map(p=>p.total),
        backgroundColor: '#38bdf8'
      }]
    },
    options:{ indexAxis:'y', plugins:{ legend:{ display:false }}}
  });
}

function updateInsight(type){
  const insight = document.getElementById('insightText');
  if(type === 'fullface'){
    insight.textContent =
      'Produk Full Face menunjukkan performa tertinggi. Disarankan meningkatkan stok dan promosi untuk segmen premium.';
  } else if(type === 'retro'){
    insight.textContent =
      'Helm retro memiliki pasar niche. Fokus pada branding dan komunitas motor klasik.';
  } else {
    insight.textContent =
      'Penjualan relatif stabil. Optimalkan promosi pada bulan dengan penurunan penjualan untuk menjaga pertumbuhan.';
  }
}
