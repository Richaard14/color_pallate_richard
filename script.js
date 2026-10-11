const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");
const paletteEl = document.getElementById("palette");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

const colorThief = new ColorThief();
let currentUrl = null;

// Jalankan saat pengguna memilih gambar.
fileInput.addEventListener("change", () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    statusEl.textContent = "File tidak valid. Silakan pilih file gambar.";
    return;
  }

  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = URL.createObjectURL(file);

  paletteEl.innerHTML = "";
  statusEl.textContent = "Sedang membaca warna gambar...";

  preview.onload = () => {
    preview.style.display = "block";
    placeholder.style.display = "none";

    try {
      // Ambil sepuluh warna dominan dari gambar.
      const colors = colorThief.getPalette(preview, 10);
      renderPalette(colors);
      statusEl.textContent = "Berhasil menemukan " + colors.length + " warna.";
    } catch (error) {
      statusEl.textContent = "Gambar tidak dapat diproses. Coba gambar lain.";
      console.error(error);
    }
  };

  preview.onerror = () => {
    statusEl.textContent = "Gagal memuat gambar. Silakan coba file lain.";
  };

  preview.src = currentUrl;
});

// Tampilkan swatch warna dan kode HEX.
function renderPalette(colors) {
  paletteEl.innerHTML = "";

  colors.forEach((rgb) => {
    const hex = "#" + rgb
      .map(value => value.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    const card = document.createElement("div");
    card.className = "swatch";

    const colorBlock = document.createElement("div");
    colorBlock.className = "swatch-color";
    colorBlock.style.backgroundColor = hex;

    const info = document.createElement("div");
    info.className = "swatch-info";

    const code = document.createElement("span");
    code.className = "hex";
    code.textContent = hex;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy";
    copyBtn.type = "button";
    copyBtn.textContent = "Salin";

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(hex);
        copyBtn.textContent = "Tersalin!";
        setTimeout(() => copyBtn.textContent = "Salin", 1200);
      } catch {
        statusEl.textContent = "Kode warna: " + hex + " (salin secara manual).";
      }
    });

    info.append(code, copyBtn);
    card.append(colorBlock, info);
    paletteEl.appendChild(card);
  });
}

// Bersihkan gambar dan palet.
resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  preview.removeAttribute("src");
  preview.style.display = "none";
  placeholder.style.display = "block";
  paletteEl.innerHTML = "";
  statusEl.textContent = "Belum ada gambar yang dipilih.";

  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = null;
});
