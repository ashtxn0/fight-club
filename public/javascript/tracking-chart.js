(async function() {

  Chart.defaults.font.family	='Roboto';
  Chart.defaults.font.size=16;
  let eventNames = userChartData.map((bet) => bet.eventName);
  let profits = userChartData.map((bet) => bet.profit);
  
    new Chart(
      document.getElementById('tracked-bets-chart'),
      {
        type: 'line',
        data: {
          labels: eventNames,
          datasets: [{
            label: 'Profit by event',
            data: profits,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          labels:{
            font:{
              size: 16,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                color: "white",
                font:{
                  size: 14,
                },
                display: true,
                text: "Profit (Units)"
              },
              grid: {
                color: "#f6f3ef6c"
              }
            },
            x: {
              ticks: {
                display: false // Set to false to hide X-axis labels
              },
              grid: {
                color: "#f6f3ef6c"
              }
            }
          }
        }
      }
    );
  })();
   