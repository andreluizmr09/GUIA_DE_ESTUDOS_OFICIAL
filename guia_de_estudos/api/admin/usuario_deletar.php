<?php
// api/admin/usuario_deletar.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Authorization');

require_once '../../config/database.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!isAdmin($token)) {
    jsonResponse(['error' => 'Token inválido ou expirado'], 401);
    exit;
}

$id = $_GET['id'] ?? 0;

if (!$id) {
    jsonResponse(['error' => 'ID do usuário é obrigatório'], 400);
    exit;
}

// Verificar se usuário existe antes de deletar
$check = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$check->store_result();

if ($check->num_rows === 0) {
    jsonResponse(['error' => 'Usuário não encontrado'], 404);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

// Deletar usuário (progresso será deletado automaticamente por ON DELETE CASCADE)
$stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    jsonResponse(['message' => 'Usuário deletado com sucesso'], 200);
} else {
    jsonResponse(['error' => 'Erro ao deletar usuário: ' . $stmt->error], 500);
}

$stmt->close();
$conn->close();
?>