<?php
// api/pular.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Credentials: true');

require_once '../config/database.php';

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Faça login primeiro'], 401);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$curso_id = $data['curso_id'] ?? 0;

if (!$curso_id) {
    jsonResponse(['error' => 'curso_id é obrigatório'], 400);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

// Verificar se já existe
$check = $conn->prepare("SELECT id FROM progresso_usuario WHERE usuario_id = ? AND curso_id = ?");
$check->bind_param("ii", $usuario_id, $curso_id);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    $stmt = $conn->prepare("UPDATE progresso_usuario SET status = 'pulado', data_modificacao = NOW() WHERE usuario_id = ? AND curso_id = ?");
} else {
    $stmt = $conn->prepare("INSERT INTO progresso_usuario (usuario_id, curso_id, status) VALUES (?, ?, 'pulado')");
}

$stmt->bind_param("ii", $usuario_id, $curso_id);

if ($stmt->execute()) {
    jsonResponse(['message' => 'Curso pulado'], 200);
} else {
    jsonResponse(['error' => 'Erro ao pular curso: ' . $stmt->error], 500);
}

$check->close();
$stmt->close();
$conn->close();
?>