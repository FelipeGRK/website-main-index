let allColleges = [];

document.addEventListener("DOMContentLoaded", () => {
  loadColleges();
  setupSearch();
});

function loadColleges() {
  // Atualize a URL para apontar para seu endpoint PHP
  fetch("https://esportsfinderusa.com/api/colleges")
    .then(response => response.json())
    .then(data => {
      allColleges = data;
      const collegesList = document.getElementById("collegesList");
      const gridContainer = document.getElementById("gridView");

      // Limpa os containers, se existirem
      if (collegesList) collegesList.innerHTML = "";
      if (gridContainer) gridContainer.innerHTML = "";

      // Ordena os dados (ajuste o nome da propriedade se necessário)
      data.sort((a, b) => a.colleges.localeCompare(b.colleges));

      data.forEach(college => {
        const collegeCard = createCollegeCard(college);

        // Adiciona ao container do carousel (caso exista)
        if (collegesList) {
          const slide = document.createElement("div");
          slide.classList.add("swiper-slide");
          slide.innerHTML = collegeCard;
          collegesList.appendChild(slide);
        }

        // Adiciona à grid, se existir
        if (gridContainer) {
          const gridItem = document.createElement("div");
          gridItem.classList.add("grid-item");
          gridItem.innerHTML = collegeCard;
          gridContainer.appendChild(gridItem);
        }
      });

      // Inicializa o Swiper para o carousel, se o container existir
      if (collegesList) {
        new Swiper('.swiper-container', {
          slidesPerView: 3,
          spaceBetween: 10,
          loop: true,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          breakpoints: {
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 6 }
          }
        });
      }
    })
    .catch(error => console.error("Erro ao buscar os colleges:", error));
}

function createCollegeCard(college) {
  // Converte o nome da faculdade para minúsculas e cria um nome amigável para o logo
  let sanitizedCollegeName = college.colleges.toLowerCase()
    .replace(/[^a-z0-9_\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  // Tratamento de exceções para alguns nomes
  const exceptions = {
    "minnesota_state_university_mankato": "Minnesota_State_Mankato_University",
    "mount_st_marys_university": "Mount_St_Marys_University"
  };
  if (exceptions[sanitizedCollegeName]) {
    sanitizedCollegeName = exceptions[sanitizedCollegeName];
  }
      const customLogoPaths = {
    "Florida National University": "logos/florida_national_university.jpg",
    "Louisburg College": "logos/louisburg_college.jpg",
    "Minnesota State Mankato University": "logos/minnesota_state_mankato_university.png",
    "Mount St Mary's University": "logos/mount_st_marys_university.png",
    "Muskingum University": "logos/muskingum_university.png",
    "Northwestern College": "logos/northwestern_michigan_college.png",
    "University of Tennessee at Chattanooga": "logos/university_of_tennessee_at_chattanooga.png",
    "Russel Sage College": "logos/russel_sage_college.png",
    "University of Mount Saint Vincent": "logos/university_of_mount_saint_vincent.png",
    "UNC Asheville": "logos/unc_asheville.png",
    "Savannah College of Art and Design": "logos/savannah_college_of_art_and_design.png",
    "Wagner College": "logos/wagner_college.png",
    "Walter Starling": "logos/walter_starling.png",
    "Webber International University": "logos/webber_international_university.png",
    "Wittenberg University": "logos/wittenberg_university.png",
    "Augustana College": "logos/augustana_college.jpg",
    "Bryant & Stratton College": "logos/bryant_stratton_college.png",
    "Coastal Bend College": "logos/coastal_bend_college.jpg",
    "Central Christian College": "logos/central_christian_college.png",
    "Siena Heights University": "logos/siena_heights_university.png",
    "Truett McConnel University": "logos/truett_mcconnel_university.png",
    "Southwestern Illinois College": "logos/southwestern_illinois_college.png",
    "Warner Pacific University": "logos/warner_pacific_university.png",
    "West Texas A&M University": "logos/west_texas_am_university.png"
  };

  // Define o caminho do logo (assumindo que os logos estão na pasta "logos")
  const logoPath = `./logos/${sanitizedCollegeName}.png`;

  // Exibe a badge de bolsas, se aplicável
  const scholarshipBadge = college.has_scholarship
    ? `<div class="scholarship-badge">Scholarships</div>`
    : "";

  return `
    <div class="college-card">
      ${scholarshipBadge}
      <div class="logo-container">
        <img 
          src="${logoPath}" 
          alt="${college.colleges} Logo"
          onerror="this.src='./logos/default.png';"
        >
      </div>
      <div class="divider-line"></div>
      <div class="college-info">
        <h3>${college.colleges}</h3>
        <p>${college.location}</p>
      </div>
      <a href="${college.website}" target="_blank" class="learn-more">Learn More</a>
    </div>
  `;
}

function displayCollegesInGrid(colleges) {
  const gridView = document.getElementById("gridView");
  if (!gridView) return;

  gridView.innerHTML = "";
  colleges.sort((a, b) => a.colleges.localeCompare(b.colleges));
  colleges.forEach(college => {
    const cardHTML = createCollegeCard(college);
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.innerHTML = cardHTML;
    gridView.appendChild(gridItem);
  });
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (searchInput) {
    // Filtra os resultados em tempo real enquanto o usuário digita
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      filterAndDisplay(query);
    });
  }

  if (searchBtn) {
    // Filtra os resultados ao clicar no botão
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.toLowerCase().trim();
      filterAndDisplay(query);
    });
  }
}

function filterAndDisplay(query) {
  if (!query) {
    displayCollegesInGrid(allColleges);
    return;
  }
  const filtered = allColleges.filter(college => {
    return (
      college.colleges.toLowerCase().includes(query) ||
      (college.location && college.location.toLowerCase().includes(query)) ||
      (college.esports_name && college.esports_name.toLowerCase().includes(query))
    );
  });
  displayCollegesInGrid(filtered);
}
