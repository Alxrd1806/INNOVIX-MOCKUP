// ==========================================
// 1. BASES DE DATOS SIMULADAS (MOCK)
// ==========================================
let courses = [
  { id:1, title:"Inteligencia Artificial para universitarios", category:"Tecnología", price:19.99, instructor:"Equipo INNOVIX", rating: 4.9, duration: "2h 30m", icon:"🤖", color:"linear-gradient(135deg,#19192a,#9b72cf)", description:"Aprende a usar IA para estudiar, investigar y organizar ideas de forma eficiente." },
  { id:2, title:"Finanzas para emprender mientras estudias", category:"Finanzas", price:24.99, instructor:"Erick M.", rating: 4.8, duration: "3h 15m", icon:"💸", color:"linear-gradient(135deg,#173b2e,#27805d)", description:"Aprende sobre costos, flujo de caja y decisiones financieras esenciales para tu negocio." },
  { id:3, title:"Copywriting y Ventas Digitales", category:"Negocios", price:15.99, instructor:"Cris", rating: 5.0, duration: "4h", icon:"📱", color:"linear-gradient(135deg,#44232a,#a04d63)", description:"Mejora tu narrativa y recursos visuales para crear contenido altamente competitivo." },
  { id:4, title:"Productividad sin complicarte", category:"Tecnología", price:12.99, instructor:"Laura M.", rating: 4.7, duration: "1h 45m", icon:"⚡", color:"linear-gradient(135deg,#263b59,#497cb4)", description:"Crea sistemas de organización sostenibles y evita el burnout universitario." }
];

const categories = ["Todos","Tecnología","Finanzas","Negocios"];
let activeCategory = "Todos";
let catalogActiveCategory = "Todos";
let cart = [];
let purchasedCourses = []; 
let selectedCourse = null;
let observer;

// Variables de Sesión
let isLoggedIn = false;
let userRole = null; 
let loggedInUserName = "Usuario";


// ==========================================
// 2. LÓGICA DE SESIÓN Y UI DE NAVEGACIÓN
// ==========================================
function updateAuthUI() {
  const guestMenu = document.getElementById('guestMenu');
  const userMenu = document.getElementById('userMenu');
  const cartButton = document.getElementById('cartButton');
  
  if (!guestMenu || !userMenu || !cartButton) return;

  if (isLoggedIn) {
    guestMenu.classList.add('hidden');
    userMenu.classList.remove('hidden');
    
    document.getElementById('userNameDisplay').textContent = loggedInUserName;
    document.getElementById('userRoleDisplay').textContent = userRole === 'instructor' ? 'Instructor' : 'Estudiante';
    document.getElementById('dashboardLink').innerHTML = userRole === 'instructor' ? '📊 Panel Instructor' : '🎓 Panel Estudiante';
    
    const dashName = document.getElementById('dashStudentName');
    if(dashName) dashName.textContent = loggedInUserName;

    if (userRole === 'instructor') {
      cartButton.classList.add('hidden');
    } else {
      cartButton.classList.remove('hidden');
    }
  } else {
    guestMenu.classList.remove('hidden');
    userMenu.classList.add('hidden');
    cartButton.classList.remove('hidden'); 
  }
}

function toggleProfileMenu() {
  document.getElementById('profileDropdown').classList.toggle('show');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('profileDropdown');
  const btn = document.getElementById('profileBtn');
  if (menu && menu.classList.contains('show') && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('show');
  }
  
  const navSearchResults = document.getElementById('searchResults');
  const heroSearchResults = document.getElementById('heroSearchResults');
  
  if (navSearchResults && navSearchResults.classList.contains('show') && !e.target.closest('.search-wrapper')) {
    navSearchResults.classList.remove('show');
  }
  if (heroSearchResults && heroSearchResults.classList.contains('show') && !e.target.closest('.hero-search-wrapper')) {
    heroSearchResults.classList.remove('show');
  }

  // NUEVO: Cerrar menú hamburguesa al hacer clic fuera
  const centerLinks = document.getElementById('centerLinks');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  if (centerLinks && centerLinks.classList.contains('active') && !centerLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    centerLinks.classList.remove('active');
  }
});

