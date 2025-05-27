let currentIndex = 1;
const maxIndex = 56;
const firstRowFolders = [5, 1, 2, 3];


document.addEventListener('DOMContentLoaded', async () => {
  const { index, ratings } = loadProgress();
  currentIndex = index;

  if (currentIndex > 1 && !confirm(`Continue from Set ${currentIndex}?`)) {
    clearProgress();
    currentIndex = 1;
  }

  await showImages(currentIndex);
  restoreRatings(ratings);

  // Auto-save ocjena
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      saveProgress();
    });
  });
});

// ====== PROGRESS MANAGEMENT ======
function saveProgress() {
  const ratings = collectRatings();
  localStorage.setItem('imageScoring', JSON.stringify({
    index: currentIndex,
    ratings
  }));
}

function loadProgress() {
  const defaultData = { index: 1, ratings: {} };
  try {
    return JSON.parse(localStorage.getItem('imageScoring')) || defaultData;
  } catch {
    return defaultData;
  }
}

function clearProgress() {
  localStorage.removeItem('imageScoring');
}

// ====== RATING HANDLING ======
function collectRatings() {
  const ratings = {};
  
  document.querySelectorAll('.star-rating').forEach(div => {
    const name = div.querySelector('input')?.name;
    const checked = div.querySelector('input:checked');
    if (name && checked) ratings[name] = checked.value;
  });
  
  return ratings;
}

function restoreRatings(ratings) {
  Object.entries(ratings).forEach(([name, value]) => {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
  });
}

// ====== IMAGE PATH RESOLUTION ======
async function resolveImagePath(folderNum, index, extensions = ['.jpg', '.jpeg', '.png']) {
  for (const ext of extensions) {
    const path = `images/folder${folderNum}/img${index}${ext}`;
    const exists = await checkImageExists(path);
    if (exists) return path;
  }
  throw new Error('Image not found with supported extensions.');
}

function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// ====== IMAGE DISPLAY ======
async function showImages(index) {
  const container = document.getElementById('image-container');
  container.innerHTML = '';

  const row1 = await createRow(firstRowFolders, index, true);
  
  container.appendChild(row1);
  

  updateProgress(index);
}

async function createRow(folders, index, hasReference) {
  const row = document.createElement('div');
  row.className = 'image-row';

  for (let i = 0; i < folders.length; i++) {
    const folderNum = folders[i];
    const block = document.createElement('div');
    block.className = 'image-block';

    const img = new Image();
    try {
      img.src = await resolveImagePath(folderNum, index);
    } catch {
      block.classList.add('error');
      img.alt = 'Image not found';
    }

    block.prepend(img);

    if (!(hasReference && i === 0)) {
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'star-rating';

      for (let s = 4; s >= 1; s--) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `row${hasReference ? '1' : '2'}_${folderNum}`;
        input.value = s;
        input.id = `${input.name}_${s}`;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = '★';

        ratingDiv.append(input, label);
      }

      block.append(ratingDiv);
    } else {
      const ref = document.createElement('p');
      ref.textContent = 'Reference';
      block.append(ref);
    }

    row.appendChild(block);
  }

  return row;
}

// ====== UTILITIES ======
function updateProgress(index) {
  const progress = (index / maxIndex * 100).toFixed(1);
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('counter').textContent = `Set ${index} of ${maxIndex}`;
}

async function submitRatings() {
  const ratings = collectRatings();
  const requiredInputs = document.querySelectorAll('.star-rating input');
  const allRated = [...requiredInputs].every(input => 
    input.parentElement.querySelector('input:checked')
  );

  if (!allRated) return alert('Please rate all images before continuing.');

  try {
    const response = await fetch('rate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: currentIndex, ratings })
    });

    if (!response.ok) throw new Error('Server error');
    
    currentIndex++;
    if (currentIndex > maxIndex) {
      showCompletion();
    } else {
      await showImages(currentIndex);
      saveProgress();
    }
  } catch (error) {
    console.error('Submission failed:', error);
    alert('Error saving ratings. Please try again.');
  }
}

function showCompletion() {
  document.getElementById('progress-bar').style.width = '100%';
  document.getElementById('counter').textContent = 'All images rated!';
  document.querySelector('button').style.display = 'none';
  document.getElementById('finishBtn').style.display = 'inline-block';
}

function finishRating() {
  fetch('send_ratings.php')
    .then(response => response.text())
    .then(alert)
    .catch(error => {
      console.error('Final submission failed:', error);
      alert('Error finalizing ratings.');
    });
}
