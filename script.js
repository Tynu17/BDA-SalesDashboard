fetch('data.json')
  .then(response => response.json())
  .then(data => {

    // ===============================
    // HITUNG TOTAL PENJUALAN PER PRODUK
    // ===============================
    const totalPerProduk = {};

    data.forEach(item => {
      if (!totalPerProduk[item.produk]) {
        totalPerProduk[item.produk] = 0;
      }
      totalPerProduk[item.produk] += item.jumlah;
    });

    // ===============================
    // TOP 5 PRODUK TERLARIS
    // ===============================
    const top5 = Object.entries(totalPerProduk)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = top5.map(item => item[0]);
    const values = top5.map(item => item[1]);

    // ===============================
    // BAR CHART
    // ===============================
    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Penjualan',
          data: values,
          backgroundColor: '#90CAF9'
        }]
      }
    });

    // ===============================
    // PRODUK TERLARIS (NO 1)
    // ===============================
    const produkTerlaris = top5[0][0];
    document.getElementById('produkNama').innerText = produkTerlaris;

    // ===============================
    // DATA TREND BULANAN PRODUK TERLARIS
    // ===============================
    const bulanMap = {};

    data
      .filter(item => item.produk === produkTerlaris)
      .forEach(item => {
        if (!bulanMap[item.bulan]) {
          bulanMap[item.bulan] = 0;
        }
        bulanMap[item.bulan] += item.jumlah;
      });

    const bulanLabels = Object.keys(bulanMap);
    const bulanValues = Object.values(bulanMap);

    // ===============================
    // LINE CHART
    // ===============================
    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: bulanLabels,
        datasets: [{
          label: `Tren Penjualan ${produkTerlaris}`,
          data: bulanValues,
          borderColor: '#42A5F5',
          fill: false,
          tension: 0.3
        }]
      }
    });

  });