function logout() {
  isLoggedIn = false;
  userRole = null;
  loggedInUserName = "Usuario";
  cart = []; 
  purchasedCourses = []; 
  
  renderCart();
  updateAuthUI();
  goHome(); 
  showToast("Has cerrado sesión. ¡Vuelve pronto! 👋");
}

function updateProfile(e, inputId) {
  e.preventDefault();
  const newName = document.getElementById(inputId).value;
  loggedInUserName = newName || "Usuario";
  updateAuthUI();
  showToast("Datos actualizados correctamente ✅");
}


// ==========================================
// 3. REGISTRO Y LOGIN (MODAL UNIFICADO)
// ==========================================
let usersDB = []; 

function switchAuthTab(tab) {
  const loginView = document.getElementById('authLoginView');
  const registerView = document.getElementById('authRegisterView');
  const tabs = document.querySelectorAll('.auth-tab');
  
  tabs.forEach(t => t.classList.remove('active'));
  
  if(tab === 'login') {
    loginView.classList.remove('hidden');
    registerView.classList.add('hidden');
    tabs[0].classList.add('active');
  } else {
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    tabs[1].classList.add('active');
    if(!userRole) userRole = 'estudiante'; 
  }
}

function openLogin() { 
  switchAuthTab('login'); 
  openModal('authModal'); 
}

function openRegister() { 
  switchAuthTab('register'); 
  openModal('authModal'); 
}

function setAuthRole(role, btnElement) {
   userRole = role;
   const btns = document.querySelectorAll('.auth-role-btn');
   btns.forEach(b => b.classList.remove('active'));
   if(btnElement) btnElement.classList.add('active');
}

function fakeLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  
  const user = usersDB.find(u => u.email === email);
  if (user) {
    userRole = user.role;
    loggedInUserName = user.name;
  } else {
    userRole = email.includes('instructor') ? 'instructor' : 'estudiante';
    loggedInUserName = "Usuario Demo";
  }

  isLoggedIn = true;
  closeModal('authModal');
  e.target.reset();
  updateAuthUI();
  
  showToast("¡Bienvenido de vuelta, " + loggedInUserName + "! 🚀");
  setTimeout(() => { goToDashboard(); }, 500);
}

function fakeRegister(e) {
  e.preventDefault();
  const pass1 = document.getElementById('regPass1').value;
  const pass2 = document.getElementById('regPass2').value;
  const email = document.getElementById('regEmail').value;
  const name = document.getElementById('regName').value || "Nuevo Usuario";
  const errorText = document.getElementById('passError');

  if (pass1 !== pass2) {
    errorText.style.display = 'block';
    return;
  }
  errorText.style.display = 'none';
  
  isLoggedIn = true;
  loggedInUserName = name;
  const finalRole = userRole || 'estudiante'; 
  userRole = finalRole; 

  usersDB.push({ email: email, name: name, role: finalRole });

  closeModal('authModal');
  e.target.reset(); 
  updateAuthUI(); 
  showToast("¡Cuenta creada exitosamente! 🎉");
  setTimeout(() => { goToDashboard(); }, 1000); 
}


// ==========================================
// 4. SISTEMA DE RUTAS (SPA) Y PANELES
// ==========================================
function hideAllViews() {
  document.getElementById('homeView').classList.add('hidden');
  const instructorLanding = document.getElementById('instructorLandingView');
  if(instructorLanding) instructorLanding.classList.add('hidden');
  document.getElementById('catalogView').classList.add('hidden');
  document.getElementById('studentView').classList.add('hidden');
  document.getElementById('instructorView').classList.add('hidden');
  document.getElementById('checkoutView').classList.add('hidden');
  document.getElementById('classroomView').classList.add('hidden');

  const aboutView = document.getElementById('aboutView');
  if(aboutView) aboutView.classList.add('hidden');

  const contactView = document.getElementById('contactView');
  if(contactView) contactView.classList.add('hidden');
}

function goHome() {
  hideAllViews(); 
  document.getElementById('homeView').classList.remove('hidden'); 
  window.scrollTo(0, 0);
}

function goToInstructorLanding() {
  hideAllViews();
  const landing = document.getElementById('instructorLandingView');
  if(landing) landing.classList.remove('hidden');
  window.scrollTo(0, 0);
}

function goToAbout() {
  hideAllViews();
  const about = document.getElementById('aboutView');
  if(about) about.classList.remove('hidden');
  window.scrollTo(0, 0);
}

