const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultDiv = document.getElementById('result');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('closeBtn');

searchBtn.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchRecipes();
});
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

async function searchRecipes() {
  const query = searchInput.value.trim();
  if (!query) return;

  resultDiv.innerHTML = '<p style="text-align:center">Loading...</p>';

  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();

    // Edge case: API returns null for no results
    if (data.meals === null) {
      resultDiv.innerHTML = '<p class="error">No recipes found. Try "chicken" or "pasta"</p>';
      return;
    }

    displayRecipes(data.meals);
  } catch (error) {
    resultDiv.innerHTML = '<p class="error">Failed to fetch. Check internet connection.</p>';
  }
}

function displayRecipes(meals) {
  resultDiv.innerHTML = meals.map(meal => `
    <div class="card" onclick="showDetails('${meal.idMeal}')">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
    </div>
  `).join('');
}

async function showDetails(id) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    const meal = data.meals[0];

    // Get ingredients list
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
      if (meal[`strIngredient${i}`]) {
        ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
      }
    }

    modalBody.innerHTML = `
      <h2>${meal.strMeal}</h2>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h4>Category: ${meal.strCategory}</h4>
      <h4>Ingredients:</h4>
      <ul>${ingredients}</ul>
      <h4>Instructions:</h4>
      <p>${meal.strInstructions}</p>
      ${meal.strYoutube? `<p><a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a></p>` : ''}
    `;
    modal.style.display = 'block';
  } catch (error) {
    alert('Failed to load details');
  }
}