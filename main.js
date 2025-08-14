const amountInput = document.getElementById("amount");
const currencySelect = document.getElementById("currency");
const resultDisplay = document.getElementById("result");
const errorDisplay = document.getElementById("error");
const chartCanvas = document.getElementById("chart");
let chart;

document.getElementById("convert").addEventListener("click", async () => {
  const amount = parseFloat(amountInput.value);
  const currency = currencySelect.value;

  if (isNaN(amount) || amount <= 0) {
    resultDisplay.textContent = "";
    errorDisplay.textContent = "Por favor ingresa un monto válido.";
    return;
  }

  try {
    errorDisplay.textContent = "";
    let data;
    let online = true;

    try {
      const res = await fetch("https://mindicador.cl/api");
      if (!res.ok) throw new Error("API no disponible");
      data = await res.json();
    } catch (error) {
      data = mindicador;
      online = false;
      errorDisplay.textContent = "Se está utilizando información offline.";
    }

    const rate = data[currency].valor;
    const converted = amount / rate;

    resultDisplay.textContent = `${amount} CLP = ${converted.toFixed(2)} ${currency.toUpperCase()}`;

    if (online) {
      try {
        const historyRes = await fetch(`https://mindicador.cl/api/${currency}`);
        const historyData = await historyRes.json();
        const last10 = historyData.serie.slice(0, 10).reverse();

        const labels = last10.map(entry => new Date(entry.fecha).toLocaleDateString());
        const values = last10.map(entry => entry.valor);

        if (chart) chart.destroy();
        chart = new Chart(chartCanvas, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: `Historial de ${currency.toUpperCase()}`,
              data: values,
              borderWidth: 2
            }]
          }
        });
      } catch {
        if (chart) chart.destroy();
        chart = null;
      }
    } else {
      if (chart) chart.destroy();
      chart = null;
    }

  } catch (error) {
    console.error("Error general:", error);
    errorDisplay.textContent = "No se pudo completar la conversión.";
  }
});