function goToCatalog() {
  hideAllViews();
  document.getElementById('catalogView').classList.remove('hidden');
  window.scrollTo(0, 0);
  renderCatalog(); 
}

function goToDashboard() {
  hideAllViews();
  if (userRole === 'instructor') {
    document.getElementById('instructorView').classList.remove('hidden');
    showDashboard(); 
    renderInstructorCourses();
  } else {
    document.getElementById('studentView').classList.remove('hidden');
    showStudentDash(); 
    renderStudentCourses();
  }
  window.scrollTo(0, 0);
}

function goToProfile() {
  goToDashboard();
  if (userRole === 'instructor') {
    showInstructorProfile();
  } else {
    showStudentProfile();
  }
}

function goToCheckout() {
  if(!cart.length) {
    showToast("Tu carrito está vacío 🛒");
    return;
  }
  hideAllViews();
  document.getElementById('checkoutView').classList.remove('hidden');
  window.scrollTo(0, 0);
  toggleCart(); 
  renderCheckout(); 
}

function goToContact() {
  hideAllViews();
  const contact = document.getElementById('contactView');
  if(contact) contact.classList.remove('hidden');
  window.scrollTo(0, 0);
  
  // Cerrar el menú si está en móvil
  const centerLinks = document.getElementById('centerLinks');
  if(centerLinks) centerLinks.classList.remove('active');
}

function submitContact(e) {
  e.preventDefault();
  showToast("¡Mensaje enviado! Te contactaremos a la brevedad. 🚀");
  e.target.reset(); // Limpia los campos del formulario
}

function openClassroom(id) {
  const course = purchasedCourses.find(c => c.id === id);
  if(!course) return; 
  
  document.getElementById("classroomCourseTitle").textContent = course.title;
  hideAllViews();
  document.getElementById('classroomView').classList.remove('hidden');
  window.scrollTo(0, 0);
}


// ==========================================
// 5. BÚSQUEDA EN VIVO Y RENDERIZADO
// ==========================================
function handleLiveSearch(e, targetDropdownId) {
  const q = e.target.value.trim().toLowerCase();
  const resultsBox = document.getElementById(targetDropdownId);
  if (!resultsBox) return;

  if (!q) {
    resultsBox.classList.remove("show");
    return;
  }

  const list = courses.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
  
  if (list.length > 0) {
    resultsBox.innerHTML = list.map(c => `
      <div style="padding: 12px 15px; border-bottom: 1px solid var(--border); cursor: pointer; display: flex; align-items: center; gap: 12px; transition: background 0.2s;" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background='transparent'" onclick="openCourse(${c.id}); document.getElementById('${targetDropdownId}').classList.remove('show'); document.getElementById('${e.target.id}').value = '';">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: ${c.color}; display: grid; place-items: center; font-size: 16px; color: white;">${c.icon}</div>
        <div>
          <b style="font-size: 14px; color: var(--text); display: block;">${c.title}</b>
          <small class="muted">${c.category} · $${c.price.toFixed(2)}</small>
        </div>
      </div>
    `).join("");
  } else {
    resultsBox.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--muted); font-size: 14px;">No se encontraron resultados.</div>`;
  }
  resultsBox.classList.add("show");
}


function renderCategories(){
  const box = document.getElementById("categories");
  if(!box) return;
  box.innerHTML = categories.map(cat => `
    <button class="chip ${cat === activeCategory ? "active" : ""}" onclick="activeCategory='${cat}'; renderCategories(); renderCourses();">${cat}</button>
  `).join("");
}

