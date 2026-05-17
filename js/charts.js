let chart;
export function initChart() {
    const ctx = document.getElementById('grafica-canvas').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Energía absorbida (J)', data: [], backgroundColor: 'rgba(255,140,66,0.7)' }] },
        options: { responsive: false, scales: { y: { beginAtZero: true } } }
    });
}
export function updateChart(material, energia) {
    if (!chart) return;
    chart.data.labels.push(material);
    chart.data.datasets[0].data.push(energia);
    chart.update();
}