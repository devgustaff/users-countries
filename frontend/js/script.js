let globalUsers = [];
let globalCountries = [];
let globalUserCountries = [];
let globalFilterUserCountries = [];
let divUsers = document.querySelector("#divUsers");

async function start() {
  // await promiseUsers();
  // await promiseCountries();
  await Promise.all([promiseUsers(), promiseCountries()]);

  hideSpinner();
  mergeUsersAndCountries();
  enableFilter();
  render();
}

function promiseUsers() {
  return new Promise(async (resolve, reject) => {
    await fetchUsers();

    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

function promiseCountries() {
  return new Promise(async (resolve, reject) => {
    await fetchCountries();

    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

async function fetchUsers() {
  const usersResponse = await fetch("http://localhost:3001/users");
  const usersJson = await usersResponse.json();

  globalUsers = usersJson
    .map(({ nat, name, login, picture }) => {
      const fullName = `${name.first} ${name.last}`;
      return {
        userId: login.uuid,
        userName: fullName,
        userPicture: picture.large,
        userNat: nat,
      };
    })
    .sort((a, b) => a.userName.localeCompare(b.userName));
}

async function fetchCountries() {
  const countriesResponse = await fetch("http://localhost:3002/countries");
  const countriesJson = await countriesResponse.json();

  globalCountries = countriesJson.map(({ alpha2Code, flag, name }) => {
    return {
      countryId: alpha2Code,
      countryName: name,
      countryFlag: flag,
    };
  });
}

function hideSpinner() {
  document.querySelector("#spinner").classList.add("hide");
}

function mergeUsersAndCountries() {
  globalUserCountries = [];

  globalUsers.forEach((user) => {
    const country = globalCountries.find(
      (country) => country.countryId === user.userNat
    );
    const { countryName, countryFlag } = country;

    globalUserCountries.push({
      ...user,
      countryName,
      countryFlag,
    });
  });
  globalFilterUserCountries = [...globalUserCountries];
}

function enableFilter() {
  const inputFilter = document.querySelector("#inputFilter");
  inputFilter.addEventListener("input", handleFilterChange);

  function handleFilterChange(event) {
    const filterText = event.target.value;

    if (filterText.trim() === "") {
      globalFilterUserCountries = globalUserCountries;
      render();
      return;
    }
    filterUsers(filterText);
  }
}

function filterUsers(text) {
  divUsers.innerHTML = "";
  globalFilterUserCountries = globalUserCountries.filter((user) =>
    user.userName.includes(text)
  );

  if (globalFilterUserCountries.length == 0) {
    divUsers.innerHTML = `<div class="center"><h4>Nenhum usuário encontrado.</h4></div>`;
    return;
  }
  render();
}

function render() {
  divUsers.innerHTML = `
    <div class="row">
      ${globalFilterUserCountries
        .map(({ userName, userPicture, countryName, countryFlag }) => {
          return `
            <div class="col s6 m4 l3">
              <div class="flex-row bordered">
                <img class="avatar" src="${userPicture}" alt="${userName}">
                <div class="flex-column">
                  <span>${userName}</span>
                  <img class="flag" src="${countryFlag}" alt="${countryName}">
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

start();
