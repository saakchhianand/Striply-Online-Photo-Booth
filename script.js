const video = document.getElementById('video');
const canvas = document.getElementById('stripCanvas');


const context = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const downloadLink = document.getElementById('downloadLink');
const countdownDisplay = document.getElementById('countdown');

const bgSelect = document.getElementById('bgSelect');
const filterSelect = document.getElementById('filterSelect');
const layoutSelect = document.getElementById('layoutSelect');

// Optional shutter sound
const shutterSound = new Audio('shutter.mp3');

// Apply filter live to video preview
filterSelect.addEventListener('change', () => {
  video.style.filter = filterSelect.value;
});

// 🎥 Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Camera access error:", err);
    alert("Please allow camera access.");
  });

// 🖼️ Start capturing strip
startBtn.addEventListener('click', async () => {
  countdownDisplay.textContent = '';
  downloadLink.style.display = 'none';

  const layoutValue = layoutSelect.value; // e.g. "2x3"
  const [cols, rows] = layoutValue.split('x').map(Number);

  const photoSize = 200;
  const margin = 15;
  const borderRadius = 40;
  const footerHeight = 80;

  // Set canvas size based on layout
  canvas.width = cols * photoSize + (cols + 1) * margin;
  canvas.height = rows * photoSize + (rows + 1) * margin + footerHeight;

  // Set canvas background
  const bgValue = bgSelect.value;

  if (bgValue === 'gradient') {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#fbe1f1');
    gradient.addColorStop(1, '#dbe9ff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bgValue === 'pink') {
    context.fillStyle = '#ffe1f0';
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bgValue === 'blue') {
    context.fillStyle = '#d1f1ff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bgValue === 'image') {
    const bgImg = new Image();
    bgImg.src = 'pattern.png'; // Add image to your project folder
    await new Promise(resolve => {
      bgImg.onload = () => {
        context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        resolve();
      };
    });
  } else {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 📸 Capture photos in selected layout
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      await runCountdown(3);

      const x = margin + col * (photoSize + margin);
      const y = margin + row * (photoSize + margin);

      shutterSound.play(); // Optional sound
      drawRoundedImage(context, video, x, y, photoSize, photoSize, borderRadius);
      
    }
  }

  // 🕒 Add timestamp
  const date = new Date();
  const timestamp = `Striply - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  context.fillStyle = "#333";
  context.font = "14px monospace";
  context.textAlign = "center";
  context.fillText(timestamp, canvas.width / 2, canvas.height - 30);

  // Export image
  const imageURL = canvas.toDataURL('image/png');
  downloadLink.href = imageURL;
  downloadLink.style.display = 'inline-block';
});

// ⏳ Countdown logic
function runCountdown(seconds) {
  return new Promise((resolve) => {
    let current = seconds;
    countdownDisplay.textContent = current;

    const interval = setInterval(() => {
      current--;
      if (current > 0) {
        countdownDisplay.textContent = current;
      } else {
        clearInterval(interval);
        countdownDisplay.textContent = '📸';
        setTimeout(() => {
          countdownDisplay.textContent = '';
          resolve();
        }, 600);
      }
    }, 1000);
  });
}
// 🧲 Add sticker to overlay container
stickerBar.addEventListener('click', (e) => {
  if (e.target.classList.contains('sticker-option')) {
    const src = e.target.getAttribute('data-src');
    const img = document.createElement('img');
    img.src = src;
    img.className = 'sticker-overlay';
    img.style.left = '100px';
    img.style.top = '100px';

    makeDraggable(img);
    stickerContainer.appendChild(img);
    placedStickers.push(img);
  }
});
function makeDraggable(el) {
  let offsetX = 0, offsetY = 0;

  el.onmousedown = function (e) {
    e.preventDefault();
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;

    document.onmousemove = function (e) {
      el.style.left = (e.clientX - offsetX) + 'px';
      el.style.top = (e.clientY - offsetY) + 'px';
    };

    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}


// 🟪 Draw rounded image on canvas
function drawRoundedImage(ctx, img, x, y, width, height, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  ctx.filter = filterSelect.value; // Apply selected filter
  ctx.drawImage(img, x, y, width, height);

  ctx.restore();
  ctx.filter = "none"; // Reset filter
}
