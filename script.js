let currentIndex = 1;
const maxIndex = 56;

// Folder configuration
const firstRowFolders = [5, 1, 2, 3, 4];  // First image is reference (folder5)
const secondRowFolders = [6, 7, 8, 9, 10];    // All images need ratings


// ======== NEW PROGRESS SAVING FUNCTIONS ========
function saveProgress() {
  const ratings = collectCurrentRatings();
  localStorage.setItem('imageScoringIndex', currentIndex);
  localStorage.setItem('imageScoringRatings', JSON.stringify(ratings));
}

function loadProgress() {
  const index = localStorage.getItem('imageScoringIndex');
  const ratings = localStorage.getItem('imageScoringRatings');
  return {
    index: index ? parseInt(index, 10) : 1,
    ratings: ratings ? JSON.parse(ratings) : {}
  };
}



function clearProgress() {
  localStorage.removeItem('imageScoringIndex');
  localStorage.removeItem('imageScoringRatings');
}

function collectCurrentRatings() {
  const ratings = {};
  
  // First row ratings
  firstRowFolders.slice(1).forEach(folderNum => {
    const radios = document.getElementsByName(`firstRow_${folderNum}`);
    radios.forEach(r => { if (r.checked) ratings[`folder${folderNum}`] = r.value; });
  });

  // Second row ratings
  secondRowFolders.forEach(folderNum => {
    const radios = document.getElementsByName(`secondRow_${folderNum}`);
    radios.forEach(r => { if (r.checked) ratings[`folder${folderNum}`] = r.value; });
  });

  return ratings;
}
// ======== END PROGRESS SAVING FUNCTIONS ========

// Rest of your existing functions (showImages, submitRatings, etc.) remain the same
// ...

function showImages(index) {
  const container = document.getElementById('image-container');
  container.innerHTML = '';

  // Update progress
  const percent = Math.floor((index - 1) / maxIndex * 100);
  document.getElementById('progress-bar').style.width = `${percent}%`;
  document.getElementById('counter').textContent = `Set ${index} of ${maxIndex}`;

  // Image block creation helper
  function createImageBlock(folderNum, imgIndex, isReference, ratingName) {
    const block = document.createElement('div');
    block.className = 'image-block';

    const img = document.createElement('img');
    img.src = `images/folder${folderNum}/img${imgIndex}.jpg`;
    img.alt = `Image from folder ${folderNum}`;
    block.appendChild(img);

    if (!isReference) {
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'star-rating';
      for (let s = 4; s >= 1; s--) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = ratingName;
        input.id = `folder${folderNum}_star${s}`;
        input.value = s;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = '★';
        ratingDiv.appendChild(input);
        ratingDiv.appendChild(label);
      }
      block.appendChild(ratingDiv);
    } else {
      block.appendChild(document.createElement('p')).textContent = 'Reference';
    }

    return block;
  }

  // First row (folder5 + folders1-4)
  const firstRow = document.createElement('div');
  firstRow.className = 'image-row';
  firstRowFolders.forEach((folderNum, i) => {
    const isReference = i === 0;  // First image is reference
    const ratingName = `firstRow_${folderNum}`;
    firstRow.appendChild(createImageBlock(folderNum, index, isReference, ratingName));
  });
  container.appendChild(firstRow);

  // Second row (folders6-9)
  const secondRow = document.createElement('div');
  secondRow.className = 'image-row';
  secondRowFolders.forEach((folderNum, i) => {
    const ratingName = `secondRow_${folderNum}`;
    secondRow.appendChild(createImageBlock(folderNum, index, false, ratingName));
  });
  container.appendChild(secondRow);
}

function submitRatings() {
  const ratings = {};
  let valid = true;

  // Collect first row ratings (folders1-4)
  firstRowFolders.slice(1).forEach(folderNum => {
    const radios = document.getElementsByName(`firstRow_${folderNum}`);
    let value = '';
    radios.forEach(r => { if (r.checked) value = r.value; });
    if (!value) valid = false;
    ratings[`folder${folderNum}`] = value;
  });

  // Collect second row ratings (folders6-9)
  secondRowFolders.forEach(folderNum => {
    const radios = document.getElementsByName(`secondRow_${folderNum}`);
    let value = '';
    radios.forEach(r => { if (r.checked) value = r.value; });
    if (!value) valid = false;
    ratings[`folder${folderNum}`] = value;
  });

  if (!valid) {
    alert('Please rate all 8 images.');
    return;
  }

  const nextIndex = currentIndex + 1;
  checkImageExists(`images/folder1/img${nextIndex}.jpg`, exists => {
    fetch('rate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        index: currentIndex,
        ratings,
        isLast: !exists
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Server error');
      return res.text();
    })
    .then(msg => {
      console.log(msg);
      currentIndex++;
      if (exists) showImages(currentIndex);
      else {
        document.getElementById('progress-bar').style.width = '100%';
        document.getElementById('counter').textContent = '✅ All images rated!';
        document.getElementById('image-container').innerHTML = '';
        document.querySelector('button').style.display = 'none';
        document.getElementById('finishBtn').style.display = 'inline-block';
      }
    })
    .catch(err => {
      console.error(err);
      alert('❌ Failed to save ratings. Check console.');
    });
  });
}

// Keep other functions (checkImageExists, finishRating) unchanged




function checkImageExists(url, callback) {
  const img = new Image();
  img.onload = () => callback(true);
  img.onerror = () => callback(false);
  img.src = url;
}
function finishRating() {
  fetch('send_ratings.php')
    .then(res => res.text())
    .then(msg => {
      alert(msg);
    })
    .catch(err => {
      console.error(err);
      alert('❌ Failed to send ratings.csv');
    });
}

window.onload = function() {
  const progress = loadProgress();
  if (progress.index > 1) {
    const resume = confirm(
      "Do you want to continue where you left off (Set " + progress.index +
      ")?\n\nClick OK to continue, Cancel to start from the beginning."
    );
    if (resume) {
      currentIndex = progress.index;
      // Optionally, restore ratings UI from progress.ratings
    } else {
      clearProgress();
      currentIndex = 1;
    }
  } else {
    currentIndex = 1;
  }
  showImages(currentIndex);
};
