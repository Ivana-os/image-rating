let currentIndex = 1;
const maxIndex = 56;

function showImages(index) {
  const container = document.getElementById('image-container');
  container.innerHTML = '';

  // Ažuriraj progress bar i brojčani prikaz
  const percent = Math.floor((index - 1) / maxIndex * 100);
  document.getElementById('progress-bar').style.width = `${percent}%`;
  document.getElementById('counter').textContent = `Set ${index} of ${maxIndex}`;

  // Petlja za 5 slika (1–4 za ocjenjivanje, 5 za usporedbu)
  for (let i = 1; i <= 5; i++) {
    const block = document.createElement('div');
    block.className = 'image-block';

    const img = document.createElement('img');
    img.src = `images/folder${i}/img${index}.jpg`;
    img.alt = `Image ${i}`;
    block.appendChild(img);

    if (i <= 4) {
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'star-rating';

      for (let s = 4; s >= 1; s--) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `rating${i}`;
        input.id = `folder${i}_star${s}`;
        input.value = s;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = '★';

        ratingDiv.appendChild(input);
        ratingDiv.appendChild(label);
      }

      block.appendChild(ratingDiv);
    } else {
      const label = document.createElement('p');
      label.textContent = 'Reference';
      block.appendChild(label);
    }

    container.appendChild(block);
  }
}

function submitRatings() {
  const ratings = {};
  let valid = true;

  // Prikupi ocjene za slike 1–4
  for (let i = 1; i <= 4; i++) {
    const radios = document.getElementsByName(`rating${i}`);
    let value = '';
    radios.forEach(r => {
      if (r.checked) value = r.value;
    });

    if (!value) valid = false;
    ratings[`folder${i}`] = value;
  }

  // Provjera je li sve ocijenjeno
  if (!valid) {
    alert('Please rate all 4 images using stars.');
    return;
  }

  // Pošalji na backend (rate.php)
  fetch('rate.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      index: currentIndex,
      ratings
    })
  })
    .then(res => res.text())
    .then(msg => {
      console.log(msg);
      currentIndex++;

      if (currentIndex <= maxIndex) {
        showImages(currentIndex);
      } else {
        // Kraj: puni progress bar, sakrij gumb, prikaži poruku
        document.getElementById('progress-bar').style.width = '100%';
        document.getElementById('counter').textContent = ' All images rated!';
        document.getElementById('image-container').innerHTML = '';
        document.querySelector('button').style.display = 'none';
      }
    })
    .catch(err => {
      console.error('Error submitting rating:', err);
      alert('Error submitting rating. Check your connection or server.');
    });
}

// Prikaz početnog seta
showImages(currentIndex);