function renderCourses(){
  const list = courses.filter(c => activeCategory === "Todos" || c.category === activeCategory);
  const grid = document.getElementById("courseGrid");
  if(!grid) return;
  
  grid.innerHTML = list.map((c, index) => `
    <article class="course-card reveal" style="transition-delay: ${index * 0.1}s" onclick="openCourse(${c.id})">
      <div class="course-cover" style="background:${c.color}">${c.icon}</div>
      <div class="course-body">
        <span class="course-badge">${c.category}</span>
        <h3>${c.title}</h3>
        <p class="muted" style="font-size:14px; margin:0 0 10px">${c.instructor}</p>
        <div class="course-footer">
          <span class="price">$${c.price.toFixed(2)}</span>
          <button class="btn btn-outline" onclick="event.stopPropagation();addToCart(${c.id})">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");

  if(observer) document.querySelectorAll('#courseGrid .reveal').forEach(el => observer.observe(el));
}

function filterCatalog(category) {
  catalogActiveCategory = category;
  renderCatalog();
}

function renderCatalog() {
  const searchInput = document.getElementById("catalogSearch");
  const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const list = courses.filter(c => (catalogActiveCategory === "Todos" || c.category === catalogActiveCategory) && (!q || `${c.title} ${c.instructor}`.toLowerCase().includes(q)));

  const grid = document.getElementById("catalogGrid");
  const label = document.getElementById("catalogResultsLabel");
  if(label) label.textContent = `${list.length} cursos encontrados`;
  if(!grid) return;
  
  if(!list.length){
    grid.innerHTML = `<div style="grid-column:1/-1; padding:50px; text-align:center; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border);">No encontramos cursos con esos filtros.</div>`;
    return;
  }

  grid.innerHTML = list.map((c, index) => `
    <article class="course-card" style="animation: fadeInFast 0.3s ease forwards; animation-delay: ${index * 0.05}s; opacity: 0;" onclick="openCourse(${c.id})">
      <div class="course-cover" style="background:${c.color}">${c.icon}</div>
      <div class="course-body">
        <span class="course-badge">${c.category}</span>
        <h3>${c.title}</h3>
        <p class="muted" style="font-size:14px; margin:0 0 10px">${c.instructor}</p>
        <div class="course-footer">
          <span class="price">$${c.price.toFixed(2)}</span>
          <button class="btn btn-outline" onclick="event.stopPropagation();addToCart(${c.id})">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");
}


// ==========================================
// 6. CARRITO Y COMPRAS (CHECKOUT)
// ==========================================
function openModal(id) { document.getElementById(id).classList.add("show"); }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

document.querySelectorAll(".modal-backdrop").forEach(b => {
  b.addEventListener("click", e => { if(e.target === b) b.classList.remove("show"); });
});

function openCourse(id){
  selectedCourse = courses.find(c => c.id === id);
  document.getElementById("modalCourseTitle").textContent = selectedCourse.title;
  document.getElementById("modalCourseCategory").textContent = selectedCourse.category;
  document.getElementById("modalCourseDescription").textContent = selectedCourse.description;
  document.getElementById("modalCoursePrice").textContent = `$${selectedCourse.price.toFixed(2)}`;
  document.getElementById("modalCourseCover").style.background = selectedCourse.color;
  document.getElementById("modalCourseCover").innerHTML = selectedCourse.icon;
  
  const instructorEl = document.getElementById("modalCourseInstructor");
  if (instructorEl) instructorEl.textContent = selectedCourse.instructor;
  
  document.getElementById("addCartBtn").onclick = () => { addToCart(selectedCourse.id); closeModal("courseModal"); };
  openModal("courseModal");
}

function toggleCart() { document.getElementById("cartDrawer").classList.toggle("show"); }

function addToCart(id){
  if (!isLoggedIn) {
    showToast("Debes iniciar sesión para comprar 🔒");
    openRegister();
    return;
  }
  if (userRole === 'instructor') {
    showToast("Los instructores no pueden comprar cursos.");
    return;
  }
  
  if(purchasedCourses.some(item => item.id === id)){ 
    showToast("Ya compraste este curso. Búscalo en tu Panel."); 
    return; 
  }

  const course = courses.find(c => c.id === id);
  if(cart.some(item => item.id === id)){ 
    showToast("Ya está en tu carrito."); 
    document.getElementById("cartDrawer").classList.add("show");
    return; 
  }
  
  cart.push(course);
  renderCart();
  document.getElementById("cartDrawer").classList.add("show");
  showToast("Añadido al carrito 🛒");
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function renderCart(){
  const box = document.getElementById("cartItems");
  const total = cart.reduce((s, i) => s + i.price, 0);
  
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");
  
  if(cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
  if(cartCountEl) cartCountEl.textContent = cart.length;
  if(!box) return;
  
  if(!cart.length){
    box.innerHTML = `<p class="muted">El carrito está vacío.</p>`;
    return;
  }
  
  box.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-mini" style="background:${i.color}">${i.icon}</div>
      <div><b style="color: var(--text);">${i.title}</b><div class="muted">$${i.price.toFixed(2)}</div></div>
      <button class="close-btn" style="width:30px;height:30px;font-size:14px" onclick="removeFromCart(${i.id})">✕</button>
    </div>
  `).join("");
}

function renderCheckout() {
  const box = document.getElementById("checkoutItems");
  const totalEl = document.getElementById("checkoutTotal");
  const btnFinal = document.getElementById("btnPagarFinal");
  
  const total = cart.reduce((s, i) => s + i.price, 0);
  
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (btnFinal) btnFinal.textContent = `Pagar $${total.toFixed(2)}`;
  
  if (!box) return;
  box.innerHTML = cart.map(i => `
    <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center;">
      <div style="width: 45px; height: 45px; border-radius: 8px; background: ${i.color}; display: grid; place-items: center; font-size: 18px; color: white;">${i.icon}</div>
      <div style="flex: 1;">
        <b style="font-size: 14px; display: block;">${i.title}</b>
      </div>
      <b style="font-size: 15px;">$${i.price.toFixed(2)}</b>
    </div>
  `).join("");
}

function processPayment(e) {
  e.preventDefault();
  const btn = document.getElementById("btnPagarFinal");
  const originalText = btn.textContent;
  
  btn.textContent = "Procesando pago...";
  btn.disabled = true;
  btn.style.opacity = "0.7";
  
  setTimeout(() => {
    purchasedCourses = [...purchasedCourses, ...cart];
    cart = []; 
    renderCart(); 
    showToast("¡Pago exitoso! Bienvenido a tu aula 🎉");
    
    btn.textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = "1";
    
    goToDashboard();
  }, 1500);
}


// ==========================================
// 7. PANELES INTERNOS DE LOS DASHBOARDS
// ==========================================

function showStudentDash() {
  document.getElementById("studentDashContent").classList.remove("hidden");
  document.getElementById("studentProfileContent").classList.add("hidden");
}

function showStudentProfile() {
  document.getElementById("studentDashContent").classList.add("hidden");
  document.getElementById("studentProfileContent").classList.remove("hidden");
  document.getElementById("studentNameInput").value = loggedInUserName;
}

function renderStudentCourses() {
  const grid = document.getElementById("purchasedCoursesGrid");
  if (!grid) return;

  if (!purchasedCourses.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; padding:40px; text-align:center; background:var(--surface-2); border-radius:var(--radius); border:2px dashed var(--border);">
        <div style="font-size: 40px; margin-bottom:15px;">🎒</div>
        <h4 style="margin:0 0 10px; color: var(--text);">Aún no tienes cursos</h4>
        <p class="muted" style="margin-bottom:20px;">Explora el catálogo y empieza a aprender hoy mismo.</p>
        <button class="btn btn-primary" onclick="goToCatalog()">Ver Catálogo</button>
      </div>`;
    return;
  }

  grid.innerHTML = purchasedCourses.map(c => `
    <article class="course-card" style="cursor: default;">
      <div class="course-cover" style="background:${c.color}">${c.icon}</div>
      <div class="course-body">
        <span class="course-badge">${c.category}</span>
        <h3 style="font-size: 16px;">${c.title}</h3>
        <p class="muted" style="font-size:13px; margin:0 0 15px">${c.instructor}</p>
        <div class="course-footer" style="padding-top:10px; justify-content:center;">
          <button class="btn btn-primary" style="width:100%; border-radius: 12px;" onclick="openClassroom(${c.id})">▶ Ver Clases</button>
        </div>
      </div>
    </article>
  `).join("");
}

function showDashboard(){ 
  document.getElementById("createCoursePanel").classList.add("hidden"); 
  document.getElementById("instructorProfilePanel").classList.add("hidden"); 
  document.getElementById("dashboardSummary").classList.remove("hidden"); 
}

function showCreateCourse(){ 
  document.getElementById("dashboardSummary").classList.add("hidden"); 
  document.getElementById("instructorProfilePanel").classList.add("hidden"); 
  document.getElementById("createCoursePanel").classList.remove("hidden"); 
}

function showInstructorProfile(){ 
  document.getElementById("dashboardSummary").classList.add("hidden"); 
  document.getElementById("createCoursePanel").classList.add("hidden"); 
  document.getElementById("instructorProfilePanel").classList.remove("hidden"); 
  document.getElementById("instructorNameInput").value = loggedInUserName;
}

function renderInstructorCourses(){
  const rows = document.getElementById("instructorCourseRows");
  if(rows) {
    rows.innerHTML = courses.slice(0,3).map((c, i) => `
      <tr>
        <td style="padding:15px; border-bottom:1px solid var(--border);"><b>${c.title}</b></td>
        <td style="padding:15px; border-bottom:1px solid var(--border);">$${c.price.toFixed(2)}</td>
      </tr>
    `).join("");
  }
}

function createCourse(e){
  e.preventDefault();
  const cat = document.getElementById("newCategory").value;
  courses.unshift({
    id: Date.now(),
    title: document.getElementById("newTitle").value,
    category: cat,
    price: Number(document.getElementById("newPrice").value),
    instructor: loggedInUserName,
    rating: 0.0,
    duration: "0h",
    icon: "🎓",
    color: "linear-gradient(135deg,#201b36,#9b72cf)",
    description: document.getElementById("newDescription").value
  });
  e.target.reset();
  
  renderCategories(); 
  renderCourses(); 
  renderInstructorCourses();
  
  showDashboard(); 
  showToast("Curso publicado con éxito 🎉");
}


// ==========================================
// UTILIDADES: NOTIFICACIONES (TOASTS)
// ==========================================
function showToast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg; 
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}


// ==========================================
// 8. INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburgerBtn.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
    });
  }

  window.closeNav = function() {
    if(navMenu) navMenu.classList.remove('active');
    if(hamburgerBtn) hamburgerBtn.innerHTML = '☰';
  };

  const navSearchInput = document.getElementById("searchInput");
  if (navSearchInput) {
    navSearchInput.addEventListener("input", (e) => handleLiveSearch(e, 'searchResults'));
    navSearchInput.addEventListener("keyup", (e) => {
       if (e.target.value === "") document.getElementById("searchResults").classList.remove("show");
    });
  }

  observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  updateAuthUI();
  renderCategories();
  renderCourses();
  renderCart();
});

