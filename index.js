const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const filePreviews = document.getElementById('file-previews');
const galleryGrid = document.getElementById('gallery-grid');
const messageContainer = document.getElementById('message-container');
const noFilesMessage = document.getElementById('no-files-message');
const maxFileSize = 10 * 1024 * 1024; // 10 MB
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
const allowedVideoTypes = ['video/mp4', 'video/webm'];

let uploadedFiles = []; // Array untuk menyimpan simulasi file yang diunggah

// --- Fungsi Utilitas ---
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showMessage(msg, type) {
    messageContainer.innerHTML = `<div class="message-box ${type} show"><span>${msg}</span><button class="close-btn">&times;</button></div>`;
    const closeBtn = messageContainer.querySelector('.close-btn');
    closeBtn.onclick = () => {
        messageContainer.querySelector('.message-box').classList.remove('show');
        setTimeout(() => messageContainer.innerHTML = '', 300);
    };
    setTimeout(() => {
        if (messageContainer.querySelector('.message-box')) {
            messageContainer.querySelector('.message-box').classList.remove('show');
            setTimeout(() => messageContainer.innerHTML = '', 300);
        }
    }, 5000); // Pesan hilang setelah 5 detik
}

// --- Penanganan File (Pratinjau & Unggah Simulasi) ---
function handleFiles(files) {
    filePreviews.innerHTML = ''; // Bersihkan pratinjau lama
    if (files.length === 0) return;

    let validFiles = [];
    for (const file of files) {
        if (file.size > maxFileSize) {
            showMessage(`File '${file.name}' terlalu besar. Maksimal ${formatFileSize(maxFileSize)}.`, 'error');
            continue;
        }
        if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
            showMessage(`File '${file.name}' memiliki tipe yang tidak didukung.`, 'error');
            continue;
        }
        validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Simulasikan unggah untuk setiap file
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.classList.add('file-item');

            let mediaElement;
            if (file.type.startsWith('image/')) {
                mediaElement = document.createElement('img');
                mediaElement.src = e.target.result;
                mediaElement.alt = file.name;
            } else if (file.type.startsWith('video/')) {
                mediaElement = document.createElement('video');
                mediaElement.src = e.target.result;
                mediaElement.controls = true;
                mediaElement.muted = true; // Agar tidak langsung berbunyi
                mediaElement.loop = true;
                mediaElement.preload = 'metadata'; // Load metadata only
            }

            previewItem.appendChild(mediaElement);
            const fileInfo = document.createElement('div');
            fileInfo.classList.add('file-info');
            fileInfo.innerHTML = `<div class="file-name">${file.name}</div><div class="file-size">${formatFileSize(file.size)}</div>`;
            previewItem.appendChild(fileInfo);

            filePreviews.appendChild(previewItem);

            // Simulasi unggah ke "server"
            simulateUpload(file, mediaElement);
        };
        reader.readAsDataURL(file); // Membaca file sebagai Data URL untuk pratinjau
    });
}

function simulateUpload(file, mediaElement) {
    // Simulasi progress bar (opsional, bisa ditambahkan di previewItem)
    const uploadProgress = document.createElement('div');
    uploadProgress.style.height = '4px';
    uploadProgress.style.backgroundColor = '#2ecc71';
    uploadProgress.style.width = '0%';
    uploadProgress.style.position = 'absolute';
    uploadProgress.style.bottom = '0';
    uploadProgress.style.left = '0';
    mediaElement.parentNode.appendChild(uploadProgress);

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        uploadProgress.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            uploadProgress.style.backgroundColor = '#27ae60'; // Warna hijau penuh
            uploadProgress.style.width = '100%';
            showMessage(`'${file.name}' berhasil diunggah!`, 'success');
            
            // Setelah unggah selesai, tambahkan ke galeri
            addFileToGallery(file, mediaElement.src);
            
            // Hapus progress bar setelah beberapa saat
            setTimeout(() => uploadProgress.remove(), 1000);
        }
    }, 100);
}

function addFileToGallery(file, dataUrl) {
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('file-item');

    let mediaElement;
    if (file.type.startsWith('image/')) {
        mediaElement = document.createElement('img');
        mediaElement.src = dataUrl;
        mediaElement.alt = file.name;
    } else if (file.type.startsWith('video/')) {
        mediaElement = document.createElement('video');
        mediaElement.src = dataUrl;
        mediaElement.controls = true;
        mediaElement.muted = true; // Agar tidak langsung berbunyi
        mediaElement.loop = true;
        mediaElement.preload = 'metadata';
    }

    galleryItem.appendChild(mediaElement);
    const fileInfo = document.createElement('div');
    fileInfo.classList.add('file-info');
    fileInfo.innerHTML = `<div class="file-name">${file.name}</div><div class="file-size">${formatFileSize(file.size)}</div>`;
    galleryItem.appendChild(fileInfo);

    // Tambahkan overlay delete
    const deleteOverlay = document.createElement('div');
    deleteOverlay.classList.add('delete-overlay');
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.textContent = 'Hapus';
    deleteButton.onclick = () => deleteFile(galleryItem, file.name); // Hapus dari DOM dan array
    deleteOverlay.appendChild(deleteButton);
    galleryItem.appendChild(deleteOverlay);

    galleryGrid.appendChild(galleryItem);
    uploadedFiles.push({ name: file.name, src: dataUrl, element: galleryItem }); // Simpan referensi
    updateNoFilesMessage();
}

function deleteFile(itemElement, fileName) {
    if (confirm(`Apakah Anda yakin ingin menghapus '${fileName}'?`)) {
        itemElement.remove();
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        showMessage(`'${fileName}' berhasil dihapus.`, 'success');
        updateNoFilesMessage();
    }
}

function updateNoFilesMessage() {
    if (uploadedFiles.length === 0) {
        noFilesMessage.style.display = 'block';
    } else {
        noFilesMessage.style.display = 'none';
    }
}

// --- Event Listeners ---
// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// File Input Change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Sidebar Navigation
document.querySelectorAll('aside nav ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Hapus kelas aktif dari semua link
        document.querySelectorAll('aside nav ul li a').forEach(l => l.classList.remove('active'));
        // Tambahkan kelas aktif ke link yang diklik
        e.currentTarget.classList.add('active');

        // Tampilkan/sembunyikan view yang sesuai
        document.querySelectorAll('.content-view').forEach(view => {
            view.style.display = 'none';
        });
        const targetViewId = e.currentTarget.dataset.view;
        if (targetViewId) {
            document.getElementById(targetViewId).style.display = 'block';
            if (targetViewId === 'gallery') {
                updateNoFilesMessage(); // Perbarui pesan 'belum ada media' saat masuk galeri
            }
        }
    });
});

// Inisialisasi: tambahkan pesan belum ada media di galeri saat pertama kali load
document.addEventListener('DOMContentLoaded', updateNoFilesMessage);