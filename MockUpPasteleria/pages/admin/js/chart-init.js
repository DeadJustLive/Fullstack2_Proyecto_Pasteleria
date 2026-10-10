document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('salesChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const rootStyles = getComputedStyle(document.documentElement);
  const colorSecondary = rootStyles.getPropertyValue('--bs-secondary').trim() || '#934b19';

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(147, 75, 25, 0.15)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Ventas',
        data: [300, 800, 600, 1300, 1000, 1600, 1400],
        borderColor: colorSecondary,
        backgroundColor: gradient,
        borderWidth: 4,
        pointBackgroundColor: colorSecondary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: colorSecondary,
          bodyColor: colorSecondary,
          borderColor: 'rgba(147, 75, 25, 0.1)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return '$' + context.parsed.y;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#a38f85' }
        },
        y: {
          border: { display: false },
          grid: { color: 'rgba(147, 75, 25, 0.05)', drawBorder: false },
          ticks: {
            color: '#a38f85',
            callback: function(value) {
              if (value === 0) return '$0';
              if (value >= 1000) return '$' + (value / 1000) + 'k';
              return '$' + value;
            }
          },
          min: 0,
          max: 2000
        }
      }
    }
  });
});