// 4. Lógica para el cambio dinámico del texto y la navegación del header
    function toggleRoleView() {
      const link = document.getElementById('dynamicNavRole');
      const instructorView = document.getElementById('instructorLandingView');
      
      // Si la vista de instructor está visible, vamos a estudiantes
      if (instructorView && !instructorView.classList.contains('hidden')) {
        goHome();
      } else {
        // De lo contrario, vamos a la landing de instructores
        goToInstructorLanding();
      }
      
      // Cerrar el menú si está en móvil
      const centerLinks = document.getElementById('centerLinks');
      if(centerLinks) centerLinks.classList.remove('active');
    }

    // Aseguramos que el menú de hamburguesa controle el nuevo contenedor
    document.addEventListener("DOMContentLoaded", () => {
      const hamburgerBtn = document.getElementById('hamburgerBtn');
      const centerLinks = document.getElementById('centerLinks');

      if (hamburgerBtn && centerLinks) {
        // Sobrescribe la función anterior del hamburguesa
        hamburgerBtn.onclick = function(e) {
          e.preventDefault();
          centerLinks.classList.toggle('active');
        };
      }
    });

    // Sincronizar el texto del botón al cambiar de página por otras vías
    const originalGoHome = window.goHome;
    window.goHome = function() {
      if(originalGoHome) originalGoHome();
      const link = document.getElementById('dynamicNavRole');
      if(link) link.textContent = 'Para Instructores';
    };

    const originalGoToInstructor = window.goToInstructorLanding;
    window.goToInstructorLanding = function() {
      if(originalGoToInstructor) originalGoToInstructor();
      const link = document.getElementById('dynamicNavRole');
      if(link) link.textContent = 'Para Estudiantes';
    };

