<?php
// upload.php - Menerima dan menyimpan file yang diunggah

// Konfigurasi upload
$upload_dir = 'uploads/'; // Lokasi penyimpanan file. Pastikan folder ini ada dan memiliki izin tulis!
$max_file_size = 10 * 1024 * 1024; // 10 MB (sesuai dengan JS)
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];

header('Content-Type: application/json'); // Memberi tahu browser bahwa respons adalah JSON

// Periksa apakah ada file yang diunggah
if (isset($_FILES['media_file']) && $_FILES['media_file']['error'] === UPLOAD_ERR_OK) {
    $file_tmp_name = $_FILES['media_file']['tmp_name'];
    $file_name_original = $_FILES['media_file']['name'];
    $file_size = $_FILES['media_file']['size'];
    $file_type = $_FILES['media_file']['type'];

    // Validasi ukuran file
    if ($file_size > $max_file_size) {
        echo json_encode(['success' => false, 'message' => 'Ukuran file terlalu besar. Maksimal ' . ($max_file_size / (1024 * 1024)) . 'MB.']);
        exit();
    }

    // Validasi tipe file
    if (!in_array($file_type, $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'Tipe file tidak didukung. Hanya JPG, PNG, GIF, MP4, WebM.']);
        exit();
    }

    // Buat nama file unik untuk mencegah konflik
    $file_extension = pathinfo($file_name_original, PATHINFO_EXTENSION);
    $new_file_name = uniqid('media_', true) . '.' . $file_extension;
    $destination_path = $upload_dir . $new_file_name;

    // Pindahkan file yang diunggah
    if (move_uploaded_file($file_tmp_name, $destination_path)) {
        // File berhasil disimpan di server
        echo json_encode([
            'success' => true,
            'message' => 'File berhasil diunggah!',
            'file_url' => $destination_path, // Jalur relatif file yang disimpan
            'file_name' => $file_name_original,
            'file_size' => $file_size,
            'file_type' => $file_type
        ]);
    } else {
        // Gagal memindahkan file (mungkin karena izin folder)
        echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file. Periksa izin folder ' . $upload_dir . '.']);
    }
} else {
    // Tidak ada file yang diunggah atau ada error upload PHP
    echo json_encode(['success' => false, 'message' => 'Tidak ada file yang diunggah atau terjadi error: ' . ($_FILES['media_file']['error'] ?? 'Tidak diketahui')]);
}
// Tidak ada tag penutup PHP ?> di sini untuk mencegah masalah output.
