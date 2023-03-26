const firebaseConfig = {
  apiKey: "G3kPVqMehyaBrhW05O3qLPU86psQ4Jdu2SVWkoGw",
  databaseURL: "https://sensorbio-ceac7-default-rtdb.firebaseio.com/",
};

firebase.initializeApp(firebaseConfig);

const nomesRef = firebase.database().ref('nomes/');
const logsRef = firebase.database().ref('logs');
const corpoTabela = document.getElementById('corpo-tabela');
var sensorStatusRef = firebase.database().ref('sensor_status');
var janela = document.getElementById("janela");
var currentRow;
let horariosPrimeiraEntrada = {};

//Escute mudanças no nó sensor_status
sensorStatusRef.on('value', function(snapshot) {
  //Obtenha o valor do nó sensor_status
  var sensorStatus = snapshot.val();
  //Remova a linha anterior, se existir
  if (currentRow) {
    janela.removeChild(currentRow);
  }
  //Crie uma nova linha na tabela
  var newRow = document.createElement("tr");

  //Crie a célula do cabeçalho "Janela"
  var th = document.createElement("th");
  th.innerText = "Status:";

  //Crie uma nova célula para os dados do sensor_status
  var td = document.createElement("td");

  //Verifique o valor do sensor_status e defina o texto da célula de acordo
 if (sensorStatus === "ligado") {
  td.innerText = "JANELA ABERTA, RISCO DE FURTO!!";
  td.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
} else if (sensorStatus === "desligado") {
  td.innerText = "Janela Fechada";
  td.style.transition = "background-color 1s ease-in-out";
  td.style.backgroundColor = "#228B22";
  setTimeout(function() {
    td.style.transition = "background-color 1s ease-in-out";
    td.style.backgroundColor = ""; // Remove a cor de fundo para desfazer a transição
  }, 1000);
} else {
  td.innerText = "Status desconhecido";
}

  //Adicione a célula do cabeçalho e a célula dos dados na nova linha
  newRow.appendChild(th);
  newRow.appendChild(td);

  //Adicione a nova linha na tabela
  janela.appendChild(newRow);

  //Armazene uma referência à nova linha
  currentRow = newRow;
});

let nomes = {}; // Variável para armazenar os nomes, inicialmente vazia

// Adiciona um listener para atualizar a variável "nomes" sempre que houver alterações no Firebase
nomesRef.on('value', (snapshot) => {
  corpoTabela.innerHTML = '';

  snapshot.forEach((childSnapshot) => {
    const id = childSnapshot.key;
    const nome = childSnapshot.val().nome;

    const novaLinha = document.createElement('tr');
    novaLinha.setAttribute('data-id', id);

    const nomeCelula = document.createElement('td');
    nomeCelula.innerText = nome;
    nomeCelula.classList.add('nome');

    const entradaCelula = document.createElement('td');
    entradaCelula.innerText = '';
    entradaCelula.classList.add('entrada');

    novaLinha.appendChild(nomeCelula);
    novaLinha.appendChild(entradaCelula);

    corpoTabela.appendChild(novaLinha);
  });
});

logsRef.on('child_changed', (snapshot) => {
  const logData = snapshot.val();

  // Extrai o ID da pessoa a partir do nome da chave
  const id = snapshot.key.split("_")[1];

  // Obtém a linha correspondente na tabela
  const linha = document.querySelector(`tr[data-id="${id}"]`);

  if (linha) {
    // Obtém o nome e a mensagem da pessoa
    const [nome, mensagem] = logData[Object.keys(logData)[0]].split(" - ");

    // Atualiza as células da linha correspondente na tabela
    linha.querySelector('.nome').innerText = nome;
    linha.querySelector('.entrada').innerText = mensagem;
  }
});

function adicionarEntrada(id, nome, mensagem) {
  let horaAtual;
  if (horariosPrimeiraEntrada[id]) {
    horaAtual = horariosPrimeiraEntrada[id];
  } else if (nomes[id] && nomes[id].hora) {
    horaAtual = nomes[id].hora;
  } else {
    horaAtual = new Date();
  }
  const chave = logsRef.push().key;
  logsRef.child(chave).set({
    dataHora: horaAtual.getTime(),
    id: id,
    nome: nome,
    mensagem: mensagem,
  });
  // Cria um novo registro no Firebase com o nome e a mensagem
  logsRef.child(`log_${id}`).set({
    [new Date().getTime()]: `${nome} - ${mensagem}`,
  });
  horariosPrimeiraEntrada[id] = horaAtual;
  nomes[id] = { nome, hora: horaAtual };
}

// Adiciona um listener para atualizar a tabela inteira sempre que houver alterações no Firebase
logsRef.on('value', (snapshot) => {
  // Limpa a tabela
  corpoTabela.innerHTML = '';

  // Itera sobre todos os registros no Firebase
  snapshot.forEach((childSnapshot) => {
    const logData = childSnapshot.val();
    const id = childSnapshot.key.split("_")[1];

    // Obtém o nome e a mensagem da pessoa
    const [nome, mensagem] = logData[Object.keys(logData)[0]].split(" - ");

    // Cria uma nova linha na tabela com o nome e a mensagem
    const novaLinha = document.createElement('tr');
    novaLinha.setAttribute('data-id', id);
    const nomeCelula = document.createElement('td');
    nomeCelula.innerText = nome;
    nomeCelula.classList.add('nome');

    const entradaCelula = document.createElement('td');
    entradaCelula.innerText = mensagem;
    entradaCelula.classList.add('entrada');

    novaLinha.appendChild(nomeCelula);
    novaLinha.appendChild(entradaCelula);

    corpoTabela.appendChild(novaLinha);

const hora = new Date().toLocaleDateString('pt-BR', {day: '2-digit', month:'2-digit', year:'2-digit'});
const horarioCelula = document.createElement('td');
horarioCelula.innerText = hora;
horarioCelula.classList.add('Data');

novaLinha.appendChild(horarioCelula);
  });
}); 