// ==========================================
// NUEVA LÓGICA: DASHBOARD INSTRUCTOR
// ==========================================

// 1. Navegación entre pestañas laterales
function switchInstTab(targetId, btnElement) {
  // Ocultar todos los paneles
  document.querySelectorAll('.inst-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  // Quitar la clase active de todos los botones
  document.querySelectorAll('.inst-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar el panel seleccionado y activar el botón
  document.getElementById(targetId).classList.remove('hidden');
  if(btnElement) btnElement.classList.add('active');

  // Si abrimos "Mis Cursos", forzar el renderizado de la lista
  if(targetId === 'panel-mis-cursos') {
    renderInstructorCoursesView();
  }
}

// 2. Renderizar los cursos publicados dentro del panel "Mis Cursos"
function renderInstructorCoursesView() {
  const container = document.getElementById('instMyCoursesList');
  if (!container) return;

  // Filtrar los cursos que pertenecen al instructor logueado
  const myCourses = courses.filter(c => c.instructor === loggedInUserName);

  if (myCourses.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; border: 2px dashed var(--border); border-radius: 20px;">No has publicado ningún curso aún.</div>`;
    return;
  }

  container.innerHTML = myCourses.map(c => `
    <article class="course-card" style="cursor: default;">
      <div class="course-cover" style="background:${c.color}; aspect-ratio: 16/9;">${c.icon}</div>
      <div class="course-body">
        <span class="course-badge">${c.category}</span>
        <h3 style="font-size: 16px; margin-bottom: 5px;">${c.title}</h3>
        <p class="muted" style="font-size: 13px; margin-bottom: 15px;">Precio: $${c.price.toFixed(2)}</p>
        <div style="background: var(--surface-2); padding: 10px; border-radius: 8px; font-size: 12px;">
          <b>Último comentario:</b> <br>
          <span class="muted">"Excelente contenido, muy práctico." - Estudiante Anónimo</span>
        </div>
      </div>
    </article>
  `).join("");
}

// 3. Simulación de subida de curso (Revisión de 10 segundos)
function submitNewCourse(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btnPublishCourse');
  const form = document.getElementById('newCourseForm');
  
  // Capturar datos
  const title = document.getElementById('ncTitle').value;
  const category = document.getElementById('ncCategory').value;
  const price = Number(document.getElementById('ncPrice').value);
  const desc = document.getElementById('ncDesc').value;

  // Estado: En revisión
  btn.innerHTML = '⏳ En revisión (Subiendo contenido...)';
  btn.style.background = 'var(--muted)';
  btn.disabled = true;
  
  showToast("Curso enviado a revisión. Por favor, no cierres esta pantalla.");

  // Simular los 10 segundos
  setTimeout(() => {
    // Añadir el curso a la base de datos simulada
    courses.unshift({
      id: Date.now(),
      title: title,
      category: category,
      price: price,
      instructor: loggedInUserName,
      rating: 0.0,
      duration: "0h",
      icon: "🎓",
      color: "linear-gradient(135deg,#201b36,#9b72cf)",
      description: desc
    });
    
    // Estado: Finalizado
    showToast("¡Curso subido con éxito! 🎉 Ya está disponible en el catálogo.");
    form.reset();
    btn.innerHTML = '🚀 Publicar Curso';
    btn.style.background = 'var(--brand)';
    btn.disabled = false;
    
    // Actualizar todas las vistas generales
    renderCategories();
    renderCourses();
    
    // Cambiar automáticamente a la pestaña de "Mis Cursos"
    switchInstTab('panel-mis-cursos', document.querySelectorAll('.inst-tab-btn')[3]);

  }, 10000); // 10000 ms = 10 segundos exactos
}

// 4. Modificar el nombre en el sidebar cuando inicia sesión
// Esto complementa tu función updateAuthUI() existente
const originalUpdateAuthUI = window.updateAuthUI;
window.updateAuthUI = function() {
  if (originalUpdateAuthUI) originalUpdateAuthUI();
  
  const instName = document.getElementById('instSidebarName');
  const instWelcome = document.getElementById('instWelcomeTitle');
  
  if (instName) instName.textContent = loggedInUserName;
  if (instWelcome) instWelcome.textContent = '¡Bienvenido, ' + loggedInUserName + '!';
};

// ==========================================
// NUEVA LÓGICA: DASHBOARD ESTUDIANTE
// ==========================================

// 1. Navegación entre pestañas laterales del estudiante
function switchStuTab(targetId, btnElement) {
  // Ocultar todos los paneles del estudiante
  document.querySelectorAll('.stu-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  // Quitar la clase active de todos los botones dentro del studentView
  document.querySelectorAll('#studentView .inst-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar el panel seleccionado y activar el botón
  document.getElementById(targetId).classList.remove('hidden');
  if(btnElement) btnElement.classList.add('active');
}

// 2. Modificamos la actualización de UI para inyectar datos al estudiante
const backupUpdateAuthUI = window.updateAuthUI;
window.updateAuthUI = function() {
  if (backupUpdateAuthUI) backupUpdateAuthUI();
  
  // Para Instructor (Ya lo tenías)
  const instName = document.getElementById('instSidebarName');
  const instWelcome = document.getElementById('instWelcomeTitle');
  if (instName) instName.textContent = loggedInUserName;
  if (instWelcome) instWelcome.textContent = '¡Bienvenido, ' + loggedInUserName + '!';
  
  // Para Estudiante (NUEVO)
  const stuName = document.getElementById('stuSidebarName');
  const stuWelcome = document.getElementById('stuWelcomeTitle');
  const stuInput = document.getElementById('studentNameInput');
  const stuCount = document.getElementById('stuCourseCount');
  
  if (stuName) stuName.textContent = loggedInUserName;
  if (stuWelcome) stuWelcome.textContent = '¡Hola, ' + loggedInUserName + '! 👋';
  if (stuInput) stuInput.value = loggedInUserName;
  
  // Actualizar el contador de cursos en el panel del estudiante
  if (stuCount) stuCount.textContent = purchasedCourses.length;
};

// ==========================================
// FIX DEFINITIVO: NAVEGACIÓN A LOS NUEVOS DASHBOARDS
// ==========================================
window.goToDashboard = function() {
  hideAllViews();
  window.scrollTo(0, 0);
  
  if (userRole === 'instructor') {
    document.getElementById('instructorView').classList.remove('hidden');
    // Activa la pestaña de Finanzas por defecto
    if (typeof switchInstTab === "function") {
      switchInstTab('panel-finanzas', document.querySelectorAll('#instructorView .inst-tab-btn')[0]);
    }
  } else {
    document.getElementById('studentView').classList.remove('hidden');
    // Activa la pestaña de Mis Cursos por defecto
    if (typeof switchStuTab === "function") {
      switchStuTab('stu-mis-cursos', document.querySelectorAll('#studentView .inst-tab-btn')[0]);
    }
    // Fuerza el renderizado de los cursos comprados
    if (typeof renderStudentCourses === "function") {
      renderStudentCourses();
    }
  }
};

// ==========================================
// FIX DEFINITIVO: RENDERIZADO DEL NUEVO CHECKOUT
// ==========================================
window.renderCheckout = function() {
  const box = document.getElementById("checkoutItemsList");
  const subtotalEl = document.getElementById("chkSubtotal");
  const totalEl = document.getElementById("chkTotalFinal");
  const nameInput = document.getElementById("chkName");
  
  // Autocompletar el nombre si el usuario está logueado
  if(nameInput && loggedInUserName !== "Usuario") {
    nameInput.value = loggedInUserName;
  }

  const total = cart.reduce((s, i) => s + i.price, 0);
  
  if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  
  if (!box) return;
  
  if (!cart.length) {
    box.innerHTML = `<p class="muted" style="text-align: center; margin: 20px 0;">Tu carrito está vacío.</p>`;
    document.getElementById("btnPagarFinal").disabled = true;
    document.getElementById("btnPagarFinal").style.opacity = "0.5";
    return;
  }
  
  document.getElementById("btnPagarFinal").disabled = false;
  document.getElementById("btnPagarFinal").style.opacity = "1";

  // Renderizar la nueva estructura visual de los items
  box.innerHTML = cart.map(i => `
    <div class="chk-item">
      <div class="chk-item-icon" style="background: ${i.color};">${i.icon}</div>
      <div style="flex: 1;">
        <div class="chk-item-title">${i.title}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
           <button class="chk-btn-remove" onclick="removeFromCart(${i.id}); renderCheckout(); renderCart();">🗑️ Eliminar</button>
           <div class="chk-item-price">$${i.price.toFixed(2)}</div>
        </div>
      </div>
    </div>
  `).join("");
};

// Activar los iconos vectoriales planos 2D en toda la plataforma
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});