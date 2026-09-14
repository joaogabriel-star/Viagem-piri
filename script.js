// Cálculo do rateio da viagem a Pirinópolis.
//
// Regra base: valor individual = gasto total / número de pagantes.
// A partir daí:
//   - "casal junto": o homem paga o dele + o da parceira (2x individual);
//     desmarcado, cada um dos dois paga só a própria parte.
//   - gastos extras: qualquer linha que a pessoa quiser adicionar (pedágio,
//     lenha, boia etc.) entra direto no total antes de dividir.
//   - "quantidade de pagantes": simula o valor por pessoa se a turma
//     crescer além dos 10 confirmados. A gasolina (por pagante) escala
//     junto; quem passa de 10 entra na lista como convidado extra,
//     pagando o valor individual.

const FIXED = {
  hospedagem: 1500,
  gasolinaPorPessoa: 50,
};

const singles = ["Thamyres Araújo", "Annanda Ursula"];
const couples = [
  { a: "Ariel Araújo", b: "namorada" },
  { a: "Lucas Junior", b: "Stefannie Lorrane" },
  { a: "João Gabriel", b: "Geovanna Soares" },
  { a: "Gabriel da Sara", b: "Sara Venoque" },
];

const brl = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const alimentacaoInput = document.getElementById("alimentacao");
const alimentacaoOut = document.getElementById("alimentacao-out");
const gasolinaOut = document.getElementById("gasolina-out");

const casalJuntoInput = document.getElementById("casal-junto");
const pagantesInput = document.getElementById("pagantes");
const pagantesOut = document.getElementById("pagantes-out");

const customLabelInput = document.getElementById("custom-label");
const customValueInput = document.getElementById("custom-value");
const customAddBtn = document.getElementById("custom-add");
const customListEl = document.getElementById("custom-list");

const payerCountEl = document.getElementById("payer-count");
const totalGeralEl = document.getElementById("total-geral");
const valorIndividualEl = document.getElementById("valor-individual");
const payerListEl = document.getElementById("payer-list");
const checkMarkEl = document.getElementById("check-mark");

let customItems = [];
try {
  const saved = JSON.parse(localStorage.getItem("piri-gastos-extras") || "[]");
  if (Array.isArray(saved)) customItems = saved;
} catch (e) {
  customItems = [];
}

function saveCustomItems() {
  try {
    localStorage.setItem("piri-gastos-extras", JSON.stringify(customItems));
  } catch (e) {
    /* sem localStorage disponível, segue sem persistir */
  }
}

function renderCustomList() {
  customListEl.innerHTML = "";
  customItems.forEach((item, index) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("span");
    value.className = "custom-list__value";
    value.textContent = brl(item.value);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remover ${item.label}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      customItems.splice(index, 1);
      saveCustomItems();
      renderCustomList();
      calcular();
    });
    li.append(label, value, remove);
    customListEl.appendChild(li);
  });
}

customAddBtn.addEventListener("click", () => {
  const label = customLabelInput.value.trim();
  const value = Number(customValueInput.value);
  if (!label || !Number.isFinite(value) || value <= 0) return;
  customItems.push({ label, value });
  saveCustomItems();
  renderCustomList();
  customLabelInput.value = "";
  customValueInput.value = "";
  customLabelInput.focus();
  calcular();
});

function calcular() {
  const alimentacao = Number(alimentacaoInput.value);
  const casalJunto = casalJuntoInput.checked;
  const payerCount = Number(pagantesInput.value);
  const extraGuests = Math.max(0, payerCount - 10);

  const gasolinaTotal = FIXED.gasolinaPorPessoa * payerCount;
  const extrasTotal = customItems.reduce((sum, item) => sum + item.value, 0);

  const totalGeral = FIXED.hospedagem + gasolinaTotal + alimentacao + extrasTotal;
  const valorIndividual = totalGeral / payerCount;

  alimentacaoOut.textContent = brl(alimentacao);
  gasolinaOut.textContent = brl(gasolinaTotal);
  pagantesOut.textContent = `${payerCount} pessoa${payerCount === 1 ? "" : "s"}`;
  totalGeralEl.textContent = brl(totalGeral);
  valorIndividualEl.textContent = brl(valorIndividual);
  payerCountEl.textContent = String(payerCount);

  payerListEl.innerHTML = "";
  let somaArrecadada = 0;

  couples.forEach((couple) => {
    if (casalJunto) {
      const li = document.createElement("li");
      li.className = "is-couple";
      li.innerHTML = `<span>${couple.a} (casal, cobre a de ${couple.b})</span><span>${brl(valorIndividual * 2)}</span>`;
      payerListEl.appendChild(li);
      somaArrecadada += valorIndividual * 2;
    } else {
      [couple.a, couple.b].forEach((name) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${name}</span><span>${brl(valorIndividual)}</span>`;
        payerListEl.appendChild(li);
        somaArrecadada += valorIndividual;
      });
    }
  });

  singles.forEach((name) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${name}</span><span>${brl(valorIndividual)}</span>`;
    payerListEl.appendChild(li);
    somaArrecadada += valorIndividual;
  });

  for (let i = 1; i <= extraGuests; i++) {
    const li = document.createElement("li");
    li.className = "is-extra";
    li.innerHTML = `<span>Convidado extra ${i}</span><span>${brl(valorIndividual)}</span>`;
    payerListEl.appendChild(li);
    somaArrecadada += valorIndividual;
  }

  const confere = Math.abs(somaArrecadada - totalGeral) < 0.01;
  checkMarkEl.textContent = confere ? "✓" : "✗";
  checkMarkEl.style.color = confere ? "#3f7a4f" : "#b8452f";
}

alimentacaoInput.addEventListener("input", calcular);
casalJuntoInput.addEventListener("change", calcular);
pagantesInput.addEventListener("input", calcular);

renderCustomList();
calcular();
