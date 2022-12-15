//API https://api.jikan.moe/v4/
let anime = "https://api.jikan.moe/v4/anime"; //hay que poner {id}/full para obtener todo del que sea
let genero = "https://api.jikan.moe/v4/genres/anime"; //generos
// buscar por genero https://api.jikan.moe/v4/anime?genres={idGenero}
//buscar por anime https://api.jikan.moe/v4/anime?q=${busqueda}&sfw

//Elementos HTML
const lista = document.getElementById("listaAnime");
let selectGeneros = document.getElementById("generos");
let query = document.getElementById("query");
let boton_query = document.getElementById("buscar");
const comentarios = document.getElementById("comentarios");
const cargarMas = document.getElementById("cargarMas");
const favoritos = document.getElementById("favoritos");

let contador = 1;
let intervaloLlamar;
let intervaloLlamarGenero;
let page = 0;
let siguiente = true;

let favs = [];

async function getAnimes() {
  if (siguiente) {
    page++;
    url = `https://api.jikan.moe/v4/anime?page=${page}`;

    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data.data);

        siguiente = data.pagination.has_next_page;

        data.data.forEach((anime) => {
          crearTarjeta(anime);
        });
      });
  }
}

getAnimes();

//CREAR LAS TARJETAS
function crearTarjeta(data) {
  let tarjeta = document.createElement("div");
  tarjeta.classList.add("card");
  tarjeta.setAttribute("id", "carta");

  let cuerpo = document.createElement("div");
  cuerpo.classList.add("cuerpo");
  cuerpo.innerText = data.title;

  let imagen = document.createElement("img");
  imagen.setAttribute("src", data.images.jpg.image_url);
  imagen.classList.add("imagen");
  imagen.addEventListener("click", () => {
  

var favoritos = localStorage.getItem("favoritos") || "[]";
favoritos = JSON.parse(favoritos);

var posLista = favoritos.findIndex(function(e){ return e.mal_id == data.mal_id; });
if(posLista > -1){  
  favoritos.splice(posLista, 1);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
mostrarFavoritos();
  
} else{
  favoritos.push(data);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

   
  });

  let pie = document.createElement("div");
  pie.classList.add("pie");

  tarjeta.appendChild(imagen);
  tarjeta.appendChild(cuerpo);
  lista.appendChild(tarjeta);
}

// SELECT DE LOS GENEROS

//opcion por defecto
let defaultOption = document.createElement("option");
defaultOption.text = "Género";
selectGeneros.add(defaultOption);
selectGeneros.selectedIndex = 0;

//llamar a la API de generos
async function getGeneros() {
  let response = await fetch(`${genero}`);
  let dataGenero = await response.json();
  fillSelectGenero(dataGenero);
}
getGeneros();

//rellenar los options con los generos
const fillSelectGenero = (dataGenero) => {
  dataGenero.data.forEach((element) => {
    let generoName = element.name;
    let generoId = element.mal_id;
    let option = document.createElement("option");
    option.value = generoId;
    option.textContent = generoName;
    selectGeneros.appendChild(option);
  });
};

selectGeneros.addEventListener("change", (e) => {
  lista.innerHTML = "";
  seleccion = e.target.value;
  console.log(seleccion);
  if (siguiente) {
    page++;
    url = `https://api.jikan.moe/v4/anime?genres=${seleccion}`;
    if (seleccion == "Género") {
      getAnimes();
    }

    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data.data);

        siguiente = data.pagination.has_next_page;

        data.data.forEach((anime) => {
          crearTarjeta(anime);
        });
      });
  }
});

//buscar
boton_query.addEventListener("click", () => {
  let busqueda = query.value;
  lista.innerHTML = "";

  if (siguiente) {
    page++;
    url = `https://api.jikan.moe/v4/anime?q=${busqueda}&sfw`;
    if (busqueda == "") {
      getAnimes();
    }

    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data.data);

        siguiente = data.pagination.has_next_page;

        data.data.forEach((anime) => {
          crearTarjeta(anime);
        });
      });
  }
});

//COMENTARIOS

comentarios.addEventListener("click", () => {
  lista.innerHTML = "";
  cargarMas.remove();

  lista.innerHTML = `<section class="caja_comentarios">
  <h1>COMENTARIOS</h1>
  <div>
    <form action="" id="form">
      <textarea class="comentario" id="input-name" cols="40" rows="6">
      
      </textarea>
      <button type="submit" id="btn-add">Añadir</button>
    </form>
  </div>

  <ul id="to-do-list"></ul>
</section>`;

  const inputElem = document.querySelector("#input-name");
  const form = document.querySelector("#form");
  const listElem = document.querySelector("#to-do-list");
  const buttonElem = document.querySelector("#to-do-list button");

  const toDoArray = JSON.parse(localStorage.getItem("to-do-list")) || [];

  function updateList() {
    listElem.innerHTML = "";

    for (const key in toDoArray) {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.innerText = toDoArray[key];

      const button = document.createElement("button");
      button.innerText = "Delete";
      button.setAttribute("key", key);
      button.classList.add("delete");

      li.appendChild(span);
      li.appendChild(button);
      listElem.appendChild(li);
    }

    localStorage.setItem("to-do-list", JSON.stringify(toDoArray));
  }

  function addToList(value) {
    if (value === "") return;

    toDoArray.push(value);

    updateList();
    inputElem.value = "";
    inputElem.focus();
  }

  function deleteFromList(key) {
    toDoArray.splice(Number(key), 1);

    updateList();
    inputElem.value = "";
    inputElem.focus();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addToList(inputElem.value);
  });

  document.addEventListener("click", (e) => {
    const el = e.target;
    if (el.classList.contains("delete")) {
      deleteFromList(el.getAttribute("key"));
    }
  });

  updateList();
});

//FAVORITOS
function mostrarFavoritos(){
  lista.innerHTML = "";
  
  cargarMas.remove();

  let favsFromJSON = localStorage.getItem("favoritos");

  favs = JSON.parse(favsFromJSON);

  favs.forEach((fav) => {
    console.log(fav)
    crearTarjeta(fav);
  });
}
favoritos.addEventListener("click", mostrarFavoritos);

