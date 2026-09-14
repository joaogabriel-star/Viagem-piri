// Cálculo do rateio da viagem a Pirinópolis.
//
// Regra:
//   1. valor individual = gasto total / 10 pagantes
//   2. cada solteira paga o valor individual
//   3. cada homem de casal paga o valor individual dele + o da parceira
//      (ou seja, o dobro do individual)
// Não há divisão por "unidades de pagamento" — isso foi removido.

const FIXED = {
  hospedagem: 1500,
  gasolinaPorPessoa: 50,
  pagantes: 10,
};

const singles = ["Thamyres Araújo", "Annanda Ursula"];
const couples = [
  "Ariel Araújo",
  "Lucas Junior",
  "João Gabriel",
  "Gabriel da Sara",
];

const brl = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const alimentacaoInput = document.getElementById("alimentacao");
const diversaoInput = document.getElementById("diversao");
const alimentacaoOut = document.getElementById("alimentacao-out");
const diversaoOut = document.getElementById("diversao-out");

const totalGeralEl = document.getElementById("total-geral");
const valorIndividualEl = document.getElementById("valor-individual");
const valorCasalEl = document.getElementById("valor-casal");
const payerListEl = document.getElementById("payer-list");
const checkMarkEl = document.getElementById("check-mark");

function calcular() {
  const alimentacao = Number(alimentacaoInput.value);
  const diversao = Number(diversaoInput.value);
  const gasolinaTotal = FIXED.gasolinaPorPessoa * FIXED.pagantes;

  const totalGeral = FIXED.hospedagem + gasolinaTotal + alimentacao + diversao;
  const valorIndividual = totalGeral / FIXED.pagantes;
  const valorCasal = valorIndividual * 2;

  alimentacaoOut.textContent = brl(alimentacao);
  diversaoOut.textContent = brl(diversao);
  totalGeralEl.textContent = brl(totalGeral);
  valorIndividualEl.textContent = brl(valorIndividual);
  valorCasalEl.textContent = brl(valorCasal);

  payerListEl.innerHTML = "";

  couples.forEach((name) => {
    const li = document.createElement("li");
    li.className = "is-couple";
    li.innerHTML = `<span>${name} (casal)</span><span>${brl(valorCasal)}</span>`;
    payerListEl.appendChild(li);
  });

  singles.forEach((name) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${name}</span><span>${brl(valorIndividual)}</span>`;
    payerListEl.appendChild(li);
  });

  const somaArrecadada = couples.length * valorCasal + singles.length * valorIndividual;
  const confere = Math.abs(somaArrecadada - totalGeral) < 0.01;
  checkMarkEl.textContent = confere ? "✓" : "✗";
  checkMarkEl.style.color = confere ? "#3f8a4f" : "#b23c3c";
}

alimentacaoInput.addEventListener("input", calcular);
diversaoInput.addEventListener("input", calcular);

calcular();
