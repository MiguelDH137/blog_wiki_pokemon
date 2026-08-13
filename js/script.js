// ======= variables globales ======= //
let todosLosPokemones = []; // Arreglo para guardar la lista completa de la API
let pokemonesFiltrados = []; // Copia del arreglo original para filtros y paginacion
const limitePokemon = 500;

// variables de paginacion
let pagina = 1; // pagina actual
const paginaLimite = 20; // limite de elementos por pagina

// ====== Elementos del DOM ====== //
const pokeTargets = document.getElementById('pokeTargets');
const selectTipo = document.getElementById('selectTipo');
const inputBusqueda = document.getElementById('inputBusqueda');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnAnterior = document.getElementById('btnAnterior');
const btnDarkMode = document.getElementById('btnDarkMode');

btnDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('darkBody');
})

// ======= Evento de paginacion =======//
btnSiguiente.addEventListener('click', () => {
    const totalPaginas = pokemonesFiltrados.length / paginaLimite;
    if (pagina < totalPaginas) {
        pagina += 1;
        imprimirPokedex(); // Solo renderizamos la pagina, no llamamos a init()
    }
});
btnAnterior.addEventListener('click', () => {
    if (pagina > 1) {
        pagina -= 1;
        imprimirPokedex();
    }
});

// ======= Funncion para extraer la lista de pokemones de la API ======= //
const listaPokemones = async(limitePokemon) => {
    // Traer informacion de la API con GET
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limitePokemon}&offset=0`)

    if (!respuesta.ok) {
        console.error(`Error en la llamada a la API: ${respuesta.status}`);
    
    } else if (respuesta.status === 200) { // Condicion si el estado de la respuesta es 200 procesa la informacion a JSON
        const datosRecibidos = await respuesta.json(); // datos recibidos a formato json
        console.log(datosRecibidos) // Imprime los datos extraidos de la API

        const listaDetallada = await Promise.all( // nuevo arreglo con la info detallada de cada pokemon
            datosRecibidos.results.map(async (pokemon) => { // dentro de la varible datosRecibidos buscamos la propiedad results con todos los datos
                const detallesRecibidos = await fetch(pokemon.url); // extraemos los detalles individuales
                
                const pokeDetalles = await detallesRecibidos.json(); // pasamos los detalles individuales a json

                let listaTipos = pokeDetalles.types 
                    ? pokeDetalles.types.map(item => item.type.name)
                    : [];
                return { // guardamos las propiedades necesarias
                    id: pokeDetalles.id,
                    name: pokeDetalles.name,
                    image: pokeDetalles.sprites.front_default,
                    types: listaTipos
                }
            })
        )
        return listaDetallada.filter(pokemon => pokemon != null);
    }
}

// ======= Funcion para mostrar y limitar en el html
const imprimirPokedex = () => {
    pokeTargets.innerHTML = '';
    
    // calculo para el rango de elemento que extraera slice()
    const inicio = (pagina - 1) * paginaLimite;
    const fin = inicio + paginaLimite;
    const pokePagina = pokemonesFiltrados.slice(inicio, fin);
    
    let pokeCards = '';
    pokePagina.forEach(pokemon => {
        let tiposHTML = '';
        for (const tipo of pokemon.types) {
            tiposHTML += `<span class="pokeTipo ${tipo}">${tipo}</span>`
        }
        pokeCards += `
            <div class="pokeTarjeta">
                <div class="typesLine">
                    ${tiposHTML}
                </div>
                <div >
                    <img src="${pokemon.image}" alt="imagen de ${pokemon.name}">
                </div>
                <div class="pokeInfo">
                    <h3>N: ${pokemon.id} <br> Nombre: ${pokemon.name}</h3>
                </div>    
            </div>
        `
    })
    pokeTargets.innerHTML = pokeCards;
}

// ====== Funcion para filtrar ====== //
const aplicarFiltros = () => {
    const tipoSeleccionado = selectTipo.value;
    const textoBusqueda = inputBusqueda.value;
    
    pagina = 1;
    
    pokemonesFiltrados = todosLosPokemones.filter(pokemon => {
        const coincideTipo = (tipoSeleccionado === 'Todos') || pokemon.types.includes(tipoSeleccionado);
    
        const coincideNombre = pokemon.name.includes(textoBusqueda);
    
        const coincideId = pokemon.id.toString().includes(textoBusqueda)
        
        const coincidebusqueda = coincideNombre || coincideId
    
        return coincideTipo && coincidebusqueda;
    });
    imprimirPokedex();
}

// ======= Eventos de Filtro y Búsqueda ======= //
selectTipo.addEventListener('change', aplicarFiltros);
inputBusqueda.addEventListener('input', aplicarFiltros);

// ======= Funcion para extraer tipos del endpoint ======= //
const extraerTipos = async () => {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/type`);
    let respuestaStatus = (respuesta.ok)
    ? datosRecibidos.results.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.name;
            option.textContent = tipo.name;
            selectTipo.appendChild(option);
        })
    : console.error(`Error al cargar la lista de tipos`);
}

// ======= Funcion de inicio ======= //
const init = async () => {
    extraerTipos();
    todosLosPokemones = await listaPokemones(limitePokemon) || [];
    pokemonesFiltrados = [...todosLosPokemones];
    imprimirPokedex();
}

init();